#!/usr/bin/env -S node --import tsx
/** Generate review mockups through the same renderer as the live Explorer.
 * Reads/writes through the authorized MCP only. Default: local preview, no writes.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import path from "node:path";
import {
  connect,
  uploadDocument,
} from "../../../scripts/upload-sancho-document.mjs";
import {
  renderLanding,
  landingModel,
} from "../../../src/lib/foundation-data/landing";
import type { FoundationSnapshot } from "../../../src/lib/foundation-data/read-model";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function call(
  client: Client,
  name: string,
  args: Record<string, unknown>,
) {
  const result = (await client.callTool({
    name,
    arguments: args,
  })) as CallToolResult;
  if (result.isError) throw new Error(`mcp_tool_failed_${name}`);
  const payload =
    result.structuredContent ??
    JSON.parse(
      result.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n"),
    );
  if (!payload || payload.ok === false)
    throw new Error(`mcp_tool_failed_${name}`);
  return payload;
}
export async function readSnapshot(
  client: Client,
  brand: string,
): Promise<FoundationSnapshot> {
  const snapshot: FoundationSnapshot = {
    audiences: [],
    records: [],
    companies: [],
    authority: "tables",
  };
  for (const table of [
    "niches",
    "message",
    "evaluation",
    "positioning",
    "problem",
    "asset",
    "evidence",
    "criterion",
  ]) {
    let afterId: string | undefined;
    const seen = new Set<string>();
    for (let page = 0; ; page++) {
      if (page >= 10000) throw new Error("table_pagination_limit");
      const result = await call(client, "sancho_table_list", {
        brandSlug: brand,
        input: {
          table,
          includeArchived: false,
          limit: 200,
          ...(afterId ? { afterId } : {}),
        },
      });
      if (!Array.isArray(result.rows))
        throw new Error("table_response_invalid");
      for (const row of result.rows) {
        if (!row.id || !Number.isInteger(row.version) || seen.has(row.id))
          throw new Error("table_rows_invalid_or_repeated");
        seen.add(row.id);
        if (table === "niches") snapshot.audiences.push(row);
        else snapshot.records.push(row);
      }
      if (result.nextAfterId === null) break;
      if (
        typeof result.nextAfterId !== "string" ||
        result.nextAfterId === afterId ||
        !seen.has(result.nextAfterId)
      )
        throw new Error("table_pagination_invalid");
      afterId = result.nextAfterId;
    }
  }
  return snapshot;
}
const fingerprint = (snapshot: FoundationSnapshot) =>
  JSON.stringify(
    [...snapshot.audiences, ...snapshot.records]
      .map((r) => [r.id, r.version])
      .sort(),
  );
const digest = (content: string) =>
  createHash("sha256").update(content).digest("hex");
export function landingTargets(snapshot: FoundationSnapshot, brand: string) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(brand))
    throw new Error("brand_slug_invalid");
  return snapshot.audiences
    .filter((a) => a.profile.kind === "ECP" && a.profile.status !== "archived")
    .flatMap((a) => {
      const positions = snapshot.records.filter(
        (r) =>
          r.data.kind === "positioning" &&
          r.data.scope === "niche" &&
          r.data.nicheId === a.id &&
          r.data.status !== "archived",
      );
      if (!positions.length) return [];
      if (positions.length !== 1)
        throw new Error("niche_positioning_ambiguous");
      const position = positions[0];
      if (position.data.kind !== "positioning")
        throw new Error("positioning_invalid");
      // Stable identity avoids name collisions/renames. Preserve an existing canonical path.
      const folder = a.id;
      const docPath =
        position.data.landingPath ??
        `brand/${brand}/go-to-market/landings/${folder}/${folder}.current.html`;
      if (
        !docPath.startsWith(`brand/${brand}/go-to-market/landings/`) ||
        !docPath.endsWith(".html") ||
        docPath.includes("..")
      )
        throw new Error("landing_path_outside_canonical_scope");
      return [{ audienceId: a.id, position, docPath }];
    });
}
export async function buildLandings({
  client,
  brand,
  output,
  snapshot,
  designMd,
  write = false,
}: {
  client?: Client;
  brand: string;
  output: string;
  snapshot: FoundationSnapshot;
  designMd?: string;
  write?: boolean;
}) {
  if (write && !client) throw new Error("publication_requires_mcp");
  const targets = landingTargets(snapshot, brand);
  if (!targets.length) throw new Error("no_worked_niches");
  if (new Set(targets.map((t) => t.docPath)).size !== targets.length)
    throw new Error("landing_paths_not_unique");
  const links: Record<string, string> = {};
  const receipts: Record<string, unknown>[] = [];
  await mkdir(output, { recursive: true, mode: 0o700 });
  const save = async () =>
    writeFile(
      path.join(output, "receipts.json"),
      JSON.stringify(receipts, null, 2),
      { mode: 0o600 },
    );
  const render = async (target: (typeof targets)[number]) => {
    const content = renderLanding(
      snapshot,
      brand,
      target.audienceId,
      designMd,
      { review: true, shareLinks: links },
    );
    const file = path.join(output, `${target.audienceId}.html`);
    await writeFile(file, content, { mode: 0o600 });
    return { content, file };
  };
  if (
    write &&
    fingerprint(await readSnapshot(client!, brand)) !== fingerprint(snapshot)
  )
    throw new Error("foundation_changed_regenerate_before_publication");
  for (const target of targets) {
    const { content, file } = await render(target);
    const model = landingModel(snapshot, target.audienceId);
    receipts.push({
      audienceId: target.audienceId,
      docPath: target.docPath,
      sha256: digest(content),
      dryRun: !write,
      hero: !!model.hero,
      blocks: model.blocks.length,
      pains: model.pains.length,
      proofs: model.proofs.length,
      faqs: model.faqs.length,
    });
    await save();
    if (write) {
      await uploadDocument(client!, {
        file,
        brand,
        path: target.docPath,
        write: true,
        create: true,
        expectedSha: undefined,
      });
      receipts.push({
        audienceId: target.audienceId,
        phase: "initial_document_verified",
      });
      await save();
    }
  }
  if (write) {
    // Share only after every document exists. Keep each receipt if a later step fails.
    for (const target of targets) {
      const share = await call(client!, "sancho_share_create_link", {
        brandSlug: brand,
        docPath: target.docPath,
        access: "comment",
        linkType: "live",
        expiresInHours: 2160,
      });
      if (
        share.access !== "comment" ||
        share.usedFallback ||
        !share.url ||
        !share.expiresAt
      )
        throw new Error("share_response_invalid");
      links[target.audienceId] = share.url;
      receipts.push({
        audienceId: target.audienceId,
        phase: "share_created",
        url: share.url,
        expiresAt: share.expiresAt,
      });
      await save();
    }
    for (const target of targets) {
      const { file } = await render(target);
      await uploadDocument(client!, {
        file,
        brand,
        path: target.docPath,
        write: true,
        create: false,
        expectedSha: undefined,
      });
      receipts.push({
        audienceId: target.audienceId,
        phase: "navigation_verified",
      });
      await save();
      // CAS against the version used by the model. Never overwrite other fields.
      if (
        target.position.data.kind === "positioning" &&
        target.position.data.landingPath !== target.docPath
      ) {
        await call(client!, "sancho_table_mutate", {
          brandSlug: brand,
          input: {
            table: "positioning",
            operation: "update_fields",
            id: target.position.id,
            expectedVersion: target.position.version,
            fields: { landingPath: target.docPath },
            reason: "Publicar maqueta de revisión del nicho desde las tablas",
          },
        });
      }
      const readback = await call(client!, "sancho_table_get", {
        brandSlug: brand,
        input: { table: "positioning", id: target.position.id },
      });
      if (readback.row?.data?.landingPath !== target.docPath)
        throw new Error("landing_path_readback_failed");
      receipts.push({
        audienceId: target.audienceId,
        phase: "landing_path_verified",
      });
      await save();
    }
  }
  return receipts;
}
async function main() {
  let client: Client | undefined;
  try {
    const { values } = parseArgs({
      options: {
        brand: { type: "string" },
        output: { type: "string" },
        snapshot: { type: "string" },
        design: { type: "string" },
        write: { type: "boolean", default: false },
      },
    });
    if (!values.brand || !values.output || (values.write && values.snapshot))
      throw new Error("brand_output_required_offline_is_preview_only");
    if (!values.snapshot) client = await connect(process.env);
    const snapshot = values.snapshot
      ? JSON.parse(await readFile(values.snapshot, "utf8"))
      : await readSnapshot(client!, values.brand);
    let designMd: string | undefined;
    if (values.design) designMd = await readFile(values.design, "utf8");
    else if (client) {
      const doc = await call(client, "sancho_get_document", {
        brandSlug: values.brand,
        docPath: `brand/${values.brand}/brand-book/visual-identity/DESIGN.md`,
        maxChars: 100000,
      });
      if (doc.usedFallback || doc.truncated || typeof doc.content !== "string")
        throw new Error("design_read_incomplete_no_fallback");
      designMd = doc.content;
    }
    const receipts = await buildLandings({
      client,
      brand: values.brand,
      output: values.output,
      snapshot,
      designMd,
      write: values.write,
    });
    console.log(JSON.stringify({ ok: true, dryRun: !values.write, receipts }));
  } catch {
    // SDK and response bodies can contain credentials or private content.
    console.error(
      JSON.stringify({
        ok: false,
        error:
          "landing_build_failed_check_private_receipts_do_not_retry_writes_blindly",
      }),
    );
    process.exitCode = 1;
  } finally {
    await client?.close().catch(() => {});
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();

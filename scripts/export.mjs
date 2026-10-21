#!/usr/bin/env node
// Copia las skills de curation.json desde el repo privado de Sancho, aplica las
// anonimizaciones declaradas y regenera catalog.json y los ZIP de dist/.
//
// Uso: node scripts/export.mjs --source ~/PROJECTS/sanchocmo-openclaw
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const source = path.resolve(args[args.indexOf('--source') + 1] || '');
if (!fs.existsSync(path.join(source, 'skills'))) {
  console.error('Falta --source <checkout de sanchocmo-mcp>');
  process.exit(2);
}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const yaml = createRequire(path.join(source, 'package.json'))('js-yaml');
const curation = JSON.parse(fs.readFileSync(path.join(root, 'curation.json'), 'utf8'));
// Las skills se publican tal cual. Si alguna vez hace falta anonimizar un texto, va en
// redactions.private.json (no se publica, porque cita el original).
const redactionsPath = path.join(root, 'redactions.private.json');
const redactions = fs.existsSync(redactionsPath) ? JSON.parse(fs.readFileSync(redactionsPath, 'utf8')).redactions : {};
const SKIP = new Set(['__pycache__', 'node_modules', '.DS_Store']);

const git = (...a) => execFileSync('git', ['-C', source, ...a], { encoding: 'utf8' }).trim();

function copyDir(from, to) {
  const files = [];
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.endsWith('.pyc')) continue;
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) files.push(...copyDir(a, b).map((f) => path.join(e.name, f)));
    else { fs.copyFileSync(a, b); files.push(e.name); }
  }
  return files;
}

fs.rmSync(path.join(root, 'skills'), { recursive: true, force: true });
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

const catalog = [];
for (const c of curation.skills) {
  const src = path.join(source, 'skills', c.slug);
  const dst = path.join(root, 'skills', c.slug);
  const files = copyDir(src, dst).sort();

  const own = redactions[c.slug] || [];
  for (const r of own) {
    const p = path.join(dst, r.file);
    const text = fs.readFileSync(p, 'utf8');
    if (!text.includes(r.from)) throw new Error(`${c.slug}/${r.file}: no encuentro el texto a anonimizar`);
    fs.writeFileSync(p, text.split(r.from).join(r.to));
  }
  const md = fs.readFileSync(path.join(dst, 'SKILL.md'), 'utf8');

  const fm = yaml.load(md.match(/^---\n([\s\S]*?)\n---/)[1]) || {};
  const meta = fm.metadata || {};
  const all = files.map((f) => fs.readFileSync(path.join(dst, f), 'utf8')).join('\n');
  const sanchoTools = [...new Set(all.match(/\bsancho_[a-z_]+/g) || [])].sort();
  const commit = git('log', '-1', '--format=%H', '--', `skills/${c.slug}`);

  execFileSync('zip', ['-qr', path.join(root, 'dist', `${c.slug}.zip`), c.slug], { cwd: path.join(root, 'skills') });

  catalog.push({
    slug: c.slug,
    name: fm.name || c.slug,
    title: c.title || fm.name || c.slug,
    description: String(fm.description || '').trim(),
    area: c.area,
    agent: c.agent,
    output: c.output,
    version: meta.version != null ? String(meta.version) : null,
    updated: meta.updated || git('log', '-1', '--format=%cs', '--', `skills/${c.slug}`),
    userInvocable: fm['user-invocable'] !== false,
    contextRequired: fm.context_required || [],
    contextOptional: fm.context_optional || [],
    sanchoTools,
    requiresSancho: sanchoTools.length > 0 || (fm.context_required || []).length > 0,
    hasScripts: files.some((f) => /\.(py|mjs|cjs|js|mts|ts|sh)$/.test(f)),
    files,
    bytes: files.reduce((s, f) => s + fs.statSync(path.join(dst, f)).size, 0),
    source: { commit: commit.slice(0, 12), path: `skills/${c.slug}` },
    redacted: own.length,
    evidence: fs.existsSync(path.join(root, 'evidence', c.slug)) ? `evidence/${c.slug}` : null,
  });
}

fs.writeFileSync(
  path.join(root, 'catalog.json'),
  JSON.stringify({ repo: curation.repo, generatedAt: new Date().toISOString().slice(0, 10), skills: catalog }, null, 2) + '\n',
);
console.log(`${catalog.length} skills exportadas, ZIP en dist/`);

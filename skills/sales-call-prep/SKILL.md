---
name: sales-call-prep
description: "Prepares daily and weekly sales-call briefings from Sancho's Nango-backed CRM read model and approved local intelligence."
user-invocable: true
metadata:
  author: Alfonso Sainz de Baranda (Growth4U)
  version: '3.0'
  system: SanchoCMO
  phase: Encuentra
  pillar: lead-tracking
  layer: 0+4
  depends_on: [lead-intelligence-hub]
context_required:
  - brand/{slug}/lead-tracking-config.json
  - brand/{slug}/leads/
context_writes: []
---

# Sales Call Prep

Produces a Friday weekly overview and a nightly briefing for the next day.

## Credential and data boundary

GoHighLevel is read only through Sancho's authenticated Sales Engine endpoint, which resolves the
tenant connection from Nango server-side:

```text
GET /api/metrics/sales-engine-leads?slug=<client>&stage=<leads|meetings|opportunities|won>&bucket=total&from=YYYY-MM-DD&to=YYYY-MM-DD
```

Never read a CRM credential from environment variables, config files, arguments or chat, and never
call the provider endpoint. If Sancho reports `configured:false`, stop with
`ghl_nango_connection_required` and direct the operator to **Settings > APIs > GoHighLevel > Connect**.
`locationId` and timezone are non-secret canonical config.

Sancho does not currently expose a reviewed Calendar read broker. Ask the user to paste or export
the events for the requested interval. If events are not provided, stop with
`google_calendar_nango_broker_unavailable`; do not create an alternate credential path.

## Modes

- Daily, Sunday through Thursday: tomorrow from 00:00 through 23:59 in the client's timezone.
- Weekly, Friday: Monday through Friday of the following week.

## Workflow

1. Read the relevant lead, meeting and opportunity rows from the Sales Engine endpoint. Use only
   rows returned for the requested client and date window.
2. Normalize the manually supplied calendar events. Match title and attendee names against CRM
   rows case-insensitively, ignoring accents. A partial name is acceptable only when unambiguous.
3. Enrich each match from `brand/{slug}/leads/{crm_id}.md`. Do not invent missing history.
4. Infer the meeting objective from event title, pipeline stage and the latest persisted notes.
5. Include unmatched events separately so an operator can resolve them without cross-tenant data.

## Daily output

```markdown
📞 LLAMADAS DE MAÑANA | {date}

### {time} | {name}, {company}
- Estado: {pipeline_stage}
- Última interacción: {summary_or_first_interaction}
- Objetivo: {meeting_objective}
- Perfil: brand/{slug}/leads/{crm_id}.md
```

## Weekly output

Group calls by weekday and include time, lead, company, meeting type and total call count. Clearly
label events with no unambiguous CRM match.

## Publishing

Publish only through `POST /api/integrations/publish` with `cronKey: sales_call_prep`. The local
server resolves the configured transport and channel. Never call Slack or Discord directly and
never hardcode a channel ID.

## Failure handling

- Sales Engine 400 with `configured:false`: connect GoHighLevel in Sancho Settings.
- Sales Engine 503: Nango is temporarily unavailable, fail closed and do not use cached identity
  data as if it were current.
- Calendar input absent: report the broker gap and stop.
- Missing lead file: use the Sancho CRM row and label intelligence as unavailable.
- Publish failure: record the error and do not retry blindly.

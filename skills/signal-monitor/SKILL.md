---
name: signal-monitor
description: Monitor signals and alert on triggers.
user-invocable: false
metadata:
  author: Alfonso Sainz de Baranda (Growth4U)
  version: '1.0'
  system: SanchoCMO
  phase: Encuentra (one-to-one)
  depends_on: signal-definition
  chains_to: decision-maker-finder, contact-enrichment, outreach-sequence-builder
context_required:
- brand/{slug}/company-brief/company-brief.current.md
- brand/{slug}/go-to-market/ecps/ecps.current.md
- brand/{slug}/go-to-market/ecps/ecps.current.md
context_writes:
- brand/{slug}/campaigns/
- brand/{slug}/operational/learnings.md
---

# Signal Monitor — Execute Detection & Enrichment

> "Passive monitoring finds companies. Active monitoring finds HOT leads ready to buy."

Este skill es **STEP 1** del Signal Detection workflow. Lee signals-to-track.json y EJECUTA el monitoreo.

> **Sancho execution boundary:** no reviewed Apify or premium-data operation is exposed for this skill. Never connect to a provider directly or read provider keys from env/config/argv. Run only the LIGHT path with public RSS/WebSearch. Actor-based material is methodology reference and fails closed as `signal_provider_broker_unavailable`.

Read ./brand/ per _system/intelligence/brand-memory.md (if using SanchoCMO framework)
Follow _system/output/output-format.md (if using SanchoCMO framework)

---

## Prerequisites

**Required:**
- signals-to-track.json (from /signal-definition)
- Public RSS/WebSearch access. Provider-backed automation remains unavailable until a reviewed Sancho broker exists.

**Recommended:**
- CRM access (to add hot leads automatically)
- A reviewed Sancho alert operation (for real-time alerts)

---

## Workflow

### Step 0: Tool Detection (Automatic)

**Check for a reviewed Sancho Apify broker:**

```
IF reviewed Sancho Apify broker is available:
  mode = "FULL" (automated monitoring via actors)
ELSE:
  mode = "LIGHT" (RSS feeds + webhooks + manual)
```

**Present:**

```
🔍 TOOL DETECTION

Sancho Apify broker: ✅ Connected
Mode: FULL automation (daily/weekly cron jobs)
Est. hot leads: 50-100/month
Cost: ~$60/month

OR

Sancho Apify broker: ⚠️ Unavailable
Mode: LIGHT (RSS + webhooks)
Est. hot leads: 10-20/month
Cost: $0/month

Provider automation remains unavailable until Sancho exposes a reviewed Nango-backed broker.
```

### Step 1: Load Signals Config

```
Read: brand/{slug}/operational/signals-to-track.json

Extract per signal:
  ├─ Signal type + category
  ├─ Urgency + qualification scores
  ├─ Data source (API, scraping)
  ├─ Monitoring frequency
  └─ Alert threshold
```

### Step 2: Execute Monitoring by Frequency

**Real-time signals** (webhooks - same for both modes):
- PostHog events → pricing page visits
- Slack/email alerts → configured triggers

**FULL mode (reviewed Sancho operation available):**

Daily signals (cron 6am):
  ├─ Run the typed hiring-signal operation
  ├─ Run the typed public-social-signal operation
  ├─ Query company signals through the broker
  └─ Automated enrichment

Weekly signals (cron Monday 9am):
  ├─ Run the typed review-signal operation
  ├─ Run the typed company-signal operation
  └─ Tech stack detection

**LIGHT mode (Apify NOT available):**

Daily signals (manual or RSS):
  ├─ Crunchbase RSS feed (limited)
  ├─ Twitter search (manual weekly)
  └─ LinkedIn job alerts (RSS if available)

Weekly signals (manual):
  ├─ G2 review check (manual)
  ├─ LinkedIn company updates (manual)
  └─ Tech stack: BuiltWith free lookups (50/month)

### Step 3: Filter by ICP

```python
for company in detected_companies:
    if company.size < icp.min_employees:
        disqualify("Too small")
    if company.industry not in icp.industries:
        disqualify("Wrong vertical")
    if company in negative_signals:
        disqualify("Negative signal")
    else:
        qualify(company)
```

### Step 4: Score & Prioritize

```python
for lead in qualified_leads:
    lead.score = calculate_signal_score(lead.signals)

    if lead.score >= 90:
        lead.tier = "HOT"
        lead.action = "Contact immediately"
    elif lead.score >= 70:
        lead.tier = "WARM"
        lead.action = "Nurture sequence"
    else:
        lead.tier = "COLD"
        lead.action = "Long-term monitor"
```

### Step 5: Enrich Contacts

For HOT + WARM leads:
1. Find decision maker from public data or a reviewed Sancho operation
2. Get email through the tenant's sanctioned enrichment operation, or manually
3. Get LinkedIn profile URL
4. Verify ICP fit (double-check)

### Step 6: Output & Alert

Write to: `brand/{slug}/operational/hot-leads.json`

Publish through a reviewed Sancho alert operation if configured. Otherwise write the result only and report `signal_alert_operation_unavailable` without attempting a webhook.
```
🔥 HOT LEAD DETECTED

Company: Example Corp
Signal: Posted "frustrated with [Competitor]" on Twitter
Score: 95 (Urgency: 10, Qual: 9)

Decision Maker: John Doe, VP Sales
Email: john@example.com
LinkedIn: linkedin.com/in/johndoe

Recommended: Contact within 24h
Sequence: Competitor Pain Point → Our Solution
```

---

## Integration

**Reads:** brand/{slug}/operational/signals-to-track.json
**Writes:** brand/{slug}/operational/hot-leads.json, ./brand/{slug}/operational/assets.md
**Chains to:** /decision-maker-finder, /contact-enrichment, /outreach-sequence-builder

---

## Signal design references

**Primary:**
- [apify-actors-for-signals.md](skills/signal-monitor/references/apify-actors-for-signals.md) - payload and output methodology only
- [monitoring-tools.md](skills/signal-monitor/references/monitoring-tools.md) - alternative public and manual sources

---

*Monitor smart. Enrich fast. Reach out at the perfect time.*

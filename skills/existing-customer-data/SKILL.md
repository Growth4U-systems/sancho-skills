---
name: existing-customer-data
description: "Analyze existing customer/CRM data: RFM segmentation, behavioral clustering, churn patterns, LTV analysis, upgrade patterns. OPTIONAL pillar — skip if pre-launch, no CRM access, or <50 customers. Use when: client has >50 customers with CRM data available and wants data-driven ICP refinement, churn reduction, or segment optimization. Produces Champions profile, RFM segments, churn patterns, LTV by segment, and actionable recommendations for ICP/positioning/content. NOT for: pre-launch companies, assumption-based ICP (use niche-discovery-100x), or general market research (use market-intelligence)."
metadata:
  author: Alfonso Sainz de Baranda (Growth4U)
  version: '2.1'
  system: SanchoCMO
  phase: '1'
  pillar: '7'
  optional: true
  skip_if: pre-launch OR no CRM access OR < 50 customers
  updated: '2026-09-24'
  changes: v2.1. Paso final obligatorio (Step 7) que guarda el ICP de los Champions como candidato en el registro de audiencias con sancho_table_mutate, con evidencia agregada y sin datos personales. v2 — Restructured per skill-creator principles. SKILL.md lean (~110 lines). References created.
context_required:
- brand/{slug}/company-brief/company-brief.current.md
- brand/{slug}/go-to-market/ecps/ecps.current.md
- brand/{slug}/go-to-market/ecps/ecps.current.md
context_writes:
- brand/{slug}/go-to-market/existing-customer-data/existing-customer-data.current.md
# Capacidades (SAN-661): NINGUNA. Auditada y sin dependencia externa —
# Option A = CSV aportado por el cliente; Option B ya esta modelada con skip_if.
# La ausencia de capabilities_* es deliberada; declarar de mas bloquearia un turno que hoy funciona.

---

# Existing Customer Data — Customer Intelligence (OPTIONAL)

> **OPTIONAL** — Skip if pre-launch or no CRM. Analiza customer data para identificar best customers, segments, churn patterns, y upgrade triggers.

**Input**: CRM export / API / manual summary (>50 customers)
**Output**: Customer intelligence → `brand/{slug}/customer-data/customer-data.current.md`

Lee `skills/_shared/foundation-data.md` antes de operar: `table=niches` para ICP/nichos; `create` y `update_fields` reciben `fields`, y `set_state` recibe `state`. Los estados son Pendiente/Listo/Archivado.

## References

| Archivo | Cuándo leer | Contenido |
|---------|------------|-----------|
| [hydration.md](skills/existing-customer-data/references/hydration.md) | **SIEMPRE** — Step 0 obligatorio | Mapeo de campos upstream → esta skill |
| [prompt.md](skills/existing-customer-data/references/prompt.md) | **SIEMPRE** — fuente de verdad | Template de output completo |
| [checklist.md](skills/existing-customer-data/references/checklist.md) | **Antes de entregar** — self-QA | Ítems de verificación |
| [concepts.md](skills/existing-customer-data/references/concepts.md) | Si necesitas RFM, clustering, churn methodology | Métodos, skip conditions, edge cases |
| [schema.md](skills/existing-customer-data/references/schema.md) | Si necesitas el schema de campos | Estructura de datos |

---

## Flujo de Ejecución

### 0. Context Hydration (OBLIGATORIO — antes de cualquier pregunta)
- Lee `_system/skills/context-hydration-protocol.md` para el patrón genérico
- Lee `skills/existing-customer-data/references/hydration.md` para el mapeo específico de esta skill
- Lee TODOS los docs en `context_required`
- Pre-rellena campos según hydration_map
- Presenta datos heredados al usuario: "De [fuente] ya tengo X. ¿Correcto?"
- Solo pregunta campos listados en "Campos genuinamente nuevos"

### 1. Check Prerequisites
- Customer count > 50, CRM access, minimum fields (email, signup, plan, MRR)
- Si NO se cumplen → mark as `skipped`, proceed without this pillar

### 2. Obtain Data
- **Option A**: CRM Export (CSV) — user provides
- **Option B**: CRM API (HubSpot/Salesforce/Pipedrive)
- **Option C**: Manual Summary — limited analysis

### 3. Execute Analysis (ver `skills/existing-customer-data/references/concepts.md` para detalles)
- **RFM Segmentation**: Classify into Champions, Loyal, At Risk, Lost, New
- **Best Customer Profile**: Identify Champions characteristics (tier, size, industry, use case)
- **Behavioral Clustering**: 3-5 clusters by usage patterns
- **Churn Patterns**: When, why, who, triggers, early warning signals
- **LTV Analysis**: Per segment, payback period
- **Upgrade Patterns**: Free→paid conversion, tier progression triggers

### 4. Generate Recommendations
- **ICP refinement**: Focus on Champions segment characteristics
- **Positioning**: What Champions value → use in messaging
- **Content strategy**: Address churn triggers
- **Outreach**: Target lookalikes of Champions

### 5. Self-QA (OBLIGATORIO)
- Lee `skills/existing-customer-data/references/checklist.md`
- **Privacy check**: 0 PII in output (aggregated only)
- **0 ❌** antes de entregar
- Metadata: `<!-- Self-QA: PASS | fecha | items: X✅ Y⚠️ 0❌ -->`

### 6. Guardar con versionado
- Ruta: `brand/{slug}/customer-data/customer-data.current.md`
- Backup + versionado + history.json
- Link: `<MC_BASE>/docs/brand/{slug}/customer-data/customer-data.current.md`

### 7. Registro de audiencias (OBLIGATORIO, paso final)
- El documento no basta: niche-discovery, posicionamiento, SEO y outbound leen el ICP del registro de audiencias
- Si la skill se saltó en el Step 1, no se escribe nada
- Lee el registro entero con `sancho_table_list` hasta `nextAfterId: null` y los criterios con `sancho_table_get`. Un fallo de lectura no es un registro vacío: para y dilo
- Guarda el ICP de los Champions con `sancho_table_mutate` (`table=niches`, `operation=create|update_fields`, campos en `fields`):
  - Fila `pending` de ese ICP (su `source` cita el documento de customer data) → edítala con su `id` y su versión como `expectedVersion`
  - Fila `ready` o `archived` → edita los campos autorizados con versión actual; una fila archivada conserva ese estado
  - Sin fila → créala con un UUID nuevo y `expectedVersion: 0`; un reintento usa el mismo UUID
- Campos: `kind: "ICP"`, `name`, `audience` (a quién designa el perfil de Champions), `inclusion` (los rasgos que comparten: tier, tamaño, industria, caso de uso), `exclusion` (los rasgos que el análisis de churn o de LTV descarta), `roles` y `markets` si los datos los traen, `problems` (casos de uso y disparadores de upgrade), `evidence` con cifras agregadas (tamaño de la muestra, peso en clientes y en MRR, LTV, fecha del export), en `source` la ruta del documento del Step 6 y el origen de los datos (export CSV, API del CRM o resumen manual). Cada lista admite hasta 40 elementos. En `reason`, esta skill y la tarea
- `validation`: `validated` solo si el análisis salió de datos reales (Option A o B), con `evidence` y `reviewedAt` (fecha del export); con resumen manual (Option C), `hypothesis`
- **Nunca datos personales ni nombres de clientes** en ningún campo: solo agregados, igual que el documento
- Un conflicto de versión exige releer, nunca crear otra fila
- En la entrega, da el ID guardado y enlaza su estado en `/dashboard/{slug}/audiences`. Un guardado que falla se declara pendiente, nunca hecho

---

## Cross-Pillar Data Flow

| Dato | Lo consume |
|------|-----------|
| Champions profile (registro de audiencias, `kind: "ICP"`) | niche-discovery-100x (ICP criteria) |
| Segment characteristics | positioning-messaging (proof points) |
| Churn triggers | content strategy (topics), email-sequences |
| LTV by segment | budget-constraints (pricing tiers) |
| Upgrade patterns | funnel design (activation triggers) |

---

## 🔬 Profundizar con Deep Research

Al entregar, añade:

```
📊 **¿Quieres profundizar?**
→ Escribe **"profundizar"** para continuar.
```

---

## 📁 Almacenamiento (OBLIGATORIO)

```
brand/{{slug}}/customer-data/
├── customer-data.current.md      ← versión activa
├── v1.md, v2.md... ← versiones anteriores
├── history.json    ← log de versiones
└── qa-log.md       ← historial de QA
```

1. Identifica slug desde systemPrompt
2. Si existe `customer-data.current.md` → backup como `v{N+1}.md`
3. Si no existe → crea carpeta + `customer-data.current.md` + `v1.md` + `history.json`
4. Link: `<MC_BASE>/docs/brand/{slug}/customer-data/customer-data.current.md`

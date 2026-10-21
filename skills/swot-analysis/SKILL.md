---
name: swot-analysis
description: "SWOT analysis + TOWS strategies + ICE prioritization from upstream intelligence. Use when: building strategic analysis from self-intelligence, competitor-intelligence, and market-intelligence data. Produces evidence-based 4-quadrant SWOT, TOWS cross-strategies (SO/ST/WO/WT), and ICE-prioritized action plan. Requires at least Lite-done: self-intelligence (confirmed S/W), competitor-intelligence (per-competitor synthesis, vulnerabilities), market-intelligence (trends, TAM). NOT for: general market analysis (use market-intelligence), competitor deep-dives (use competitor-intelligence), or niche selection (use niche-discovery-100x)."
metadata:
  author: Alfonso Sainz de Baranda (Growth4U)
  version: '3.0'
  system: SanchoCMO
  phase: '1'
  pillar: swot-analysis
  layer: '3'
  depends_on: self-intelligence, competitor-intelligence, market-intelligence
  updated: '2026-02-27'
  changes: v3 — Restructured per skill-creator principles. SKILL.md lean (~120 lines). Concepts moved to references.
context_required:
- brand/{slug}/market-and-us/self/self.current.md
- brand/{slug}/market-and-us/competitors/competitors.current.md
- brand/{slug}/market-and-us/market/market.current.md
context_writes:
- brand/{slug}/market-and-us/swot/swot.current.md
---

# SWOT Analysis & TOWS Strategies

> Sintetiza intelligence upstream en SWOT con evidencia, estrategias TOWS cruzadas, y plan de acción ICE-priorizado.

**Input**: self-intelligence + competitor-intelligence + market-intelligence
**Output**: SWOT + TOWS + Action Plan → `brand/{slug}/market-and-us/swot/swot.current.md`

## ⛔ Gate de escritura — obligatorio antes de guardar (SAN-949)

Este documento lo lee un cliente. Antes de `sancho_update_document` / `sancho_patch_document`, pásale las seis pruebas y **despacha `de-slop` a Sansón** (`sancho_get_skill de-slop`). El generador no se juzga a sí mismo.

1. La primera frase de cada párrafo se entiende a la primera y no pasa de línea y media.
2. Ningún párrafo de más de cuatro líneas.
3. En cualquier bloque de diez frases, la más corta ≤ 8 palabras y la más larga ≥ 25.
4. Cada patrón dentro de su presupuesto (los 22 están en `skills/de-slop/references/patrones-es.md`).
5. Ninguna sección más larga que la evidencia que la sostiene.
6. La tesis cabe en una línea y está en la primera pantalla.

**Método y límites van al final, nunca al principio.** Nada de tandas, rondas, batches ni «antes decía X». La pasada **recoloca** el detalle a la columna de evidencia: nunca lo borra. Si el documento sale más corto habiendo perdido un dato, ha fallado la pasada.

## References

| Archivo | Cuándo leer | Contenido |
|---------|------------|-----------|
| [hydration.md](skills/swot-analysis/references/hydration.md) | **SIEMPRE** — Step 0 obligatorio | Mapeo de campos upstream → esta skill |
| [prompt.md](skills/swot-analysis/references/prompt.md) | **SIEMPRE** — fuente de verdad | CoT prompt completo para ejecución |
| [checklist.md](skills/swot-analysis/references/checklist.md) | **Antes de entregar** — self-QA | Ítems de verificación por step |
| [concepts.md](skills/swot-analysis/references/concepts.md) | Si necesitas recordar SWOT/TOWS/ICE | Definiciones, quality bar, edge cases |
| [schema.md](skills/swot-analysis/references/schema.md) | Si necesitas el schema de campos | Estructura de datos del output |

---

## Flujo de Ejecución

### 0. Context Hydration (OBLIGATORIO — antes de cualquier pregunta)
- Lee `_system/skills/context-hydration-protocol.md` para el patrón genérico
- Lee `skills/swot-analysis/references/hydration.md` para el mapeo específico de esta skill
- Lee TODOS los docs en `context_required`
- Pre-rellena campos según hydration_map
- Presenta datos heredados al usuario: "De [fuente] ya tengo X. ¿Correcto?"
- Solo pregunta campos listados en "Campos genuinamente nuevos"

### 1. Verificar prerequisites
- Carga `brand/{slug}/product-analysis/product-analysis.current.md`, `brand/{slug}/market-and-us/competitors/competitors.current.md`, `brand/{slug}/market-and-us/market/market.current.md`
- Si falta algún upstream: "No puedo construir un SWOT robusto sin [pillar]. ¿Procedo con baja confianza o completamos primero?"

### 2. Ejecutar el prompt
- Lee `skills/swot-analysis/references/prompt.md` — es tu guía paso a paso
- **Step 1**: Evidence Collection — pull confirmed data from upstream pillars
- **Step 2**: SWOT Population — place evidence in correct quadrant (ver `skills/swot-analysis/references/concepts.md` para reglas)
- **Step 3**: SWOT Validation — presenta al usuario, incorpora feedback
- **Step 4**: TOWS Matrix — cruza cuadrantes (SO/ST/WO/WT), mínimo 8 estrategias
- **Step 5**: ICE Prioritization — score cada estrategia, ranking final, top 3 actions

### 3. Self-QA (OBLIGATORIO)
- Lee `skills/swot-analysis/references/checklist.md`
- Cada ítem: ✅ | ⚠️ (justificado) | ❌ (seguir investigando)
- **0 ❌** antes de entregar
- Cruza datos contra brand files upstream (coherencia)
- Metadata: `<!-- Self-QA: PASS | fecha | items: X✅ Y⚠️ 0❌ -->`

### 4. Guardar con versionado
- Ruta: `brand/{slug}/market-and-us/swot/swot.current.md`
- Si ya existe → backup como `v{N+1}.md`, sobreescribe `swot.current.md`, actualiza `history.json`
- Link: `<MC_BASE>/docs/brand/{slug}/market-and-us/swot/swot.current.md`

---

## Cross-Pillar Data Flow

| Dato | Lo consume |
|------|-----------|
| SWOT quadrants | niche-discovery-100x (Triple Filter), Phase 0 diagnostic |
| SO strategies | Phase 3 content/outreach (attack vectors) |
| ST strategies | Risk management, competitive response |
| WO strategies | Product roadmap, capability building |
| WT strategies | Contingency planning, defensive positioning |
| Top 3 strategies | Phase 2 funnel, Phase 3 scaling |
| Evidence-backed strengths | positioning-messaging, brand-voice |
| Evidence-backed weaknesses | Messaging guardrails (what NOT to claim) |

---

## 🔬 Profundizar con Deep Research

Al entregar, añade:

```
📊 **¿Quieres profundizar?**
Puedo lanzar deep-research para ampliar con más fuentes y validación cruzada.
→ Escribe **"profundizar"** para continuar.
```

Si el usuario dice "profundizar": invoca `deep-research` con la ruta del documento.

---

## 📁 Almacenamiento (OBLIGATORIO)

```
brand/{{slug}}/market-and-us/swot/
├── swot.current.md      ← versión activa
├── v1.md, v2.md... ← versiones anteriores
├── history.json    ← log de versiones
└── qa-log.md       ← historial de QA
```

1. Identifica slug desde systemPrompt (`[CLIENTE: ... | slug: ...]`)
2. Si existe `swot.current.md` → backup como `v{N+1}.md` antes de sobreescribir
3. Si no existe → crea carpeta + `swot.current.md` + `v1.md` + `history.json`
4. Link: `<MC_BASE>/docs/brand/{slug}/market-and-us/swot/swot.current.md`


## HTML individual interactivo (SAN-1487)

El SWOT y el OPE Canvas tienen HTML canónico independiente de la presentación.
Después de actualizar su Markdown, usar `sancho_render_document_html`: estas
rutas seleccionan automáticamente el render especializado (cuadrantes SWOT/TOWS
con ICE de la fuente y rejilla OPE de 14 casillas). Probar primero con `dryRun`;
si la fuente no conserva la estructura, corregirla, nunca sustituir el diseño
por una conversión genérica. Conservar evidencias, cruces, primeras acciones,
preguntas abiertas y el detalle completo. Verificar las selecciones en el visor.

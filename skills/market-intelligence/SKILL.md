---
name: market-intelligence
description: "Market analysis: TAM, trends, segments, competitive landscape, customer segmentation, regulatory impact. Use when: analyzing a market for a client, understanding competitive dynamics, sizing a market opportunity, identifying customer segments and their pain points, mapping regulatory constraints for marketing. Produces a 5-part report (Market Overview, Competitive Intelligence, Customer Segmentation, Trends, Opportunities). NOT for: selecting which segments to attack (use niche-discovery), analyzing a specific competitor in depth (use competitor-intelligence), or creating content (use content skills)."
metadata:
  author: Alfonso Sainz de Baranda (Growth4U)
  version: '6.3'
  system: SanchoCMO
  phase: '1'
  pillar: market-intelligence
  layer: '2'
  depends_on: company-brief
  updated: '2026-09-13'
  changes: v6.3 — Preflight externo por el MCP existente; el bloque del runtime
    controlado no es requisito de la ejecución externa (SAN-1131).
# Capacidades (SAN-661). Contrato neutro al runtime: ids de src/lib/capabilities/catalog.ts,
# nunca nombres de herramienta de un motor. Si falta una required, el turno no arranca.
capabilities_required:
  - research.deep   # backbone obligatorio: /deep-research
  - web.search      # encuadre de mercado y descubrimiento de fuentes
capabilities_optional:
  - web.extract     # verificar fuentes primarias
  - serp.seo        # demanda y keywords del mercado
  - social.extract  # escucha social
  - web.perf        # la propia skill declara que su ausencia NO bloquea
context_required:
- brand/{slug}/company-brief/company-brief.current.md
context_optional:
- brand/{slug}/site-audit/trust-score/trust-score.current.md
- brand/{slug}/market-and-us/competitors/competitors.current.md
- brand/{slug}/market-and-us/self/self.current.md
context_writes:
- brand/{slug}/market-and-us/market/market.current.md
- brand/{slug}/market-and-us/market/resume.json
---

# Market Intelligence

> Entiende el campo de juego antes de jugar. TAM, segmentos, competidores, clientes, regulación, tendencias.

**Input obligatorio**: Company Brief
**Enriquecimientos opcionales**: Trust Score y outputs L1 hermanos si ya existen
**Output**: Informe 5 partes → `brand/{slug}/market-and-us/market/market.current.md`

La ausencia de `context_optional`, PageSpeed/Core Web Vitals, Web Speed Insights,
Analytics, Search Console o crawls SEO **NO bloquea** Market Intelligence. Si una
señal existe, se cita y enriquece el informe; si falta, se registra como `not_available`
sin pedir que se genere como paso previo.

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
| [hydration.md](skills/market-intelligence/references/hydration.md) | **SIEMPRE** — Step 0 obligatorio | Mapeo de campos upstream → esta skill |
| `_system/skills/long-turn-checkpoint-protocol.md` | **SIEMPRE** — Step 0 y Steps 2-3 | Este turno puede morir sin aviso: unidad de checkpoint, `resume.json`, parciales |
| `_system/skills/scraping-preflight.md` | **SIEMPRE** — Step 0, antes de research/scraping | Detección providers + matriz (web/social/SEO/research) + pedir conectar |
| [prompt.md](skills/market-intelligence/references/prompt.md) | **SIEMPRE** — es la fuente de verdad | Las 5 partes del informe con instrucciones detalladas |
| [checklist.md](skills/market-intelligence/references/checklist.md) | **Antes de entregar** — self-QA obligatorio | Ítems de verificación por sección |
| [concepts.md](skills/market-intelligence/references/concepts.md) | Si necesitas recordar qué es TAM, madurez, etc. | Definiciones y metodología |
| [schema.md](skills/market-intelligence/references/schema.md) | Si necesitas el schema de campos/tipos | Estructura de datos del output |

---

## Flujo de Ejecución

### 0. Context Hydration + Scraping Preflight
- **¿Reanudas?** Lee `_system/skills/long-turn-checkpoint-protocol.md` y comprueba si existe `brand/{slug}/market-and-us/market/resume.json` con `status: in-progress`. Si existe, continúa desde `next` sin repetir lo ya persistido y dilo en una línea al usuario.
- Lee `_system/skills/context-hydration-protocol.md` para el patrón genérico
- Lee `skills/market-intelligence/references/hydration.md` para el mapeo específico de esta skill
- Lee el Company Brief de `context_required`
- Lee cada `context_optional` solo si existe; su ausencia nunca es error ni gate
- Pre-rellena campos según hydration_map
- Lee `_system/skills/scraping-preflight.md` completo y sigue el contrato de
  esta ejecución: P0-A para el agente externo con `sancho.mcp-task-run.v1`,
  P0-B para un turno despachado por el runtime controlado de Sancho. El agente
  externo comprueba catálogo, schemas y rutas autorizadas en la conexión MCP
  actual; no espera ni fabrica el bloque del chat interno. El turno controlado
  requiere su routing autenticado y no puede usar P0-A para saltar un rechazo.
  No ejecutes el CLI manualmente ni fabriques receipts. En ambos casos,
  no investigues una capacidad requerida sin ruta válida ni declares una
  llamada realizada sólo porque su tool aparece en el catálogo.

### 0.5. Market Scope Card + confirmación humana (GATE)

Antes de investigar, deriva del Company Brief una **Market Scope Card** con:

- `category_definition`: categoría que se va a dimensionar
- `buyer_and_user`: comprador, usuario y problema/JTBD
- `geography`: geografías incluidas
- `value_chain_position`: tramo exacto de la cadena de valor
- `included`: productos, segmentos y modelos incluidos
- `excluded`: exclusiones explícitas para evitar inflar el TAM
- `adjacent_markets`: mercados relacionados que se observarán pero no se sumarán
- `sizing_unit`: ingresos, clientes, transacciones u otra unidad
- `evidence`, `assumptions`, `confidence`

Presenta la tarjeta al usuario y **ESPERA confirmación humana explícita** antes del
research caro. La confirmación no se infiere de silencio ni de outputs previos. Si hay
un `[CONFLICTO]` sobre categoría, geografía, evidencia o autoridad, pregunta al
usuario en la misma sesión externa y espera una respuesta humana correlacionada.

### 1. Preparar el research

- Convierte la Market Scope Card confirmada en la pregunta y criterios de parada del research
- Crea inventario de fuentes por tipo: oficiales, regulatorias, académicas, industria,
  compañías públicas, demanda/consumidor y escucha social cuando sea material
- Trata Trust Score, PageSpeed/Core Web Vitals y outputs hermanos como señales auxiliares,
  nunca como definición autoritativa del mercado

### 2. Investigar siguiendo el prompt
- Lee `skills/market-intelligence/references/prompt.md` — es tu guía sección por sección
- **Backbone obligatorio → `/deep-research` (Hamete):** pásale la Market Scope Card
  confirmada, la pregunta de research, qué significa `complete` y los campos de salida.
  Debe ejecutar SCOPE → SOURCES → EXTRACT → FRAMEWORK → DETAIL → QA → DELIVER,
  con fuentes citadas y verificación `qa-bot`. Las búsquedas web complementan y
  verifican; no sustituyen este proceso.
- Para TAM, intenta al menos dos métodos o fuentes independientes; si divergen,
  conserva ambos valores, explica la diferencia y asigna confianza.
- Cubre las 5 partes:
  - **Parte 0**: Executive Narrative (síntesis narrativa de todo el análisis)
  - **Parte 1**: TAM, segmentos, geografía, madurez
  - **Parte 2**: estructura competitiva de categoría, concentración, arquetipos,
    amenazas y candidatos para el handoff; NO síntesis por competidor ni deep-dives
  - **Parte 3**: Segmentos de cliente, psicográfico, conductual, pain points, personas
  - **Parte 4**: Tendencias, comportamiento consumidor, plataformas, regulación
  - **Parte 5**: Gaps, oportunidades, atractivo, hoja de ruta
- Para cada parte, busca en múltiples ángulos (español + inglés, general + específico)
- **Escucha social (pain points reales):** vía el provider del preflight — scrapecreators (`reddit_*`, social) y/o skill `last30days` para el pulso de comunidad/recencia; foros y reviews para quejas reales. No te quedes solo en web_search.
- Cierra Parte 2 con `## Competitor Intelligence Handoff`. Market identifica y
  verifica candidatos a nivel de categoría, pero **no crea `competitors.current.md`**.

### 3. Escribir el documento (STORYTELLING OBLIGATORIO)

> **La unidad de checkpoint de esta skill es la parte.** No investigues las
> cinco partes y escribas al final: en cuanto cierras la investigación de una
> parte, escríbela al documento y actualiza `resume.json`. Si te matan en la
> Parte 3, las anteriores están en disco. Ver
> `_system/skills/long-turn-checkpoint-protocol.md`.
>
> ```
> investigar Parte N → escribirla a market.current.md → resume.json → Parte N+1
> ```
>
> Mientras falte cualquier parte, el front-matter lleva `status: in-progress` y
> `resume_from:`, y **no** se promueve `v{N}.md` ni se toca `history.json`.

- **EMPIEZA con Executive Narrative (Parte 0)** — 1 página, narrativa pura, cero tablas
- Sigue la estructura de `skills/market-intelligence/references/prompt.md` parte por parte
- **CADA SECCIÓN**: Contexto narrativo → Evidencia (tablas/datos) → Interpretación ("so what?") → Implicación
- **TRANSICIONES**: Párrafo puente entre partes (conecta lo anterior con lo siguiente)
- **TONO**: Presentación al CEO, no reporte técnico — "Esto significa que...", "La oportunidad está en..."
- Cada claim con fuente inline: `dato [Fuente](url)`
- Si no hay fuente → marca `⚠️ Estimación sin fuente verificada`
- Si un dato no está disponible públicamente → declara "No disponible" con razón
- Target: 15-25 páginas (exhaustivo pero enfocado y narrativo)

### 4. Self-QA (OBLIGATORIO)
- Lee `skills/market-intelligence/references/checklist.md`
- Revisa CADA ítem contra tu documento
- Si hay ❌ (falta) → investiga más con búsquedas enfocadas
- Repite hasta que todo sea ✅ o ⚠️ (justificado)
- Spot-check: verifica 5-10 URLs con `web.extract`
- Cruza cifras contra el Company Brief y cualquier enrichment opcional disponible
- Comprueba que el QA de `/deep-research`/`qa-bot` no deja claims críticos sin fuente
- El output nace con `<!-- Self-QA: PENDING | fecha: — | items: — -->`.
- Cita cada fuente realmente consultada. El runtime captura automáticamente
  cada `tool_result`; nunca escribas ni registres tu propio receipt. Si una ruta
  no se ejecutó, declárala `not-attempted` y no atribuyas sus garantías.
- Tras la última escritura, relee el archivo completo con `Read`, ejecuta el
  checklist y fija `FAIL` o el marker PASS canónico con fecha/conteos reales.
  Vuelve a leer esos bytes e invoca `qa-bot`/Sanson como revisor independiente
  contra la ruta exacta. No reescribas después.
- Mission Control reconcilia preflight, tool results, readback, hash final y QA
  al promover. Si rechaza el avance, retoma la primera capacidad faltante y
  recalcula sólo las conclusiones dependientes.

### 5. Cerrar y versionar (sólo con el informe completo y QA en PASS)
- El documento ya está escrito parte a parte (Step 3). Aquí sólo se **cierra**.
- Quita `status: in-progress` y `resume_from:` del front-matter; borra `resume.json`.
- **Ahora sí**, y sólo ahora: backup del anterior como `v{N+1}.md` y entrada en `history.json`. Un parcial nunca llegó a promover versión.
- Link al usuario: `<MC_BASE>/docs/brand/{slug}/market-and-us/market/market.current.md`

---

## Cross-Pillar Data Flow

| Dato | Lo consume |
|------|-----------|
| TAM | budget-constraints, niche-discovery-100x |
| Madurez | Phase 0 diagnostic, positioning-messaging |
| Regulación + marketing restrictions | **TODOS los skills de contenido** (paid-ads, landing, social, email) |
| Tendencias (oportunidades) | swot-analysis (Opportunities) |
| Tendencias (amenazas) | swot-analysis (Threats) |
| Segmentos de cliente | niche-discovery-100x, content strategy |
| Competitor Intelligence Handoff | competitor-intelligence |
| Mercados adyacentes | Phase 3 scaling |

---

## Citación (Regla 0b SOUL.md)

Toda cifra con URL inline + sección `## Fuentes` al final con lista numerada completa. No inventar URLs. Claims sin fuente → `⚠️`.

## 📁 Almacenamiento (OBLIGATORIO)

```
brand/{{slug}}/market-and-us/market/
├── market.current.md      ← versión activa
├── v1.md, v2.md... ← versiones anteriores
├── history.json    ← log de versiones
└── qa-log.md       ← historial de QA
```

1. Identifica slug desde systemPrompt (`[CLIENTE: ... | slug: ...]`)
2. Si existe `market.current.md` → backup como `v{N+1}.md`, pide confirmación
3. Si no existe → crea carpeta + `market.current.md` + `v1.md` + `history.json`
4. Link: `<MC_BASE>/docs/brand/{slug}/market-and-us/market/market.current.md`

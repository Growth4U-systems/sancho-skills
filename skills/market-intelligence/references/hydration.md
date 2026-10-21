# Hydration Map — market-intelligence

> El Company Brief define el punto de partida. El alcance del mercado se confirma
> con el humano antes del deep research; ningún output futuro de L1 es un gate.

## Contexto obligatorio

| Doc upstream | Campo upstream | → Uso en esta skill | Regla |
|-------------|---------------|---------------------|-------|
| Company Brief | `company`, `business_model`, `offering` | Entidad, modelo y oferta | Grounding, no conclusión |
| Company Brief | `working_market_frame` | Borrador de categoría, buyer, geografía y cadena de valor | Convertir en Market Scope Card |
| Company Brief | `known_market_and_competitors` | Seeds competitivos y supuestos | Candidatos, no set validado |
| Company Brief | `sources`, `conflicts_and_gaps` | Evidencia, contradicciones y pendientes | Conservar procedencia |

Si falta el Company Brief, aborta esta ejecución de Full Foundation y vuelve a L0.
No sustituyas el brief generando `competitors.current.md`, Trust Score ni otro output.

## Enriquecimientos opcionales

| Señal opcional | → Uso | Si falta |
|----------------|------|----------|
| `site-audit/trust-score/trust-score.current.md` | Hipótesis de confianza, benchmark técnico y candidatos | Continuar; `not_available` |
| `market-and-us/competitors/competitors.current.md` | Enriquecer una re-ejecución con landscape ya validado | Continuar; no crearlo aquí |
| `market-and-us/self/self.current.md` | Contrastar capacidades propias con oportunidades | Continuar |
| PageSpeed/Core Web Vitals, Web Speed Insights | Señal técnica auxiliar | Continuar; no pedir ejecución previa |
| Analytics, Search Console, crawl SEO | Señal de demanda/visibilidad propia | Continuar; no usar para definir el TAM |

Los enriquecimientos opcionales nunca:

1. bloquean la ejecución;
2. se convierten en fuente de verdad por encima del Company Brief o fuentes primarias;
3. justifican fabricar un artifact previo;
4. resuelven conflictos semánticos sin confirmación humana.

## Market Scope Card (GATE antes del research)

Derivar y presentar:

| Campo | Pregunta que resuelve |
|-------|-----------------------|
| `category_definition` | ¿Qué categoría exacta dimensionamos? |
| `buyer_and_user` | ¿Quién compra, quién usa y qué JTBD resuelve? |
| `geography` | ¿Qué países/regiones cuentan? |
| `value_chain_position` | ¿Qué tramo de la cadena de valor se incluye? |
| `included` | ¿Qué productos, segmentos y modelos entran? |
| `excluded` | ¿Qué se excluye explícitamente? |
| `adjacent_markets` | ¿Qué observamos sin sumarlo al mercado principal? |
| `sizing_unit` | ¿Ingresos, clientes, transacciones u otra unidad? |
| `evidence` | ¿Qué fuentes sostienen el frame? |
| `assumptions` | ¿Qué sigue siendo hipótesis? |
| `confidence` | `high`, `medium` o `low` con rationale |

Presenta la tarjeta completa y espera confirmación humana explícita. Un “silencio”,
una respuesta runtime o un artifact anterior no validan el alcance. Cualquier
`[CONFLICTO]` de categoría, geografía, evidencia o autoridad se escala mediante
pregunta al usuario en la misma sesión externa.

## Campos genuinamente nuevos

| Campo | Método |
|-------|--------|
| TAM y crecimiento | `/deep-research`; triangulación de métodos/fuentes |
| Segmentos y madurez | Research + evidencia primaria/secundaria |
| Geografía y regulación | Fuentes oficiales y regulatorias |
| Customer segments y pain points | Research + escucha social cuando sea material |
| Tendencias y oportunidades | Síntesis con horizonte, evidencia y confianza |
| Estructura competitiva | Fuentes de categoría; sin síntesis por actor |
| Competitor Intelligence Handoff | Descubrimiento de candidatos con URL y evidencia |

## Regla de competidores

Los nombres del Company Brief o de outputs opcionales son seeds. Market Intelligence:

1. verifica que cada candidato existe y opera en el scope confirmado;
2. clasifica su relevancia a nivel de categoría;
3. no hace deep-dive 3-lens, síntesis por competidor ni scraping exhaustivo por actor;
4. entrega candidatos a Competitor Intelligence;
5. no crea `competitors.current.md`.

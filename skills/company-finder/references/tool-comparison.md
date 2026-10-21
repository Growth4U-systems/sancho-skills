# Prospecting Tool Comparison

> Guia de referencia para seleccionar la herramienta correcta segun el tipo de busqueda ICP.

---

## Apollo.io

**Que es:** Plataforma all-in-one de prospecting con base de datos propia de 275M+ contactos y 73M+ empresas.

**Pros:**
- Base de datos masiva incluida (no necesitas fuentes externas)
- Filtros avanzados: industria, tamano, revenue, tech stack, funding, keywords, hiring signals
- API REST bien documentada con paginacion y rate limits claros
- Secuencias de email integradas (prospecting + outreach en uno)
- Tier gratuito funcional para validacion inicial

**Contras:**
- Datos pueden estar desactualizados (especialmente empresas pequenas/locales)
- Cobertura geografica desigual (fuerte en US/UK, debil en LATAM/Southern Europe)
- Rate limits restrictivos en plan gratuito (100 API calls/min, 300 enrichments/mes)
- Revenue data es estimacion, no dato real

**Pricing:**
- Free: 60 credits/mes, API basica
- Basic: $59/mes — 900 credits, filtros avanzados
- Professional: $99/mes — 1,200 credits, intent data, enrichment
- Organization: $149/mes — 2,400 credits, custom reports

**Operacion Sancho recomendada:**

```json
{
  "operation": "sales-engine-leads.search",
  "organization_num_employees_ranges": ["11,50"],
  "organization_locations": ["Spain"],
  "q_organization_keyword_tags": ["SaaS", "fintech"],
  "per_page": 25,
  "page": 1
}
```

Sancho resuelve Apollo por Nango dentro del servicio. Si la operacion no esta disponible para el tenant, usar export manual y no llamar al proveedor directamente.

**Filtros disponibles:**

| Filtro | Parametro API | Valores ejemplo |
|--------|---------------|-----------------|
| Industria | `q_organization_keyword_tags` | `["SaaS", "fintech"]` |
| Tamano | `organization_num_employees_ranges` | `["1,10", "11,50", "51,200"]` |
| Revenue | `revenue_range` | `{"min": 1000000, "max": 10000000}` |
| Geografia | `organization_locations` | `["Spain", "Madrid"]` |
| Tech stack | `currently_using_any_of_technology_uids` | UIDs de tecnologias |
| Funding | `organization_latest_funding_stage_cd` | `["series_a", "series_b"]` |
| Crecimiento | `organization_department_size_change` | `{"department": "engineering", "change": "growing"}` |
| Keywords | `q_organization_name` | Busqueda por nombre |

**Mejor para:** Busquedas ICP estandar donde los criterios son industria + tamano + geografia + tech stack. El 80% de las busquedas company-finder caeran aqui.

---

## Clay

**Que es:** Plataforma de data enrichment y workflow que NO tiene base de datos propia. Conecta 100+ data providers via "waterfall enrichment" — prueba multiples fuentes hasta encontrar el dato.

**Pros:**
- Waterfall enrichment: si Apollo no tiene el dato, prueba Clearbit, luego ZoomInfo, luego Crunchbase...
- Workflows visuales para logica compleja (if/then, scoring, filtering)
- 100+ integraciones de datos (Apollo, Clearbit, ZoomInfo, Crunchbase, LinkedIn, etc.)
- Mejor data quality (cross-references multiples fuentes)
- Custom columns con formulas y AI enrichment

**Contras:**
- No tiene base de datos propia — necesitas al menos una fuente de seed data
- Curva de aprendizaje mas alta que Apollo
- Pricing puede escalar rapido con muchas enrichment credits
- Requiere configuracion mas compleja para busquedas simples

**Pricing:**
- Starter: $149/mes — 2,000 credits
- Explorer: $349/mes — 10,000 credits
- Pro: $800/mes — 50,000 credits
- Enterprise: custom

**Cuando elegir Clay sobre Apollo:**
- ICP tiene criterios que Apollo no cubre (e.g., "empresas que usan Stripe AND han levantado Serie A en los ultimos 6 meses AND estan contratando engineers")
- Necesitas cruzar datos de multiples fuentes para confirmar accuracy
- El workflow de enrichment es tan importante como la busqueda inicial
- Quieres logica condicional compleja en el scoring

**Mejor para:** ICP complejos con criterios multi-fuente, workflows de enrichment sofisticados, o cuando la calidad del dato es critica.

---

## LinkedIn Sales Navigator

**Que es:** Herramienta premium de LinkedIn para buscar personas y empresas con filtros avanzados. La base de datos mas precisa para datos de personas en B2B.

**Pros:**
- Datos de personas mas precisos y actualizados (auto-reported by users)
- Filtros de empresa + persona combinados
- Informacion de actividad reciente (posts, job changes, company news)
- Account-level insights (headcount trends, new hires, connections in common)
- Lead recommendations basadas en tu ICP guardado

**Contras:**
- NO tiene API oficial (Terms of Service prohiben scraping directo)
- Datos de empresa limitados vs Apollo (no revenue, no tech stack, no funding amounts)
- Precio alto ($99-149/mes por usuario)
- Export limitado (max 25 resultados por busqueda sin herramientas externas)

**Filtros disponibles:**

| Filtro | Nivel | Notas |
|--------|-------|-------|
| Industry | Empresa | Taxonomia LinkedIn (puede no matchear Apollo) |
| Company headcount | Empresa | Rangos predefinidos |
| Headquarters | Empresa | Pais + region |
| Annual revenue | Empresa | Solo en Advanced+ plans |
| Department headcount | Empresa | Util para signals de crecimiento |
| Company type | Empresa | Public, Private, Nonprofit, etc. |
| Technologies used | Empresa | Limitado vs Apollo/BuiltWith |
| Job title | Persona | Filtro principal para decision-makers |
| Seniority level | Persona | C-Level, VP, Director, Manager |
| Function | Persona | Marketing, Sales, Engineering, etc. |

**Investigacion asistida:**

```json
{
  "searchUrl": "https://www.linkedin.com/search/results/companies/?keywords=fintech%20spain",
  "maxItems": 100
}
```

Usar este objeto solo como especificacion para un broker Sancho revisado o una exportacion manual autorizada. No automatizar LinkedIn ni Apify desde el playbook.

**Mejor para:** Busquedas B2B donde necesitas precision en personas + empresas, o cuando el ICP se define por roles especificos dentro de la empresa.

---

## Fuentes de scraping gestionadas

**Que es:** Catalogo de actores pre-construidos que puede servir como referencia para una ejecucion manual o para una futura operacion Sancho revisada.

**Relevancia para SanchoCMO:**
- SanchoCMO se despliega web-hosted y no ejecuta browsers locales
- La ejecucion cloud debe quedar detras de una operacion Sancho respaldada por Nango
- Actors disponibles para Apollo, LinkedIn, Google Maps, Crunchbase, etc.

**Actors relevantes para company-finder:**

| Actor | Uso | Endpoint |
|-------|-----|----------|
| `apify/linkedin-company-scraper` | Scrape company data de LinkedIn | LinkedIn company search |
| `apify/google-maps-scraper` | Empresas locales por geo + categoria | Google Maps search |
| `apify/crunchbase-scraper` | Funding, investors, growth data | Crunchbase profiles |
| `epctex/apollo-io-scraper` | Apollo search sin API key propio | Apollo.io search |

**Autenticacion:** propiedad del servicio por Nango. El playbook nunca recibe credenciales.

**Mejor para:** disenar una busqueda que un operador autorizado pueda ejecutar o que una operacion Sancho futura pueda aceptar.

---

## Decision Tree: Que Herramienta Usar

```
                    +-- ICP definido? --+
                    |                   |
                   YES                  NO
                    |                   |
              Criterios?          Volver a niche-discovery-100x
                    |
         +----+----+----+
         |              |
    Standard        Complejo
    (industria      (multi-signal,
     + tamano        cross-source,
     + geo)          condicional)
         |              |
    Apollo.io        Clay
         |              |
         |         Operacion disponible?
         |         +-------+-------+
         |        YES              NO
         |         |                |
         |    Clay workflow    Apollo + manual
         |                    enrichment
         |
    Necesitas precision
    en personas/roles?
    +-------+-------+
   YES              NO
    |                |
  LinkedIn        Solo Apollo
  Sales Nav        (suficiente)
    |
  Operacion disponible?
  +-------+-------+
 YES             NO
    |              |
  Broker typed  Manual export
  (automated)   (25/search)
```

**Regla rapida:**
- **Standard ICP** (industria + tamano + geo) --> **Apollo**
- **Complex ICP** (multi-signal, conditional logic) --> **Clay**
- **People-first** (roles + seniority + activity) --> **LinkedIn Sales Navigator**
- **Sin broker revisado** --> **investigacion publica o export manual**
- **Budget zero** --> **Apollo Free + manual research (LIGHT mode)**

---

## Comparison Matrix

| Feature | Apollo | Clay | LinkedIn SN | Apify |
|---------|--------|------|-------------|-------|
| Own database | 275M+ contacts | No (100+ providers) | 900M+ members | No (actors) |
| Company data | Strong | Best (waterfall) | Good (limited) | Depends on actor |
| People data | Good | Good (multi-source) | Best | Good |
| Tech stack | Yes | Yes (via providers) | Limited | Via BuiltWith actor |
| Funding data | Yes | Yes (via Crunchbase) | No | Via Crunchbase actor |
| Revenue data | Estimate | Cross-validated | Limited (Adv+ plan) | Via providers |
| Growth signals | Department changes | Custom signals | Headcount trends | Custom |
| Integracion | Operacion Sancho | Operacion Sancho/manual | Export manual | Broker Sancho/manual |
| Rate limits | 100/min (free) | Credit-based | N/A | Credit-based |
| Starting price | Free / $59/mo | $149/mo | $99/mo | $49/mo |
| Best for | Standard searches | Complex enrichment | People targeting | Automation |

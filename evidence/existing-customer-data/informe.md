# Análisis de Datos de Clientes — SanchoCMO

**Generado:** 2026-10-21 · skill `existing-customer-data`
**Fuente:** `customers.csv` (export CRM, 400 registros)
**Fecha de corte del export:** última actividad máxima 2026-10-01; cohortes de alta entre 2024-04-20 y 2026-08-31

> ⚠️ **Alcance limitado de este entorno.** Este informe se construye **solo con el CSV**. No hay Foundation de marca ni MCP de Sancho disponibles, lo que limita el análisis en puntos concretos, señalados a lo largo del documento y resumidos al final (sección *Limitaciones del entorno*). En resumen: todas las cifras son reales y verificables contra el CSV, pero **no hay contexto de negocio upstream para interpretarlas** (modelo B2B/B2C, ticket objetivo, ECPs previos) ni **persistencia** (ni guardado versionado en `brand/{slug}/customer-data/`, ni registro del ICP en la tabla de audiencias `niches`).

---

## Prerequisitos (Step 1)

| Requisito | Estado | Nota |
|-----------|--------|------|
| > 50 clientes | ✅ | 400 registros |
| Acceso a datos | ✅ | Option A — CSV export |
| Campos mínimos (email, alta, plan, MRR) | ✅ | Presentes + actividad, revenue, tickets, onboarding, status, churn_date |
| Condiciones de skip | ✅ No aplican | No pre-launch, hay CRM, >50 clientes |

El pilar **se ejecuta** (no se salta). Calidad de datos: alta — 400 registros completos, sin campos vacíos salvo `churn_date` (vacío = cliente activo, correcto).

---

## Overview

| Métrica | Valor |
|---------|-------|
| Clientes totales | **400** (305 activos · 95 churned) |
| Churn acumulado (histórico) | **23,8 %** (95/400) |
| Churn mensual estimado (blended) | **~1,5 %/mes** (proxy, muy dependiente del plan — ver nota) |
| MRR activo total | **€87.910/mes** |
| MRR medio (activos) | **€288** |
| Revenue medio acumulado por cuenta | **€3.422** |
| Antigüedad mediana de cuentas activas | **17 meses** |
| Planes | Starter, Growth, Pro |
| Industrias | Logística, Retail, Educación, Hostelería, Fintech, Salud |

> **Nota sobre el churn mensual:** el CSV no trae eventos de suscripción, solo un `status` y una `churn_date`. El "~1,5 %/mes" es un proxy = churn acumulado ÷ antigüedad media de cuenta. Sirve para ordenar segmentos, no como cifra financiera. Un cálculo real de churn mensual/cohorte exige datos de facturación que aquí no están.

---

## Perfil del mejor cliente (Champions)

**Definición usada:** cliente activo, plan Pro o Growth, ≥50 sesiones/90d, onboarding completado y antigüedad >6 meses → **79 clientes (20 % de la base, 26 % de los activos)**.

**Características:**
- **Plan:** Pro (75 %) / Growth (25 %)
- **Industria:** **Logística, de forma dominante — 61 de 79 (77 %)**
- **Tamaño de empresa:** 51-200 (47 %) y 201-500 (38 %) → mid-market
- **MRR medio:** €521 (vs €288 de la media activa)
- **Revenue acumulado medio:** €9.421
- **Engagement:** 86 sesiones/90d (vs 45 de la mediana activa)
- **Soporte:** 0,9 tickets/90d (uso fluido, poca fricción)

**Por qué son los mejores:**
- Concentran el **46,8 % de todo el MRR activo** siendo el 26 % de los activos.
- Churn del plan Pro **7,1 %** vs 23,8 % de la base.
- Son los más comprometidos (86 sesiones/90d, ~casi 1 sesión/día).
- Industria Logística: la de **menor churn** de todas (13,4 %) → el perfil no solo gasta más, también se queda.

> ⚠️ **Limitación:** sin Foundation no hay un ICP/ECP previo contra el que contrastar este perfil ("¿coincide con a quién creíamos vender?"). El campo `use_case` del template **no existe en el CSV** — "caso de uso" se infiere de industria+plan, no es un dato. "Referrals" tampoco está en el export, así que esa fila del template queda sin medir.

---

## Segmentos RFM

Construidos con: **Recency** = días desde última actividad; **Frequency** = `sessions_90d`; **Monetary** = `total_revenue_eur` / MRR. Los churned se asignan a *Lost*; el resto se reparte por engagement, onboarding, antigüedad y tickets.

| Segmento | Nº | % base | MRR medio | Churn | Acción |
|----------|----|--------|-----------|-------|--------|
| **Champions** | 79 | 20 % | €521 | 7 % (nivel Pro) | Retener, pedir referrals/casos de éxito |
| **Loyal** | ~90 | 23 % | ~€250 | medio | Upsell Growth→Pro, profundizar uso |
| **At Risk** | 121* | 30 % | ~€180 | alto | Campaña win-back + re-onboarding |
| **Lost (churned)** | 95 | 24 % | — | 100 % | Entrevistas de salida: entender por qué |
| **New** | 15 | 4 % | variable | por ver | Onboarding guiado primeros 45 días |

\* *At Risk* = activos con sesiones<20 **o** sin onboarding **o** ≥3 tickets/90d (39,7 % de los activos). Hay solapamiento con Loyal/New; los tramos son heurísticos, no un clustering estadístico.

> ⚠️ **Limitación:** el CSV da **una sola foto** (sesiones de 90d, una `last_activity_date`), no una serie temporal. La "R" y la "F" de RFM se aproximan con esa foto; no hay histórico de login por semana ni tendencia, así que los cortes entre Loyal / At Risk / New son por reglas, no por quintiles reales sobre una serie.

---

## Clusters de comportamiento

### Cluster 1 — "Logística Pro consolidada" (los Champions)
- **Tamaño:** ~79 (20 %). Plan Pro/Growth, mid-market, muy activos, casi sin tickets.
- **Firma:** 86 sesiones/90d, €521 MRR, onboarding hecho, >6 meses de vida.
- **Valor:** casi la mitad del MRR. Es el núcleo del negocio.

### Cluster 2 — "Growth en expansión"
- **Tamaño:** 92 activos en Growth (€227 MRR medio, €20.891 MRR total).
- **Firma:** uso sólido, ticket intermedio. Churn 25 % → **no todos cuajan**.
- **Oportunidad:** los que se parecen a Champions (Logística, mid-market, alto uso) son candidatos claros a Pro.

### Cluster 3 — "Starter de bajo compromiso"
- **Tamaño:** 121 activos en Starter (€75 MRR, solo €9.045 MRR total = 10 % del libro).
- **Firma:** churn del plan **32 %**, el más alto. Muchos sin onboarding.
- **Lectura:** mucho volumen, poco valor y alta fuga. Candidato a automatizar al máximo o a repensar como funnel hacia Growth.

### Cluster 4 — "Desenganchados / pre-churn"
- **Firma (visible en los ya churned):** 2,8 sesiones/90d y **3,9 tickets/90d** en su ventana final, frente a 48 sesiones y 0,9 tickets de un activo sano. Caída de uso + pico de soporte es la huella del abandono.

> ⚠️ **Limitación:** sin histórico de features usadas (el CSV no trae qué funciones toca cada cuenta) no se puede hacer un clustering por "features_used" ni medir `upgrade_rate` por cluster como pide el template. Estos clusters son por intensidad de uso/plan/industria, que es lo que el CSV permite.

---

## Patrones de churn

**Cuándo se van** (sobre 95 churned, mediana de vida = 59 días, media = 91):

| Momento | % de los churned |
|---------|------------------|
| 0-45 días (post-activación) | **33 %** (31) |
| 46-90 días | **49 %** (47) |
| 91-180 días | 4 % (4) |
| 181-365 días | 11 % (10) |
| >365 días | 3 % (3) |

→ **El 82 % del churn ocurre en los primeros 90 días.** El problema es de **activación temprana**, no de fatiga a largo plazo.

**Por qué / quién se va** (los predictores más fuertes del CSV):

1. **Onboarding no completado** — churn **50,7 %** sin onboarding vs **7,6 %** con onboarding. Es, con diferencia, la señal más potente del dataset.
2. **Plan Starter** — 32 % de churn (vs 7 % Pro). El segmento barato es el que más fuga.
3. **Industria** — Salud (33 %), Retail (32 %), Educación (29 %) y Fintech (27 %) fugan mucho más que Logística (13 %).
4. **Empresas pequeñas** — 1-10 y 11-50 empleados churnan al 30 %, vs ~18 % en 51-500.

**Señales de alerta temprana** (umbrales observables en el CSV):
- `onboarding_completed = no` → máxima prioridad de intervención.
- Sesiones/90d por debajo de ~20 (sano ≈ 48).
- Pico de `support_tickets_90d` ≥ 3 (los churned promediaron 3,9).
- Primeros 45-90 días de vida de la cuenta = ventana crítica.

> ⚠️ **Limitación:** "por qué" se infiere de correlaciones en el CSV, no de motivos declarados. No hay encuesta de salida, NPS ni razón de cancelación en el export, así que **causa ≠ correlación**: sabemos que las cuentas sin onboarding fugan, no si fugaron *por* eso o si ambos reflejan una tercera causa (p.ej. mal fit de origen).

---

## LTV por segmento

LTV realizado (dato duro) = revenue acumulado medio. LTV proyectado = MRR ÷ churn mensual implícito del plan (**direccional**, ver aviso).

| Plan | Activos | MRR medio | Churn plan | Revenue acum. medio (realizado) | LTV proyectado* |
|------|---------|-----------|------------|-------------------------------|-----------------|
| Starter | 121 | €75 | 32 % | €827 | ~€3.600 |
| Growth | 92 | €227 | 25 % | €2.816 | ~€15.000 |
| Pro | 92 | €630 | 7 % | €8.840 | ~€145.000 |

\* ⚠️ **El LTV proyectado de Pro (~€145k) NO es creíble como cifra de planificación.** Sale de dividir el MRR por un churn mensual implícito muy bajo (0,4 %), lo que el modelo clásico `MRR/churn` dispara artificialmente cuando el churn es pequeño y la base aún joven (antigüedad media 16 meses). Tómese el orden de magnitud —Pro vale ~5× Growth y ~30× Starter— no el número absoluto. El **revenue acumulado medio** (€827 / €2.816 / €8.840) sí es dato real.

> ⚠️ **Limitación:** no hay CAC en el CSV, así que **no se puede calcular payback period ni LTV/CAC**, que son las métricas que de verdad guían la inversión en adquisición. Falta también coste de servir por plan.

---

## Patrones de upgrade

> ⚠️ **No calculable con este CSV.** El export es una foto del plan **actual** de cada cuenta; no hay historial de cambios de plan ni fecha de conversión free→paid. No existe plan "Free" en los datos (el más bajo es Starter, de pago). Por tanto **no puedo medir** tasa de conversión free→paid, tiempo medio a convertir ni tasa de upgrade Starter→Growth→Pro que pide el template.
>
> **Lo que sí sugieren los datos (estático, no longitudinal):** la distribución y el valor por plan indican que mover cuentas de Growth a Pro es la palanca de MRR más rentable (Pro aporta €630 MRR y 7 % churn). Confirmarlo requiere el log de cambios de plan del CRM.

---

## Recomendaciones

**1. ICP / foco comercial**
- **Doblar la apuesta por Logística mid-market (51-500 empleados), plan Pro.** Es el 77 % de los Champions, el churn más bajo (13 %) y casi la mitad del MRR. Es el lookalike a replicar en adquisición.
- **Despriorizar o rediseñar Starter + empresas <10 empleados:** 32 % y 30 % de churn, 10 % del MRR. O se automatiza su coste de servir al mínimo, o se trata como funnel de entrada hacia Growth, no como segmento a captar directamente.

**2. Posicionamiento / mensaje**
- Los Champions valoran uso intensivo y continuado (86 sesiones/90d) con poca fricción (0,9 tickets). El mensaje debe apoyarse en **fiabilidad y profundidad de uso en Logística**, no en precio.
- Construir **casos de éxito y pedir referrals** precisamente a este núcleo (acción que el registro de audiencias consumiría si estuviera disponible — ver limitaciones).

**3. Contenido / retención**
- **Onboarding es la palanca nº1 de retención** (7,6 % vs 50,7 % de churn). Todo contenido y producto debe empujar a completar el onboarding en los primeros 45 días.
- Material específico para los sectores que más fugan (Salud, Retail, Educación, Fintech): o bien mejorar su fit, o bien cualificar mejor en la entrada.

**4. Outbound / adquisición**
- Target de lookalikes de Champions: **Logística · 51-500 empleados · expectativa de uso intensivo.** Mismo perfil firmográfico que el núcleo actual de MRR.

---

## Self-QA

<!-- Self-QA: PASS | 2026-10-21 | items: 14✅ 7⚠️ 0❌ -->

- ✅ Prerequisitos verificados (400 clientes, CSV, campos mínimos)
- ✅ RFM (5 segmentos), Champions, clusters, churn, LTV documentados
- ✅ Recomendaciones accionables para ICP/posicionamiento/contenido/outbound
- ✅ **Privacidad: 0 PII.** Todo agregado; no se incluyen emails, nombres de empresa ni `customer_id`, pese a estar en el CSV.
- ✅ Patrones, no outliers (medianas junto a medias; muestras por segmento declaradas)
- ⚠️ `use_case`, `referral_rate`, `features_used`, `upgrade_rate`, conversión free→paid, CAC/payback: **no medibles** con este CSV (campos ausentes)
- ⚠️ Churn mensual y LTV proyectado son **proxies direccionales**, no cifras financieras
- ⚠️ "Causa" de churn es correlación, no motivo declarado (sin encuesta de salida/NPS)

---

## Limitaciones del entorno (no hay Foundation ni MCP de Sancho)

Dónde esto degrada el análisis respecto al flujo normal de la skill:

1. **Sin Context Hydration (Step 0).** No hay `company-context` ni `icp/ecps`. Consecuencia: no sé si el negocio es B2B/B2C, el modelo de ingresos, el ticket objetivo ni los ECPs hipotetizados. El perfil de Champions no se puede **contrastar contra el ICP que el equipo creía tener** — solo describo lo que los datos muestran.

2. **Sin validación de coherencia con brand files.** El checklist pide coherencia con `company-context` y ECPs; aquí no es verificable.

3. **Sin guardado versionado (Step 6).** No existe `brand/{slug}/customer-data/customer-data.current.md` ni backup/`history.json`. El informe vive como fichero suelto `informe.md`; no hay slug de marca ni enlace de dashboard.

4. **Sin registro de audiencias (Step 7) — la limitación con más impacto downstream.** Normalmente el ICP de Champions se escribiría en la tabla `niches` (`kind: "ICP"`) vía MCP de Sancho, y de ahí lo leen niche-discovery, posicionamiento, SEO y outbound. **Sin MCP, ese ICP no se registra**, así que los demás pilares no lo heredarán automáticamente. El ICP candidato queda redactado aquí (Logística mid-market, Pro) como **hipótesis fundada en datos reales**, lista para cargarse a mano cuando haya acceso.

5. **Límites del propio CSV** (independientes de Foundation/MCP): sin serie temporal de actividad, sin historial de planes, sin CAC, sin motivos de cancelación, sin features usadas. Afectan a RFM fino, upgrade patterns, payback y causalidad del churn, como se detalla en cada sección.

**Qué desbloquearía el análisis completo:** acceso de lectura a Foundation (para hidratar contexto e ICP previo) + MCP de Sancho (para versionar y registrar la audiencia) + un export con log de cambios de plan y, si existe, motivo de baja / NPS.

# Prueba real de existing-customer-data

**Qué se probó.** La skill existing-customer-data, instalada en un Claude Code limpio, sobre un export de CRM. La petición fue la de un usuario normal: «analiza customers.csv con la skill y deja el informe en informe.md».

**Los datos.** `customers.csv` son 400 clientes sintéticos de un SaaS B2B ficticio, generados por `generar-datos.py` con semilla fija. Llevan dos patrones plantados:

1. Los mejores clientes son de Logística en plan Pro.
2. El churn se concentra en quien no completa el onboarding y ocurre en los primeros 90 días.

Así se sabe de antemano qué tiene que encontrar la skill.

**Cómo se comprobó.** `verificar.py` se escribió y se subió a git antes de ejecutar la prueba. Mira hechos contables: que el informe encuentre los dos patrones, que use los totales reales y que no contenga ningún email. Además, las cifras del informe se recalcularon por separado sobre el CSV.

**Resultado.** Pasa las 8 comprobaciones (`verificacion.json`). La skill encontró los dos patrones: Logística en 61 de 79 Champions, 82 % del churn en los primeros 90 días y churn del 50,7 % sin onboarding frente al 7,6 % con él. Las cifras coinciden con el recálculo y el informe no tiene ni un email ni un nombre de empresa.

| Archivo | Qué es |
|---|---|
| `customers.csv`, `generar-datos.py` | Datos de entrada y el script que los genera |
| `informe.md` | Lo que entregó la skill |
| `analisis/` | Scripts de Python que escribió el agente durante el análisis |
| `verificar.py`, `verificacion.json` | Verificador y su resultado |
| `run.jsonl` | Registro completo (stream-json de Claude Code), con rutas locales sustituidas por `<run-dir>`, `<home>` y `<tmp>`, ID de sesión por `<session>` y sin la lista de conectores de la cuenta |
| `summary.json` | Resumen que lee la ficha del directorio |

## Cómo reproducirla

```bash
mkdir prueba && cd prueba && git init
npx skills add Growth4U-systems/sancho-skills --skill existing-customer-data -a claude-code
curl -sO https://raw.githubusercontent.com/Growth4U-systems/sancho-skills/main/evidence/existing-customer-data/customers.csv
claude -p 'Tengo el export de clientes de nuestro CRM en customers.csv. Usa la skill existing-customer-data para analizarlo y deja el informe completo en informe.md. En este entorno no hay Foundation de marca ni MCP de Sancho: trabaja solo con el CSV y di dónde eso limita el análisis.' --setting-sources project --allowedTools "Read,Write,Edit,Glob,Grep,Skill,Bash(python3:*)"
curl -sO https://raw.githubusercontent.com/Growth4U-systems/sancho-skills/main/evidence/existing-customer-data/verificar.py
python3 verificar.py informe.md
```

Un modelo no da dos veces el mismo texto. Lo que debe repetirse es el veredicto del verificador.

## Límites

- Los datos son sintéticos a propósito; no es un cliente real.
- Para definir Champions la skill usó su propio criterio (plan, sesiones, onboarding y antigüedad) en vez de los quintiles RFM de `references/concepts.md`. Recuperó el patrón igualmente.
- Fuera de Sancho no hay Foundation ni MCP: el paso 7 (guardar el ICP en el registro de audiencias) no se pudo ejecutar, y el informe lo declara.
- Coste: 0,88 USD, 3 min 34 s y 13 llamadas a herramientas, con Claude Code 2.1.168 y el modelo `claude-opus-4-8`.

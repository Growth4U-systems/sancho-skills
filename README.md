# Skills de SanchoCMO

Skills que usan los agentes de [SanchoCMO](https://sanchocmo.ai), publicadas para que las instales en tu propio agente. Cada skill es una carpeta con un `SKILL.md` que el agente carga cuando la tarea encaja.

Esto es un piloto con 10 skills. El catálogo completo de Sancho tiene más de 200; iremos abriendo las que estén listas para uso público.

## Instalar una skill

```bash
npx skills add Growth4U-systems/sancho-skills --skill market-intelligence -a claude-code
```

Cambia `-a` por `codex`, `cursor`, `gemini-cli`, `opencode` o `github-copilot`. Añade `-g` para instalarla en todos tus proyectos. También puedes descargar el ZIP de cada skill desde la [última release](https://github.com/Growth4U-systems/sancho-skills/releases/latest).

## Qué hay

| Skill | Área | Agente en Sancho |
|---|---|---|
| [market-intelligence](skills/market-intelligence) | Research | Hamete |
| [existing-customer-data](skills/existing-customer-data) | Datos de clientes | Hamete |
| [swot-analysis](skills/swot-analysis) | Estrategia | Hamete |
| [channel-prioritization](skills/channel-prioritization) | Canales | Sin agente fijo |
| [landing-pages](skills/landing-pages) | Web y CRO | Dulcinea |
| [company-finder](skills/company-finder) | Prospección | Rocinante |
| [decision-maker-finder](skills/decision-maker-finder) | Prospección | Rocinante |
| [sales-call-prep](skills/sales-call-prep) | Ventas | Rocinante |
| [signal-definition](skills/signal-definition) | Señales | Sin agente fijo |
| [signal-monitor](skills/signal-monitor) | Señales | Hamete |

`catalog.json` tiene los metadatos de cada una: versión, commit de origen, archivos, contexto que necesita y herramientas del MCP de Sancho que menciona.

## Antes de instalar

Casi todas nacieron dentro de Sancho y citan herramientas de su MCP (`sancho_get_skill`, `sancho_update_document`…) o documentos de la Foundation de la marca (`brand/{slug}/…`). Fuera de Sancho funcionan como guía de método: el agente sigue el proceso, pero tendrás que darle tú ese contexto. La ficha de cada skill en `catalog.json` dice qué necesita.

## Pruebas

`evidence/<skill>/` guarda pruebas reales: entrada, salida, versión probada, comprobaciones y el registro completo de la ejecución. La primera es de existing-customer-data.

## Origen

Estas carpetas se exportan desde el repositorio privado de Sancho con `scripts/export.mjs`, que copia tal cual las skills listadas en `curation.json` y regenera `catalog.json`. No se editan a mano aquí.

Los frameworks citados en las skills (RFM, TOWS, Hormozi Core Four…) son de sus autores; la licencia MIT cubre nuestro texto, no sus métodos.

## Directorio

`site/` contiene el HTML, CSS y JS del directorio de SanchoCMO. La página lee `catalog.json`, cada `SKILL.md` y la evidencia de este repositorio en el navegador.

## Licencia

MIT. Copyright (c) 2026 Growth4U.

# Landing de nicho desde Foundation

Una sola estructura para la vista en vivo y la maqueta comentable. El generador
usa `src/lib/foundation-data/landing.ts`, el mismo modelo y renderer del Explorer.
Lee también `skills/_shared/foundation-data.md` y `skills/brand-voice/references/para-quien-escribes.md`.

| Orden | Sección              | Fuente                                                                                                                | Regla de CRO                                                        |
| ----- | -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1     | Titular y subtítulo  | UVP: `short` (una frase que promete; el renderer pone en cursiva lo que sigue a los dos puntos) y `landing` (cómo se cumple) | Qué ofrece y a quién, resultado antes que función                   |
| 2     | ¿Te suena?           | `problem.statement` y `name`, del nicho y citados por `legacyKey` en `hypothesis`/`objective` del UVP y los 4 bloques | Dolor antes que solución, palabras del comprador                    |
| 3     | Prueba temprana      | `asset.evidenceLinks` de los mensajes del nicho, con `evidence` activa y `voice=buyer                                 | analyst`                                                            | Prueba de cliente o tercero cerca de la promesa |
| 4     | Beneficios           | USP por importancia máxima de sus criterios para el nicho, máximo 4                                                   | Una idea por bloque; problema, cambio y detalle en el copy guardado |
| 5     | Preguntas frecuentes | `positioning.objections` en su orden; pregunta `objection`, respuesta `landing` del registro enlazado por `messageId` | Resolver barreras de compra, no añadir mensajes comerciales         |
| 6     | Cierre               | UVP repetida y `message.cta` de la UVP, como texto                                                                            | Una acción principal al llegar a la decisión                        |

El tipo técnico `anti_objection` conserva las respuestas enlazadas, pero se muestra
solo en Objeciones. Mensajes contiene UVP y USPs. Esa separación es de presentación,
sin migrar filas ni cambiar el tipo técnico. El campo opcional `message.cta` amplía
el contrato de la UVP y mantiene legibles las filas anteriores.

## Reglas de selección y revisión

- No investigar, inventar, resumir o reescribir el copy durante el render.
- Reglas de copy de toda landing: titular y títulos de bloque en una sola frase completa
  (nunca «hecho. Giro.», aunque la voz de marca lo pida; una pregunta frecuente puede llevar
  la premisa del comprador antes de la pregunta), subtítulo con el cómo, una idea
  por bloque con como mucho dos frases cortas, y ningún nombre de plan ni precio por plan.
  El render no las arregla: si el copy guardado las incumple, va como aviso de revisión y
  vuelve a `positioning-messaging`.
- Una fila con varios `nicheIds` sale en cada landing correspondiente. No copiarla.
  Separar mensajes solo cuando cambia el trabajo que quiere hacer el comprador.
- Problemas: primero referencias del UVP, luego las de los bloques ordenados;
  conservar su orden, quitar repetidos, máximo 3. No mezclar problemas de otro
  nicho ni archivados o descartados. Sin procedencia explícita, omitir la sección.
- Pruebas: sin logos, sellos, estrellas ni afirmaciones adicionales. Conservar
  el claim y la atribución; límites en una nota de revisión aparte, no el documento de fuente completo; sin prueba, omitir y avisar.
- UVP ausente, menos de 3 bloques, falta de prueba, ningún asset diferencial en los bloques, CTA ausente o DESIGN.md ausente:
  aviso de revisión. USPs sobrantes en «No colocados». Objeciones sin respuesta
  disponible en «Objeciones abiertas», fuera de la landing.
- Revisar que al menos un USP exprese un diferencial existente. Si no lo hay,
  declararlo en el resumen, nunca escribir uno para cumplir la cuota.
- Tokens de DESIGN.md mediante el parser existente. Fuentes declaradas que no
  estén en Google Fonts: sustitución registrada en comentario HTML. Sin DESIGN.md,
  estilo neutro y aviso. No generar iconos, logotipos o sellos del cliente.
- Maqueta: sin CTA enlazado ni enlaces externos, incluidas las pruebas. Solo
  navegación entre la homepage («General»), los nichos prioritarios y las páginas de
  papel, por enlaces compartidos con comentarios (ver
  [homepage.md](skills/landing-pages/references/homepage.md)). La vista en
  vivo puede abrir las fuentes para revisión interna.

## Generador dentro de la skill

Desde la raíz del checkout instalado, con Node y `tsx` de las dependencias del repo:

```bash
node --import tsx skills/landing-pages/scripts/build-niche-landings.mts --brand CLIENTE --output /tmp/landing-preview
```

Lee todas las páginas de las ocho tablas vía MCP y DESIGN.md vía `sancho_get_document`.
Usa `SANCHO_MCP_URL` y `SANCHO_MCP_TOKEN` del entorno; nunca tokens en argumentos.
Por defecto guarda HTML local y `receipts.json`, sin publicar ni crear enlaces.
Para un snapshot ya leído, preview offline:

```bash
node --import tsx skills/landing-pages/scripts/build-niche-landings.mts --brand CLIENTE --snapshot /tmp/snapshot.json --design /tmp/DESIGN.md --output /tmp/landing-preview
```

No se puede publicar desde un snapshot offline. Revisar escritorio y 375 px antes
de añadir `--write` a la lectura MCP. El CTA se redacta durante posicionamiento y
se guarda en `message.cta` de la UVP, junto con el titular y subtítulo. El generador
lo muestra literalmente; no usa un parámetro global para todos los nichos. Si falta
en una UVP antigua, se indica la carencia de datos en la cabecera de revisión.

La publicación usa el MCP existente, sin transportes privados ni scripts de un cliente:

1. Releer versiones para detectar cambios desde la generación. Publicar todos
   los documentos con preview/hash/CAS y lectura de vuelta.
2. Crear un enlace live por landing: `access=comment`, `expiresInHours=2160`.
3. Reescribir la barra con esos enlaces, `target=_top`, y volver a publicar/verificar.
   La barra lleva «General», los nichos prioritarios y las páginas de papel; los nichos
   no prioritarios no entran aunque el generador los pinte.
   El visor admite esa navegación solo después de un clic (SAN-1413).
4. Fijar `positioning.landingPath` con `update_fields`, versión esperada y readback.
   Conservar rutas existentes. Para un nicho nuevo, carpeta por UUID estable,
   evitando colisiones de nombres y cambios de ruta al renombrarlo.
5. Reportar enlaces, caducidades y recibos. Una operación parcial no es entrega
   completa: conservar los recibos y releer antes de reintentar escrituras.

Al caducar los enlaces, recrearlos y regenerar todas las barras. Cambiar un UVP
requiere refrescar su ficha de voz y su maqueta; no duplica mensajes en Markdown.

## Acceso desde Positioning Explorer

Los botones «Ver landing» abren el documento indicado por `positioning.landingPath`,
no el dashboard de la vista en vivo. El enlace relativo lleva `?review=1` y
`target="_top"`. En el visor compartido, una landing enlazada recibe su propio
visor de comentarios, con identidad de documento propia y la caducidad y revocación
del enlace de origen. Un enlace de solo lectura conserva ese permiso.
Sin `landingPath`, no se ofrece un botón de revisión que abra una vista sin comentarios.
La «Vista en vivo» conserva su acceso separado y explícito.

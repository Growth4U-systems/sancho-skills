# Homepage de marca desde la audiencia General

La homepage es la página de la audiencia General: el recorrido de una empresa que quiere
implantar la herramienta, en 3 a 5 preguntas, más una tarjeta por nicho prioritario que
lleva a su landing. Es una maqueta para revisar y comentar, igual que las landings de
nicho: sin botones ni enlaces de salida. El modelo de la General está en
[general-audience.md](skills/positioning-messaging/references/general-audience.md).

Lee también `skills/_shared/foundation-data.md`, [niche-landing.md](skills/landing-pages/references/niche-landing.md)
(las reglas de selección, pruebas, maqueta y publicación valen igual) y la voz de marca.

## Estructura

| Orden | Sección | Fuente | Regla |
|---|---|---|---|
| 1 | Titular y subtítulo | UVP de marca: `short` y `landing` | Qué gana una empresa, sin nicho |
| 2 | Bloques del recorrido | USP de marca, en el orden de `P1` a `Pn` de su `name` | Encima de cada bloque, la pregunta del comprador (lo que va tras `P<n> ·`). Debajo, el dolor literal de la tabla `problem` citado en la hipótesis, el titular `short` y el cuerpo `landing`. Un bloque por pregunta |
| 3 | Para quién | Una tarjeta por nicho prioritario: `shortName` del nicho y `short` de su UVP. Debajo, un enlace aparte por cada página de papel («Si revisas la seguridad») | Cada tarjeta enlaza a la landing del nicho y cada enlace de papel a su página (enlaces compartidos con comentarios en la maqueta). Solo nichos prioritarios y papeles |
| 4 | Prueba | `asset.evidenceLinks` de los mensajes de marca, con evidencia activa y `voice=buyer` o `analyst` | Las mismas reglas que en la landing de nicho |
| 5 | Preguntas frecuentes | `objections[]` de la fila de marca en su orden; respuesta = `landing` del mensaje enlazado por `messageId` | Entre 5 y 6 |
| 6 | Cierre | UVP de marca repetida y su `message.cta`, como texto | Una acción principal |

## Reglas

- **Solo datos de las tablas.** No se investiga, resume ni reescribe copy al montar la
  página. Si falta un mensaje, se avisa; no se escribe uno para rellenar. Mientras el
  schema no admita mensajes de marca (SAN-1422), su borrador vive en `notes` de la fila de
  marca: la maqueta se monta desde ese borrador, literal, con un aviso de revisión que lo
  diga.
- **Nichos no prioritarios fuera.** No tienen tarjeta en «Para quién» ni entrada en la
  barra. Sus landings siguen existiendo; no se borran.
- **Barra superior:** «General» primero (la página actual, marcada con
  `aria-current="page"`), después los nichos prioritarios y al final las páginas de papel.
  Las landings de nicho y las páginas de papel llevan la misma barra. Nada más enlaza.
  Hoy el generador pone en la barra todos los nichos y no tiene «General»: hasta
  SAN-1422, la barra se reescribe después de generar (paso 3 de la publicación), en cada
  regeneración.
- **Avisos de revisión** en la cabecera, sin tapar la página: falta la UVP de marca o su
  `cta`, hay menos de 3 o más de 5 bloques, un bloque sin dolor citado, preguntas
  frecuentes fuera de 5 a 6, ningún nicho prioritario marcado, un nicho prioritario sin
  landing publicada, una pregunta del recorrido que se quedó sin USP (queda en objeciones
  abiertas) o falta DESIGN.md.
- Las reglas de copy de [niche-landing.md](skills/landing-pages/references/niche-landing.md)
  valen igual: titular de una frase, subtítulo con el cómo, una idea por bloque y ningún
  nombre de plan ni precio por plan.
- Tokens de DESIGN.md con el parser existente, igual que las landings de nicho.

## Página de papel

Un papel es quien interviene en la compra dentro de cualquier nicho (IT, seguridad,
compliance…), no un nicho (ver
[general-audience.md](skills/positioning-messaging/references/general-audience.md)). Su
página es lo que el comprador de cualquier nicho reenvía a esa persona: «Si revisas la
seguridad». Mismas reglas de maqueta que la landing de nicho. Mientras su fuente sea una
fila de nicho, el generador la pinta como landing de nicho («¿Te suena?» incluido, USP
ordenadas por su importancia en la propia fila, máximo 4); lo que no coincida con la tabla
de abajo va como aviso de revisión, no se arregla a mano.

| Orden | Sección | Fuente |
|---|---|---|
| 1 | Titular y subtítulo | La UVP de la fila de positioning del papel: lo que esa persona necesita comprobar, dicho como lo que obtiene |
| 2 | Bloques | Una USP por criterio del papel con asset y evidencia, ordenadas por lo que más pesa en los nichos prioritarios |
| 3 | Prueba y documentos | `evidenceLinks` de esos assets; lo que se puede enseñar (certificaciones, contrato de tratamiento, subencargados) solo si existe |
| 4 | Preguntas frecuentes | `objections[]` de la fila del papel |
| 5 | Cierre | Qué pedir y a quién, como texto (`cta` de la UVP) |

- Mientras el schema no tenga papeles, su fila `positioning` (la que tenía cuando estaba
  modelado como nicho) es la fuente, y su `landingPath` apunta a esta página. Conserva la
  ruta que ya tuviera; no crees una carpeta nueva por el cambio de nombre.
- Lo que no se puede demostrar (una certificación que no existe, una retención que la
  política pública contradice) no se insinúa: queda en avisos de revisión.
- No lleva tarjeta de nicho en ninguna página: se enlaza desde «Para quién» de la homepage
  y desde la barra.

## Generador y publicación

La vista en vivo de la General y su render desde las tablas llegan con SAN-1422, con la
misma lógica que la landing de nicho (SAN-1356). Mientras `build-niche-landings.mts` no
tenga el modo homepage, monta la maqueta con un script que lee las tablas por MCP y
reutiliza la plantilla y los tokens de la landing de nicho: ninguna línea de copy se
escribe a mano en el HTML. Dilo en el resumen de la ejecución.

Publicación, con los mismos pasos que [niche-landing.md](skills/landing-pages/references/niche-landing.md):

1. Publicar en `brand/{slug}/go-to-market/landings/general/general.current.html`, con
   preview, hash, CAS y lectura de vuelta.
2. Enlace compartido por página (`access=comment`, `expiresInHours=2160`).
3. Reescribir la barra de la homepage, de las landings de los nichos prioritarios y de
   las páginas de papel con esos enlaces (`target="_top"`) y volver a publicar.
4. Fijar `landingPath` en la fila `positioning` de marca con `update_fields`, versión
   esperada y lectura de vuelta.
5. Reportar enlaces, caducidad y recibos.

Cambiar la UVP de marca, una USP, una pregunta frecuente o la lista de nichos
prioritarios obliga a regenerar la homepage, y la barra de las landings si cambian los
nichos.

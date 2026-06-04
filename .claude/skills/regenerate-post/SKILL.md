---
name: regenerate-post
description: Regenera UN post existente aplicando el feedback del usuario, sin tocar el resto del calendario. Invocar cuando el usuario pide rehacer o cambiar un post específico.
allowed-tools: Read, Edit(content/calendars/**), AskUserQuestion
---

# Regenerar post individual

1. Leer el post indicado en `$ARGUMENTS` desde `content/calendars/`.
2. Leer `config/rubro.yaml` para mantener el tono.
3. Si el usuario no pasó feedback junto al id, preguntar: "¿Qué querés cambiar de este post?"

## Aplicar el feedback

Casos comunes:
- "Más directo": reducir texto, CTA más claro
- "Menos agresivo": bajar tono de venta, más valor
- "Para Facebook": adaptar caption para FB (más largo, más texto)
- "Para historia": reducir a 3 líneas máx, sticker pregunta
- "Cambiar el CTA": reemplazar solo la sección CTA
- "La foto no va": proponer nuevo image_prompt
- "El precio está mal": actualizar el número y regenerar

## Regenerar solo lo pedido

No tocar lo que no pidió cambiar.
Si cambió el texto, regenerar también `dm_response` y `whatsapp_cta` para que sean coherentes.

## Guardar y mostrar

Actualizar el archivo, mantener `status: draft` (el usuario lo aprueba explícito).
Mostrar el post actualizado.
Sugerir: "Revisalo y si está bien: `/approve-post <id>`"

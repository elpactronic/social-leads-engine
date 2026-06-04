---
name: publish-post
description: Publica un post a Instagram/Facebook vía Graph API. Requiere status ready o approved e image_url presente. Usar cuando el usuario dice "publicar post X", "publica el N", "/publish-post".
allowed-tools: Read, Edit(content/calendars/**), Bash(npx tsx *)
---

# Publicar post

1. Leer el post indicado (`$ARGUMENTS`) desde `content/calendars/`.
2. Validaciones:
   - `status` debe ser `ready` o `approved`. Si no: detener y explicar.
   - `image_url` no debe estar vacío. Si lo está: sugerir `/generate-image <id>` primero.
   - `.env` debe tener `IG_ID` e `IG_ACCESS_TOKEN`.

## Ejecutar

```
npx tsx packages/core/src/scripts/run-publish.ts <id>
```

El script:
1. Crea el container en IG con la imagen y el caption (text + subtext + cta).
2. Espera que el container esté listo.
3. Publica.
4. Actualiza `container_id` y `published_at` en el `.md`.
5. Cambia `status` a `published`.
6. Archiva una copia inmutable en `content/published/`.

## Resultado

Mostrar: "Post `<id>` publicado. published_at: <timestamp>. Container ID: <id>."
Sugerir: "Si llegan DMs por este post, usá `/generate-dm-response` para obtener respuestas."

Si falla: mostrar error de la API, no modificar el status. Dejar `image_error` para diagnóstico.

## Plataforma

Por ahora: solo Instagram Graph API.
Facebook requiere Page ID separado (TODO en v0.2).
TikTok: generación manual, no hay publicación automática.

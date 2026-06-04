---
name: generate-image
description: Genera la imagen de fondo de un post llamando a kie.ai con su image_prompt. Usar cuando el usuario dice "generar imagen del post X", "genera la imagen de la N", "/generate-image".
allowed-tools: Read, Edit(content/calendars/**), Bash(npx tsx *)
---

# Generar imagen de post

1. Leer el post indicado (`$ARGUMENTS`) desde `content/calendars/`.
2. Verificar que `status` es `approved` (no generar imágenes de drafts no aprobados).
3. Verificar que `image_url` está vacío (si ya tiene imagen, preguntar si reemplazar).
4. Verificar que `image_prompt` no está vacío. Si lo está, avisar y detener.

## Ejecutar

```
npx tsx packages/core/src/scripts/run-kie.ts <id>
```

El script llama a kie.ai, espera el resultado, y actualiza el `.md` con:
- `image_url`: URL de la imagen generada
- `status`: `ready` (si éxito) o `failed` (si error)
- `image_error`: mensaje de error si falla

## Resultado

Mostrar: "Imagen generada para `<id>`. Status: ready. URL: <url>"
Sugerir: "Siguiente paso: `/publish-post <id>`"

Si falla: mostrar el error y sugerir revisar el `image_prompt` o la API key.

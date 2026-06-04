---
name: approve-post
description: Cambia el status de un post de draft a approved. Usar cuando el usuario dice "aprobar post X", "aprueba el N", "/approve-post".
allowed-tools: Read, Edit(content/calendars/**)
---

# Aprobar post

Si `$ARGUMENTS` tiene un id: buscar ese post en `content/calendars/`.
Si no tiene argumento: mostrar la lista de posts en `draft` del día actual y preguntar cuál aprobar.

Para el post indicado:
1. Leer el archivo `.md`.
2. Verificar que `status` es `draft` o `needs-revision`.
3. Cambiar `status` a `approved`.
4. Guardar.

Mostrar confirmación: "Post `<id>` aprobado. Siguiente paso: `/generate-image <id>`"

Si el status ya es `approved` o superior: avisar sin modificar.

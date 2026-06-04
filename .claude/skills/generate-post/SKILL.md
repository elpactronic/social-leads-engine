---
name: generate-post
description: Genera UN post individual (no calendario completo) para un tema, propiedad o producto específico. Usar cuando el usuario quiere un post puntual, no un día entero.
allowed-tools: Read, Write(content/calendars/**), AskUserQuestion
---

# Generar post individual

1. Leer `config/rubro.yaml`. Si no existe: pedir ejecutar `/configure-rubro`.
2. Si `$ARGUMENTS` es un `propiedad_id`, leer `content/propiedades/<id>.md`.
3. Si `$ARGUMENTS` es un tema o descripción libre, usarlo como contexto.

## Preguntas si el usuario no especificó

Si no está claro, preguntar:
- ¿Para qué plataforma? (instagram / facebook / tiktok / multi)
- ¿Qué formato? (post / carrusel / historia / reel)
- ¿Qué etapa del funnel? (atracción / confianza / objeción / consulta / cierre)
- ¿Hay foto disponible? (sí / no)

## Generar el post

Seguir las mismas reglas de copy que `/generate-calendar`.

El id se forma con la fecha del día actual + slot = 1 (o el siguiente disponible si ya hay posts ese día).

## Guardar

En `content/calendars/YYYY-MM-DD/<slot>-<slug>.md`.

## Mostrar

El post completo (text, subtext, cta, dm_response, whatsapp_cta, image_prompt).
Sugerir: "Si está bien, aprobá con `/approve-post <id>`"

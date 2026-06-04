---
name: generate-calendar
description: Genera un calendario completo de posts para un día dado, aplicando el perfil del rubro, la knowledge base del rubro y el funnel 60/40. Invocar cuando el usuario pide generar contenido para un día o tema.
allowed-tools: Read, Write(content/calendars/**), AskUserQuestion
---

# Generar calendario de posts

## Precondiciones

1. Verificar que existe `config/rubro.yaml`. Si no: invocar `/configure-rubro` primero.
2. Leer `config/rubro.yaml` para obtener: rubro, tono, plataformas, posts_per_day, ratio.
3. Leer `content/knowledge-base.md` (genérico) + `content/rubros/<rubro>.md` si existe.
4. Si el argumento (`$ARGUMENTS`) es un `propiedad_id`: leer también `content/propiedades/<id>.md`.

## Planificación

Determinar N = `calendar_defaults.posts_per_day` (default: 3).
Distribución por funnel_stage según el ratio del config:
- 60% valor/confianza: awareness, trust, objection
- 40% venta: consultation, closing

Asignar una plataforma por post según las plataformas activas del config.
Asignar un formato por post (post, carrusel, historia, reel) variando para no repetir.

## Para cada post, generar:

Frontmatter completo:
- `id`: `YYYY-MM-DD-NN`
- `date`: fecha del calendario
- `slot`: número de orden
- `status`: draft
- `platform`: plataforma asignada
- `format`: formato asignado
- `funnel_stage`: etapa del funnel
- `function`: gancho / empatia / insight / prueba / cta / objecion / urgencia / etc.
- `sale`: true si es conversion directa
- `rubro`: tipo del rubro
- `image_model`: "kie-z-image-01" (default)
- `image_url`: ""
- `container_id`: ""
- `published_at`: ""

Secciones de cuerpo:
- `## Text`: copy principal adaptado a la plataforma y formato
- `## Subtext`: línea de apoyo (vacía si sobra)
- `## CTA`: acción concreta (escribir, enviar DM, ver link, etc.)
- `## DM Response`: respuesta sugerida si alguien comenta/escribe por este post
- `## WhatsApp CTA`: mensaje precargado para link wa.me (si aplica)
- `## Image prompt`: descripción en inglés de la imagen de fondo para kie.ai
- `## Notes`: notas internas para el operador

## Reglas de copy

- Aplicar "regla del niño de 8 años": frases cortas, una idea por oración.
- Los términos técnicos del rubro (ej: expensas, garantía, m2) se mantienen.
- Tono del config (pronoun, catchphrases, banned_words).
- El CTA es siempre la acción más simple posible (DM, WhatsApp, comentar).
- Para inmuebles: incluir precio si está disponible, zona siempre.
- Para panadería: incluir horario de despacho o si es por pedido.

## Guardar

Crear archivos en `content/calendars/YYYY-MM-DD/<slot>-<slug>.md`.
El slug es una versión kebab-case del tema del post (3-4 palabras).

## Mostrar resumen

Tabla con id, plataforma, formato, funnel_stage, function, primeras palabras del text.
Sugerir: "Revisá los posts y aprobá con `/approve-post <id>` o regenerá con `/regenerate-post <id>`"

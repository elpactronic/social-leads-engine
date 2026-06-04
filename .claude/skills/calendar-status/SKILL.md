---
name: calendar-status
description: Muestra tabla con id, status, plataforma, formato, funnel_stage y primeras palabras de todos los posts de un calendario. Usar cuando el usuario dice "estado del calendario", "qué posts tengo", "/calendar-status".
allowed-tools: Read, Glob, Bash(npx tsx *)
---

# Estado del calendario

Si `$ARGUMENTS` tiene una fecha (YYYY-MM-DD), mostrar el calendario de esa fecha.
Si no, mostrar el calendario del día actual.
Si hay una bandera `--all`, mostrar resumen de todos los calendarios.

## Tabla por día

| ID | Status | Plataforma | Formato | Etapa | Función | Imagen | Primeras palabras |
|----|--------|-----------|---------|-------|---------|--------|------------------|
| 2026-06-10-01 | approved | instagram | post | awareness | gancho | ✓ | "Esta semana..." |

Indicar con ✓/✗ si tiene image_url.
Indicar el `published_at` si está publicado.

## Tabla resumen (--all)

| Fecha | Total | Draft | Approved | Ready | Published | Failed |
|-------|-------|-------|----------|-------|-----------|--------|

## Recomendaciones automáticas

Después de la tabla, mostrar:
- Posts en `draft`: "Pendientes de revisión"
- Posts `approved` sin imagen: "Listos para generar imagen"
- Posts `ready`: "Listos para publicar"
- Posts `failed`: "Tuvieron error, revisar"

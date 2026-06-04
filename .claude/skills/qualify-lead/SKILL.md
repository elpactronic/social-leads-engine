---
name: qualify-lead
description: Registra y califica un lead en content/leads/, evalúa si derivar a WhatsApp y sugiere siguiente paso. Usar cuando el usuario quiere hacer seguimiento formal de una consulta.
allowed-tools: Read, Write(content/leads/**), AskUserQuestion
---

# Calificar y registrar lead

## Recopilar datos del lead

Si `$ARGUMENTS` tiene un id, cargar el lead existente y actualizar.
Si no, crear uno nuevo preguntando:

1. ¿De qué plataforma viene? (instagram / facebook / tiktok / whatsapp / web / otro)
2. Mensaje inicial (copiar/pegar)
3. ¿Tiene nombre o @?
4. Para inmuebles: ¿alquiler o compra? ¿zona? ¿presupuesto? ¿cuándo necesita?
5. Para otros rubros: ¿qué producto/servicio busca? ¿tiene presupuesto claro?

## Calificación automática

Evaluar el lead según criterios del rubro:

**Inmuebles — Lead calificado si:**
- Tiene intención clara (alquiler o compra)
- Mencionó zona compatible con lo disponible
- Tiene presupuesto realista o dispuesto a discutirlo
- Timing dentro de 90 días

**Genérico — Lead calificado si:**
- Necesidad real expresada
- Presupuesto aproximado
- Timing no lejano (menos de 30 días para mayoría de rubros)

## Proponer siguiente paso

Si califica:
- Status → `calificado`
- Mostrar: "Este lead califica. Derivar a WhatsApp: [link wa.me]"
- Actualizar `status` → `derivado-whatsapp` cuando el usuario confirme que lo derivó

Si no califica aún:
- Status → `contactado`
- Mostrar: "Todavía no califica. Seguir en DM con: [respuesta sugerida]"

Si definitivamente no encaja:
- Status → `no-califica`
- Mostrar: "No encaja con lo disponible. Dejar abierto o archivar."

## Guardar

Crear/actualizar `content/leads/<id>.md`.
ID formato: `LEAD-YYYYMMDD-NN`.

## Mostrar resumen

id, plataforma, status, interes, zona (si aplica), presupuesto (si aplica), siguiente paso.

---
name: add-propiedad
description: Agrega una nueva propiedad a content/propiedades/ con todos sus datos para generar contenido. Usar cuando el usuario entrega datos de una nueva propiedad para publicar (inmobiliaria).
allowed-tools: Read, Write(content/propiedades/**), AskUserQuestion
---

# Agregar propiedad

Usado exclusivamente en rubro `inmuebles`. Si `rubro.type != inmuebles`, avisar y detener.

## Paso 1 — Datos obligatorios

Preguntar o extraer del texto del usuario:
- ¿Es para alquiler, venta, o ambas?
- ¿Qué tipo de inmueble? (casa / departamento / dúplex / local / terreno / galpon / cochera)
- Dirección (calle y número o referencia)
- Zona / barrio
- Precio y moneda (ARS / USD)
- Al menos 1 foto (pedir URL o confirmar que la tiene)

## Paso 2 — Datos enriquecedores (pedir si no fueron dados)

- Superficie total y/o cubierta en m²
- Ambientes, dormitorios, baños
- ¿Tiene cochera?
- ¿Qué edad tiene la propiedad?
- Piso (si es departamento)
- Expensas (si aplica)
- ¿El precio es negociable?

## Paso 3 — Descripción libre

Pedir al usuario que describa con sus palabras:
- Qué tiene de especial esta propiedad
- El entorno (qué hay cerca: parques, transporte, comercios, escuelas)
- Notas internas que no van al público (problemas, condiciones del dueño, etc.)

## Paso 4 — Generar el archivo

Generar ID con formato `INM-YYYYMM-NN` (NN = número correlativo del mes).
Crear `content/propiedades/<id>.md` con frontmatter completo y secciones de cuerpo.

## Paso 5 — Confirmar y sugerir siguiente paso

Mostrar resumen: id, tipo, precio, zona, estado: disponible.
Sugerir: "¿Querés generar un post para esta propiedad? Usá `/generate-post <id>` o `/generate-calendar <id>`"

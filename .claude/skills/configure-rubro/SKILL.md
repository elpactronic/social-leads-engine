---
name: configure-rubro
description: Entrevista interactiva para crear config/rubro.yaml (negocio, cliente, contacto, plataformas, tono, modo de operación). Invocar SOLO cuando el usuario pide configurar el negocio, o cuando otra skill detecta que rubro.yaml no existe.
allowed-tools: Read, Write(config/**), AskUserQuestion
---

# Configurar perfil del negocio

Si ya existe `config/rubro.yaml`, leerlo y preguntar si quiere actualizar secciones específicas.

Si no existe, hacer la entrevista completa:

## Paso 1 — Tipo de rubro

Preguntar:
- ¿Cuál es el rubro del negocio?
  Opciones: inmuebles | panaderia | camaras-seguridad | reparacion-pc | bricolage | souvenirs | tupper-cakes | gastronomia | moda | servicios-profesionales | generico

## Paso 2 — Datos del negocio

Preguntar:
- Nombre del negocio
- Una línea que describa qué hace y para quién
- Productos o servicios principales (pedir lista de 2-5)
- Zona geográfica / ciudad de cobertura

## Paso 3 — Cliente ideal

Preguntar:
- ¿Quién es el cliente típico? (edad, situación, necesidad)
- ¿Qué problema le resuelve el negocio?
- ¿Qué desea lograr el cliente?
- ¿Cuáles son las 2-3 objeciones más comunes que escucha?

## Paso 4 — Contacto y plataformas

Preguntar:
- Número de WhatsApp (con código de país, ej: +5491100000000)
- ¿Tiene Instagram? ¿Cuál es el @?
- ¿Tiene Facebook? ¿Cuál es la página?
- ¿Tiene TikTok? ¿Cuál es el @?

## Paso 5 — Modo de operación

Explicar brevemente los tres modos y preguntar cuál prefiere:
- Modo simple: genera contenido, publica manualmente, responde DMs a mano, deriva a WhatsApp cuando califica.
- Modo intermedio: agrega landing de catálogo y flujo de calificación más estructurado.
- Modo avanzado: automatización con GoHighLevel (FUTURO, v0.2).

## Paso 6 — Tono y marca

Preguntar:
- ¿Cómo describirías el tono del negocio? (ej: "cercano y simpático", "profesional pero humano")
- ¿Tuteo o voseo? (vos / tú / usted)
- ¿Hay palabras o frases que no quiere usar?
- ¿Colores principales del negocio? (si no tiene, proponer palette por defecto según rubro)

## Paso 7 — Calendario

Preguntar:
- ¿Cuántos posts por día son manejables? (recomendar 2-3)
- ¿En qué horario prefiere publicar?

## Generar el archivo

Con toda la info, generar `config/rubro.yaml` completo.
Informar que también existe `config/rubros/<rubro>.yaml.example` como referencia.

Mostrar resumen: nombre, rubro, plataformas, modo, contacto (sin el token completo).

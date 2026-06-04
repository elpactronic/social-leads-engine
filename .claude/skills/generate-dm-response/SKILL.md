---
name: generate-dm-response
description: Dado un mensaje entrante por DM o comentario, genera una respuesta sugerida y decide si derivar a WhatsApp o continuar calificando. Usar cuando el usuario quiere responder a alguien que escribió por una publicación.
allowed-tools: Read, AskUserQuestion
---

# Generar respuesta a DM

## Recopilar contexto

Pedir al usuario:
1. El mensaje exacto que recibió (copiar/pegar o describir)
2. ¿Por qué post/propiedad escribió? (para dar contexto relevante)
3. ¿Es la primera vez que esa persona escribe o ya hubo conversación?

## Leer el config

Leer `config/rubro.yaml` para obtener: tono, whatsapp, catchphrases, rubro.
Si el rubro es `inmuebles`: leer también `content/rubros/inmuebles.md` sección "Flujo de calificación".

## Analizar el mensaje

Clasificar el intento del mensaje:
- Consulta general (precio, disponibilidad, información)
- Interés específico (pregunta por propiedad/producto concreto)
- Objeción (precio alto, no le alcanza, no confía aún)
- Listo para comprar/visitar (urgencia clara)
- Solo explorador (no hay timing ni presupuesto)

## Generar respuesta

**Si es consulta general o interés inicial:**
Responder con saludo + 1 pregunta de calificación (máx).
No enviar precio ni info completa todavía.
Ejemplo para inmuebles:
> "¡Hola! Qué bueno que te interesa. ¿Buscás para alquilar o para comprar?"

**Si ya dio contexto suficiente (zona, presupuesto, timing) y califica:**
Proponer derivar a WhatsApp:
> "Perfecto, tengo opciones que te pueden interesar. ¿Seguimos por WhatsApp para que te mande las fotos y coordinar? [link]"
Mostrar el link wa.me construido con el número del config y mensaje precargado.

**Si hay objeción:**
Responder la objeción con info real, no ignorarla.
Ejemplo: "Los precios subieron, pero en [zona] todavía hay opciones en [rango]. ¿Cuánto estás pensando gastar?"

**Si es explorador sin urgencia:**
Respuesta corta, dejar la puerta abierta:
> "Claro, cuando estés listo te ayudo. Por acá estoy o escribime al WhatsApp cuando quieras."

## Mostrar al usuario

- Respuesta sugerida (lista para copiar/pegar)
- Decisión: DERIVAR A WHATSAPP / SEGUIR CALIFICANDO / DEJAR ABIERTO
- Link de WhatsApp listo si corresponde derivar
- Nota: si quiere registrar este lead, usar `/qualify-lead`

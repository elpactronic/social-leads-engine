# Knowledge base — Social Leads Engine (Multi-rubro)

Base de conocimiento genérica para generación de contenido comercial.
Para knowledge base específica por rubro: ver `content/rubros/<rubro>.md`.

---

## 1. Taxonomía de rubros soportados

| Rubro | Tipo en config | Modo recomendado |
|-------|---------------|-----------------|
| Inmobiliaria / agente de propiedades | `inmuebles` | simple / intermedio |
| Panadería / pastelería / confitería | `panaderia` | simple |
| Cámaras / seguridad electrónica | `camaras-seguridad` | simple / intermedio |
| Reparación de PC / servicio técnico | `reparacion-pc` | simple |
| Bricolage / productos artesanales | `bricolage` | simple |
| Souvenirs / regalería personalizada | `souvenirs` | simple |
| Tupper cakes / tartas personalizadas | `tupper-cakes` | simple |
| Gastronomía / delivery / catering | `gastronomia` | simple |
| Moda / ropa / accesorios | `moda` | simple |
| Servicios profesionales | `servicios-profesionales` | intermedio |
| Genérico (cualquier emprendimiento) | `generico` | simple |

---

## 2. Campos de entrada por tipo de contenido

### Post de producto / servicio
- nombre del producto/servicio
- precio (si aplica)
- foto(s)
- características principales (3-5 puntos)
- a quién le sirve / para qué situación
- CTA deseado (DM, WhatsApp, link, visita)

### Post educativo / de valor
- tema o pregunta a responder
- a quién le duele este problema
- respuesta en lenguaje simple
- CTA suave al final

### Post de testimonio
- nombre (o alias) del cliente
- situación antes
- resultado después
- cita textual si hay

### Post de urgencia / oferta
- oferta concreta (descuento, promoción, últimas unidades)
- fecha de vencimiento
- precio antes/después si aplica
- CTA directo

---

## 3. Formatos de salida por plataforma

### Instagram

**Feed (post cuadrado o vertical):**
- Texto principal: máx. 125 caracteres antes de "ver más"
- Hasta 3 emojis en el texto visible
- Caption: hasta 2.200 caracteres; primeras 2-3 líneas son las que se ven sin expandir
- Hashtags: 5-10 relevantes, al final
- CTA: en la última línea del caption

**Historia (9:16):**
- Texto muy corto, máx. 2-3 líneas, cuerpo grande
- Sticker de pregunta o encuesta para interacción
- Swipe up / link si hay cuenta verificada o bio link

**Carrusel:**
- Diapositiva 1: gancho fuerte (pregunta, dato, afirmación)
- Diapositivas 2-7: desarrollo (una idea por slide)
- Última diapositiva: CTA claro

**Reels:**
- Primeros 2-3 segundos son todo
- Texto en pantalla que complete lo que se dice (no repita)
- Música o audio trending si aplica

### Facebook

- Caption más larga aceptada (Facebook favorece texto)
- Primeras 2-3 líneas son el gancho (antes del "ver más")
- Compartible: incluir info completa sin necesidad de ir al bio
- Reacciones y comentarios: preguntar al final para generar interacción
- Grupos locales: adaptar tono a la comunidad del grupo

### TikTok

- Primeros 2 segundos: gancho visual o verbal fuerte
- Duración ideal: 30-60 segundos para educativo, 15-30 para producto
- Texto en pantalla: breve, sincronizado con el audio
- Sonido: preferir audios trending o hablar directo a cámara
- Hashtags: 3-5 relevantes + 1-2 genéricos de alto volumen

---

## 4. Modos de operación

### Modo simple
- Quién: emprendedores solos, sin automatización
- Qué hace: genera copy para RRSS → operador lo publica manualmente → responde DMs manualmente → deriva a WhatsApp cuando califica
- Herramientas: solo este sistema + WhatsApp
- Costo de setup: mínimo

### Modo intermedio
- Quién: negocios con algo de volumen y tiempo para configurar
- Qué agrega: preguntas de calificación semi-automáticas, landing page simple, catálogo digital
- Herramientas: este sistema + landing generada + link en bio
- Costo de setup: bajo (landing estática o Linktree)

### Modo avanzado
- Quién: negocios con volumen o que quieren escalar
- Qué agrega: agente de respuesta automática, CRM (GoHighLevel), integración WhatsApp Business API, seguimiento de leads
- Herramientas: este sistema + GHL + WA Business API
- Costo de setup: requiere suscripción GHL (~$97/mes) + configuración de flujos
- Estado: FUTURO — documentado pero no implementado en v0.1

---

## 5. Flujo universal de calificación de leads

Aplica a todos los rubros. Adaptar las preguntas específicas.

```
1. Lead ve contenido en RRSS
2. Comenta o manda DM
3. Primer mensaje de respuesta: saludo + pregunta de interés inicial
   → "¡Hola! ¿En qué te puedo ayudar? ¿Buscás [producto/servicio] para vos o para regalar?"
4. Responde:
   → Califica (presupuesto, timing, necesidad real): derivar a WhatsApp con link
   → No califica todavía: nutrir con más info, invitar a seguir la cuenta, ofrecer responder dudas
5. En WhatsApp: atención humana, cerrar venta o visita
6. Registrar en leads/ si se quiere tracking
```

---

## 6. Estructura de calendario semanal genérico

Ratio base: 60% valor/confianza + 40% venta directa

| Día | Tipo de contenido |
|-----|------------------|
| Lunes | Presentación de producto/servicio (venta suave) |
| Martes | Educativo / respuesta a duda frecuente |
| Miércoles | Testimonio o caso de éxito |
| Jueves | Objeción respondida |
| Viernes | CTA directo / oferta / urgencia |
| Sábado | Behind the scenes / personal |
| Domingo | Descanso o repost |

Ajustar según el rubro:
- Panadería: publicar temprano (7-9am), contenido visual de productos frescos
- Inmobiliaria: publicar a media mañana (9-11am) cuando la gente revisa propiedades
- Servicios técnicos: publicar a la tarde (17-19pm) cuando la gente llega del trabajo con el problema

---

## 7. Decisión de herramienta según rubro y volumen

| Situación | Recomendación |
|-----------|--------------|
| 1-2 publicaciones/día, responde ella misma | Modo simple — solo este sistema |
| Muchas consultas repetitivas | FAQ en historia destacada + respuesta rápida guardada en WA |
| Quiere mostrar catálogo sin web | Landing generada con /generate-landing |
| Leads se pierden sin seguimiento | Carpeta content/leads/ con archivos de seguimiento |
| Quiere automatizar respuestas | Modo avanzado (GHL) — documentado, no implementado aún |
| Múltiples canales y clientes | Un config/rubro.yaml por cliente, carpeta por proyecto |

---

## 8. Señales de que un lead califica para WhatsApp

Universal:
- Hace más de 1 pregunta específica
- Menciona timing concreto ("para el mes que viene", "urgente")
- Pregunta por precio con contexto ("¿y si quiero uno de X tamaño?")
- Pregunta por cómo hacer el pedido o cómo comprar
- Vuelve a escribir después de que le contestaste

Señal de NO derivar todavía:
- Solo dice "cuánto sale" sin contexto
- Dice "estoy mirando opciones"
- No responde las preguntas de calificación

---

## 9. Estructura de DM response sugerida por rubro

Ver `content/rubros/<rubro>.md` para respuestas específicas.

Estructura universal:
1. Saludo personalizado (usar nombre si lo tienen)
2. Validar el interés ("Qué bueno que escribís...")
3. Hacer máximo 1 pregunta de calificación por mensaje
4. Si califica: ofrecer WhatsApp con contexto ("para no perdernos por acá")
5. Si no califica: dejar la puerta abierta ("avisame cuando lo necesites")

---

## 10. Reglas de copy para pequeños negocios

- Frases cortas. Una idea por oración.
- Evitar tecnicismos salvo que el rubro los use habitualmente.
- No prometer lo que no se puede cumplir.
- Siempre hay un humano detrás: no sonar robot.
- El CTA es siempre la acción más simple posible (escribir, no comprar en 3 pasos).
- El precio: nombrar o sugerir rango siempre que sea posible. "Consultar precio" solo cuando hay variabilidad real.
- No más de 3 emojis en caption. Solo donde refuerzan, no como decoración.

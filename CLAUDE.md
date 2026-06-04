# social-leads-engine

Motor de contenido comercial y captación de leads para pequeños negocios locales.
Genera copy para redes sociales (Instagram, Facebook, TikTok), gestiona el flujo
de leads desde el primer mensaje hasta la derivación a WhatsApp, y escala desde
operación manual hasta integración con CRM.

**Primer caso de uso implementado:** inmobiliaria / agente de propiedades.

Diseñado para reutilizarse en panadería, seguridad, reparación de PC, bricolage,
souvenirs, tupper cakes y cualquier emprendimiento local.

## Stack

- Node 22+ con TypeScript estricto
- Next.js 15 (App Router)
- Vitest para tests
- Storage local: archivos Markdown con frontmatter en `content/`
- AI generation: skills de Claude Code (sin SDK externo de LLM)
- Image generation: kie.ai (HTTP fetch directo)
- Publicación: Instagram/Facebook Graph API v25.0 (HTTP fetch directo)

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm start`
- Test: `npm test`
- Type check: `npm run typecheck`
- Lint: `npm run lint`

---

## Arquitectura

Monorepo con npm workspaces:

- `packages/core/` — `@social-leads/core`. Lógica reutilizable.
  - `src/lib/rubro.ts` — cargar `config/rubro.yaml`, construir prompts e imagen.
  - `src/lib/content.ts` — leer/escribir `.md` de posts.
  - `src/lib/propiedad.ts` — leer/escribir `.md` de propiedades (inmobiliaria).
  - `src/lib/lead.ts` — leer/escribir `.md` de leads.
  - `src/lib/kie.ts` — cliente HTTP kie.ai.
  - `src/lib/instagram.ts` — cliente HTTP Instagram/Facebook Graph API.
  - `src/lib/markdown.ts` — renderer Markdown → HTML.
  - `src/lib/zip.ts` — empaquetado de imágenes.
  - `src/lib/paths.ts` — `getProjectRoot()` para resolver rutas.
  - `src/types/post.ts` — tipos Post, PostStatus, PostPlatform, FunnelStage.
  - `src/types/propiedad.ts` — tipos Propiedad, TipoOperacion, EstadoPropiedad.
  - `src/types/lead.ts` — tipos Lead, LeadStatus, LeadInteres.
  - `src/types/rubro.ts` — tipo RubroConfig, RubroType, OperatingMode.
  - `src/index.ts` — barrel público.
  - `src/scripts/` — scripts CLI invocables con `npx tsx`.
- `apps/web/` — `@social-leads/web`. Web app Next.js.

Datos del usuario (viven en la raíz):

- `content/calendars/<fecha>/` — posts generados por día.
- `content/propiedades/` — fichas de propiedades (inmobiliaria).
- `content/leads/` — tracking de leads.
- `content/landings/` — páginas de catálogo o campaña generadas.
- `content/published/` — log inmutable (NO editar).
- `content/rubros/inmuebles.md` — knowledge base del rubro inmobiliario.
- `content/knowledge-base.md` — knowledge base genérico multi-rubro.
- `config/rubro.yaml` — configuración del negocio activo.
- `config/rubros/` — ejemplos por rubro (`.yaml.example`).

---

## Taxonomía de rubros

| Tipo | Descripción | KB específica |
|------|-------------|--------------|
| `inmuebles` | Agente/inmobiliaria, alquiler y venta | content/rubros/inmuebles.md |
| `panaderia` | Panadería, pastelería, confitería | (pendiente) |
| `camaras-seguridad` | Venta e instalación de cámaras | (pendiente) |
| `reparacion-pc` | Servicio técnico, reparación de PC | (pendiente) |
| `bricolage` | Artículos artesanales | (pendiente) |
| `souvenirs` | Regalería y souvenirs | (pendiente) |
| `tupper-cakes` | Tartas y tortas personalizadas | (pendiente) |
| `gastronomia` | Delivery, catering, restaurante | (pendiente) |
| `moda` | Ropa, accesorios | (pendiente) |
| `servicios-profesionales` | Contable, abogado, coach, etc. | (pendiente) |
| `generico` | Cualquier emprendimiento | content/knowledge-base.md |

---

## Campos de entrada por rubro

### Universal (todos los rubros)
- nombre del producto/servicio
- foto(s) si existen
- precio (opcional)
- características relevantes
- CTA deseado
- plataforma(s) destino

### Adicionales para inmuebles
- tipo_operacion: alquiler | venta
- tipo_inmueble: casa | departamento | local...
- direccion + zona + ciudad
- superficie_m2, ambientes, dormitorios, baños
- características especiales (patio, cochera, luminoso, etc.)
- entorno (comercios, transporte, escuelas cercanas)
- precio + moneda + negociable

---

## Tipos de salida soportados

- Copy para Instagram (feed, historia, carrusel, reel)
- Copy para Facebook (post, historia)
- Guion para TikTok / video corto
- Respuesta sugerida para DM
- Mensaje de derivación a WhatsApp
- Landing page simple de catálogo o campaña (Modo intermedio)

---

## Modos de operación

### Modo simple (default)
Flujo: contenido → publicación manual → DM → WhatsApp

1. `/configure-rubro` para configurar el negocio
2. `/generate-calendar <tema>` para crear contenido del día
3. Revisar y aprobar con `/approve-post <id>`
4. Generar imagen con `/generate-image <id>`
5. Publicar con `/publish-post <id>`
6. Cuando llega un DM: `/generate-dm-response <id>` para obtener respuesta sugerida
7. Cuando el lead califica: usar el link de WhatsApp del config

### Modo intermedio
Agrega: landing de catálogo + preguntas de calificación semi-estructuradas

Pasos adicionales:
- `/add-propiedad` para cargar fichas de propiedades
- `/generate-landing <rubro>` para crear catálogo web
- Usar `/qualify-lead <id>` para registrar calificación y sugerir respuesta

### Modo avanzado (FUTURO — v0.2+)
Agrega: CRM GoHighLevel + agente de respuesta + WhatsApp Business API

Pendiente de implementar:
- Conector GHL para registrar leads automáticamente
- Agente de respuesta automática de DMs
- Integración WhatsApp Business API para envíos salientes
- Dashboard de conversiones por campaña

---

## Flujo inmobiliaria (caso principal)

### 1. Setup inicial
```
/configure-rubro → genera config/rubro.yaml con datos del negocio
/add-propiedad  → carga cada propiedad en content/propiedades/<id>.md
```

### 2. Generación de contenido
```
/generate-calendar <tema o propiedad_id>
  → genera N posts adaptados al rubro inmobiliario
  → cada post tiene: text, subtext, cta, dm_response, whatsapp_cta, image_prompt
```

### 3. Revisión y aprobación
```
/calendar-status             → tabla de posts del día
/approve-post <id>           → aprueba para imagen + publicación
/regenerate-post <id>        → rehace un post con feedback
```

### 4. Imagen y publicación
```
/generate-image <id>         → llama a kie.ai
/publish-post <id>           → publica en IG/FB, archiva en content/published/
```

### 5. Gestión de leads
```
/generate-dm-response <id>   → dado un mensaje de DM, sugiere respuesta
/qualify-lead <id>           → califica el lead y decide si derivar
```

### 6. Catálogo y landing (Modo intermedio)
```
/generate-landing inmuebles  → genera HTML de catálogo con todas las propiedades disponibles
```

---

## Convenciones

- Cada post: `.md` en `content/calendars/<YYYY-MM-DD>/`.
  - Frontmatter: `id`, `date`, `slot`, `status`, `platform`, `format`, `funnel_stage`, `function`, `sale`, `rubro`, `image_model`, `image_url`, `container_id`, `published_at`.
  - Cuerpo: `## Text`, `## Subtext`, `## CTA`, `## DM Response`, `## WhatsApp CTA`, `## Image prompt`, `## Notes`.
- Cada propiedad: `.md` en `content/propiedades/<id>.md`.
- Cada lead: `.md` en `content/leads/<id>.md`.
- IDs: `YYYY-MM-DD-NN` para posts, `INM-YYYYMM-NN` para propiedades.
- Status de post: draft | approved | needs-revision | generating-image | ready | published | failed.
- Status de lead: nuevo | contactado | calificado | derivado-whatsapp | en-seguimiento | cerrado-ganado | cerrado-perdido | no-califica.

---

## Skills disponibles

- `/configure-rubro` — entrevista para crear `config/rubro.yaml`.
- `/generate-calendar <tema>` — genera N posts para un día.
- `/add-propiedad` — agrega una propiedad (inmobiliaria).
- `/generate-post <tema|propiedad_id>` — genera 1 post individual.
- `/regenerate-post <id>` — regenera un post con feedback.
- `/approve-post <id>` — status: draft → approved.
- `/generate-image <id>` — llama a kie.ai.
- `/publish-post <id>` — publica a IG/FB y archiva.
- `/calendar-status [fecha]` — tabla resumen del calendario.
- `/generate-dm-response` — dado un DM entrante, genera respuesta + decisión de derivar.
- `/qualify-lead <id>` — califica lead y propone siguiente paso.
- `/generate-landing <rubro>` — genera landing HTML del catálogo.
- `/commit` — commits estructurados.
- `/review` — code review del diff.
- `/deploy-check` — checks pre-publicación.

---

## Reglas

- `config/rubro.yaml` no commitear si tiene datos reales de clientes.
- `content/published/` es log inmutable: nunca editar.
- `content/leads/` no commitear si tiene datos personales de leads.
- Toda llamada a kie.ai pasa por `packages/core/src/lib/kie.ts`.
- Toda llamada a la Graph API pasa por `packages/core/src/lib/instagram.ts`.
- Posts solo se publican si `status: approved` o `status: ready` con `image_url` presente.
- Para agregar un rubro nuevo: crear `config/rubros/<rubro>.yaml.example` + `content/rubros/<rubro>.md` + agregar el type en `src/types/rubro.ts`.

---

## Integraciones futuras documentadas

### GoHighLevel (CRM)
- Requiere: cuenta GHL (~$97/mes), API key, Location ID.
- Pendiente: implementar `packages/core/src/lib/ghl.ts` con endpoints de contactos y pipelines.
- Config: agregar `integraciones.ghl_api_key` y `ghl_location_id` en `rubro.yaml`.

### WhatsApp Business API
- Requiere: número de teléfono verificado en Meta Business, aprobación del template.
- Alternativa simple (ya disponible): link `wa.me/` con mensaje precargado (sin API).
- Alternativa avanzada: 360Dialog o Twilio como gateway.

### TikTok Publishing API
- Requiere: cuenta de desarrollador TikTok + aprobación del Content Posting API.
- Por ahora: generación de guion/copy para publicación manual.

---

## Variables de entorno requeridas (.env)

```
KIE_AI_API_KEY=sk_...       # API key de kie.ai (generación de imágenes)
IG_ID=...                   # ID de Instagram Business Account
IG_ACCESS_TOKEN=...         # Long-lived access token Meta
# Opcionales (modo avanzado)
GHL_API_KEY=...
GHL_LOCATION_ID=...
```

---

## Web app (apps/web/)

La web app heredada de warm-stories muestra la galería de posts del calendario.

Pendiente adaptar:
- Renombrar referencias de "story" → "post" en la UI.
- Agregar sección de propiedades para inmobiliaria.
- Agregar sección de leads.
- Adaptar rutas de API (`/api/stories/` → `/api/posts/`).

Mientras tanto, todas las operaciones se hacen desde las skills en terminal.
Ver CLAUDE.md de la web app si se va a modificar.

---

## Out of scope (v0.1)

- Hosting propio de imágenes (kie.ai retorna URL pública).
- AI provider externo (OpenAI, Anthropic SDK): se usa Claude Code vía skills.
- Deploy en la nube: alcance local.
- Agente de respuesta automática (Modo avanzado, v0.2+).
- Integración GoHighLevel (Modo avanzado, v0.2+).
- TikTok publishing automático (requiere aprobación API de TikTok).

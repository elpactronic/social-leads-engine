# social-leads-engine

Motor de contenido comercial y captación de leads para pequeños negocios locales.
Genera copy para Instagram, Facebook y TikTok, gestiona el flujo desde el primer
DM hasta la derivación a WhatsApp.

**Caso principal:** inmobiliaria. Adaptable a panadería, seguridad, reparación de PC, bricolage y más.

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar template de credenciales
cp .env.example .env
# Editar .env con las credenciales reales

# 3. Dev (web app)
npm run dev
# → http://localhost:3000
```

## Flujo básico (Modo simple)

```
1. /configure-rubro          → configurar el negocio
2. /add-propiedad            → (inmobiliaria) cargar propiedad
3. /generate-calendar <tema> → generar posts del día
4. /calendar-status          → revisar qué se generó
5. /approve-post <id>        → aprobar los buenos
6. /generate-image <id>      → crear imagen con kie.ai
7. /publish-post <id>        → publicar en Instagram
8. /generate-dm-response     → cuando llega un DM
9. /qualify-lead <id>        → registrar y calificar lead
```

## Skills disponibles

| Skill | Descripción |
|-------|-------------|
| `/configure-rubro` | Configurar el negocio |
| `/add-propiedad` | Agregar propiedad (inmobiliaria) |
| `/generate-calendar <tema>` | Generar N posts para un día |
| `/generate-post <tema>` | Generar 1 post individual |
| `/regenerate-post <id>` | Rehacer un post con feedback |
| `/approve-post <id>` | Aprobar para imagen + publicación |
| `/generate-image <id>` | Generar imagen con kie.ai |
| `/publish-post <id>` | Publicar en Instagram |
| `/calendar-status` | Ver estado del calendario |
| `/generate-dm-response` | Responder un DM entrante |
| `/qualify-lead` | Registrar y calificar lead |
| `/generate-landing <rubro>` | Generar landing de catálogo |
| `/commit` | Commits estructurados |
| `/review` | Code review |
| `/deploy-check` | Checks pre-publicación |

## Modos de operación

- **Simple**: contenido + DM manual + WhatsApp (default)
- **Intermedio**: agrega landing de catálogo y calificación estructurada
- **Avanzado**: CRM GoHighLevel + agente de respuesta (FUTURO v0.2)

## Variables de entorno (.env)

```
KIE_AI_API_KEY=sk_...       # API key de kie.ai
IG_ID=...                   # ID de Instagram Business Account
IG_ACCESS_TOKEN=...         # Long-lived access token Meta
```

Ver [CLAUDE.md](CLAUDE.md) para arquitectura completa.

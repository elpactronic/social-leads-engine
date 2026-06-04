---
name: deploy-check
description: Corre checks pre-publicación antes de empujar posts a Instagram/Facebook. Verifica typecheck, tests, presencia de credenciales y status de los posts del calendario activo. Usar antes de publicar en producción.
allowed-tools: Read, Glob, Bash(npm run *), Bash(git status)
---

# Deploy check pre-publicación

## 1. Typecheck
```
npm run typecheck
```
Si falla: reportar errores y detener.

## 2. Tests
```
npm test
```
Si falla: reportar y detener.

## 3. Variables de entorno

Verificar que `.env` existe y tiene:
- `KIE_AI_API_KEY` (para generación de imágenes)
- `IG_ID` (para publicación)
- `IG_ACCESS_TOKEN` (para publicación)

Si falta alguna: avisar qué variable falta, no exponer el valor.

## 4. Config del rubro

Verificar que `config/rubro.yaml` existe.
Verificar que `rubro.contacto.whatsapp` no está vacío.

## 5. Estado del calendario activo

Mostrar tabla de posts del día:
- ¿Hay posts `approved` sin imagen? (pendiente `/generate-image`)
- ¿Hay posts `ready`? (listos para publicar)
- ¿Hay posts `failed`? (necesitan atención)

## 6. Resultado

Si todo pasa:
```
✓ Typecheck ok
✓ Tests ok
✓ Credenciales presentes
✓ Config del rubro ok
N posts listos para publicar
```

Si hay problemas: lista detallada de qué corregir antes de publicar.

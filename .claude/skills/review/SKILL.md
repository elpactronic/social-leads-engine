---
name: review
description: Code review del diff actual o archivos especificados. Usar cuando el usuario dice "review", "revisar código", después de cambios grandes, "/review".
allowed-tools: Read, Grep, Glob, Bash(git diff *), Bash(git status)
---

# Code review

Hacé review del diff actual (o archivos en `$ARGUMENTS`):

## Categorías

1. **Bugs**: errores de lógica, null/undefined, race conditions, edge cases con archivos faltantes.

2. **Seguridad**:
   - Tokens hardcodeados en código fuente.
   - `yaml.load()` sin SafeLoader (RCE potencial).
   - Validación de inputs en API routes (IDs de URL, frontmatter).
   - SSRF: no pasar URLs arbitrarias del cliente a kie.ai sin validar.

3. **Performance**:
   - File reads en bucle sin necesidad.
   - Llamadas duplicadas a kie.ai o Graph API.
   - React re-renders innecesarios en dashboard.

4. **Arquitectura del proyecto**:
   - Toda llamada a kie.ai debe pasar por `packages/core/src/lib/kie.ts`.
   - Toda llamada a Graph API debe pasar por `packages/core/src/lib/instagram.ts`.
   - Lógica de negocio debe vivir en core, no en API routes.
   - `content/published/` es inmutable: cualquier Write ahí → Critical.

5. **Estilo**:
   - Naming inconsistente (mezcla de "story" / "post" → usar siempre "post").
   - Funciones largas que se beneficiarían de splitting.
   - TODOs sin contexto.

## Output

```
## Critical (must fix)
- [ ] archivo:línea — descripción

## Warning (should fix)
- [ ] archivo:línea — descripción

## Info (consider)
- [ ] archivo:línea — descripción

Summary: X critical, Y warnings, Z info
```

Si el diff está limpio: "No issues encontrados en el diff actual".

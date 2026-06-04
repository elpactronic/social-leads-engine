---
name: commit
description: Crea commits estructurados de los cambios actuales usando conventional commits. Usar cuando el usuario dice "commit", "guardar cambios", "save", "/commit".
allowed-tools: Read, Bash(git *)
---

# Commit estructurado

1. Corre `git status` y `git diff` para ver todos los cambios.
2. Agrupa cambios relacionados en unidades lógicas independientes.
3. Para cada unidad, crea un commit con este formato:

   ```
   tipo(scope): descripción en menos de 50 caracteres

   - Qué cambió
   - Por qué (si no es obvio del diff)
   ```

4. Stage y commit cada unidad por separado (no un commit gigante).
5. Muestra el resumen al final: "Creados N commits: [titles]".

## Tipos válidos

- `feat` — nueva funcionalidad
- `fix` — bug fix
- `refactor` — cambio que no afecta comportamiento
- `docs` — solo documentación
- `test` — agregar/ajustar tests
- `chore` — config, deps, scripts internos
- `perf` — mejora de performance
- `style` — formato sin cambios funcionales

## Scopes sugeridos para este proyecto

- `core` — cambios en `packages/core/src/`
- `web` — cambios en `apps/web/src/app/` y `apps/web/src/components/`
- `api` — cambios en `apps/web/src/app/api/`
- `skills` — cambios en `.claude/skills/`
- `rubro` — cambios en `config/` o `content/rubros/`
- `inmuebles` — cambios específicos del rubro inmobiliario
- `leads` — cambios en flujo de leads
- `config` — `package.json`, `tsconfig.json`, etc.

## Reglas

- Nunca commitear `config/rubro.yaml` (puede tener datos de clientes reales).
- Nunca commitear `content/leads/` (datos personales de leads).
- Nunca commitear `content/published/` (log inmutable).
- No hacer `git push`. El usuario lo hace después.

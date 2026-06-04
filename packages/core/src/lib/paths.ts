import path from "node:path";
import { existsSync, readFileSync } from "node:fs";

let cachedRoot: string | undefined;

// Detecta la raíz del proyecto subiendo desde cwd hasta encontrar el package.json
// que tiene `workspaces` o name `warm-stories`. Permite que el web (que corre con
// cwd = apps/web) y los scripts del core (cwd = packages/core) lean content/ y
// config/ desde la raíz del monorepo. Override con WARM_STORIES_ROOT si hace falta.
export function getProjectRoot(): string {
  if (cachedRoot) return cachedRoot;
  if (process.env.WARM_STORIES_ROOT) {
    cachedRoot = path.resolve(process.env.WARM_STORIES_ROOT);
    return cachedRoot;
  }
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const pkgPath = path.join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
          name?: string;
          workspaces?: unknown;
        };
        if (pkg.workspaces || pkg.name === "warm-stories") {
          cachedRoot = dir;
          return dir;
        }
      } catch {
        // ignore malformed package.json en directorios intermedios
      }
    }
    dir = path.dirname(dir);
  }
  cachedRoot = process.cwd();
  return cachedRoot;
}

import {
  readFile,
  writeFile,
  readdir,
  mkdir,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type {
  Propiedad,
  PropiedadBody,
  PropiedadFrontmatter,
  EstadoPropiedad,
  PropiedadSummary,
} from "../types/propiedad";
import { getProjectRoot } from "./paths";

const PROPIEDADES_ROOT = path.join(getProjectRoot(), "content", "propiedades");
const FRONTMATTER_DELIM = "---";

function parsePropiedadFrontmatter(raw: string): {
  fm: PropiedadFrontmatter;
  body: string;
} {
  const lines = raw.split("\n");
  if (lines[0]?.trim() !== FRONTMATTER_DELIM) {
    throw new Error("Archivo sin frontmatter YAML válido.");
  }
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === FRONTMATTER_DELIM) {
      endIdx = i;
      break;
    }
  }
  if (endIdx < 0) throw new Error("Frontmatter sin cierre.");
  const fmRaw = lines.slice(1, endIdx).join("\n");
  const body = lines.slice(endIdx + 1).join("\n");
  const fm = YAML.parse(fmRaw) as PropiedadFrontmatter;
  return { fm, body };
}

function parsePropiedadBody(body: string): PropiedadBody {
  const sections: Record<string, string> = {};
  let current = "";
  let buf: string[] = [];
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      if (current) sections[current] = buf.join("\n").trim();
      current = h[1].toLowerCase().replace(/\s+/g, "");
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (current) sections[current] = buf.join("\n").trim();
  return {
    descripcion: sections.descripcion ?? "",
    caracteristicas: sections.caracteristicas ?? "",
    entorno: sections.entorno ?? "",
    notas_internas: sections.notasinternas ?? "",
  };
}

function serializePropiedad(p: Propiedad): string {
  const fmStr = YAML.stringify(
    {
      id: p.id,
      fecha_carga: p.fecha_carga,
      tipo_operacion: p.tipo_operacion,
      tipo_inmueble: p.tipo_inmueble,
      estado: p.estado,
      direccion: p.direccion,
      zona: p.zona,
      ciudad: p.ciudad,
      precio: p.precio,
      moneda: p.moneda,
      precio_negociable: p.precio_negociable,
      ...(p.superficie_total_m2 !== undefined && { superficie_total_m2: p.superficie_total_m2 }),
      ...(p.superficie_cubierta_m2 !== undefined && { superficie_cubierta_m2: p.superficie_cubierta_m2 }),
      ...(p.ambientes !== undefined && { ambientes: p.ambientes }),
      ...(p.dormitorios !== undefined && { dormitorios: p.dormitorios }),
      ...(p.banos !== undefined && { banos: p.banos }),
      ...(p.cocheras !== undefined && { cocheras: p.cocheras }),
      ...(p.antiguedad_anos !== undefined && { antiguedad_anos: p.antiguedad_anos }),
      ...(p.piso && { piso: p.piso }),
      ...(p.expensas_ars !== undefined && { expensas_ars: p.expensas_ars }),
      fotos: p.fotos,
      destacadas: p.destacadas,
    },
    { lineWidth: 0 },
  ).trimEnd();
  return [
    FRONTMATTER_DELIM,
    fmStr,
    FRONTMATTER_DELIM,
    "",
    "## Descripcion",
    p.descripcion,
    "",
    "## Caracteristicas",
    p.caracteristicas,
    "",
    "## Entorno",
    p.entorno,
    "",
    "## Notas internas",
    p.notas_internas,
    "",
  ].join("\n");
}

async function readPropiedadFile(filePath: string): Promise<Propiedad> {
  const raw = await readFile(filePath, "utf8");
  const { fm, body } = parsePropiedadFrontmatter(raw);
  const sections = parsePropiedadBody(body);
  return { ...fm, ...sections, filePath };
}

export async function listPropiedades(
  filtroEstado?: EstadoPropiedad,
): Promise<PropiedadSummary[]> {
  if (!existsSync(PROPIEDADES_ROOT)) return [];
  const files = await readdir(PROPIEDADES_ROOT);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort();
  const result: PropiedadSummary[] = [];
  for (const f of mdFiles) {
    const p = await readPropiedadFile(
      path.join(PROPIEDADES_ROOT, f),
    ).catch(() => null);
    if (!p) continue;
    if (filtroEstado && p.estado !== filtroEstado) continue;
    result.push({
      id: p.id,
      tipo_operacion: p.tipo_operacion,
      tipo_inmueble: p.tipo_inmueble,
      estado: p.estado,
      direccion: p.direccion,
      zona: p.zona,
      precio: p.precio,
      moneda: p.moneda,
    });
  }
  return result;
}

export async function findPropiedadById(
  id: string,
): Promise<Propiedad | null> {
  if (!existsSync(PROPIEDADES_ROOT)) return null;
  const files = await readdir(PROPIEDADES_ROOT);
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const p = await readPropiedadFile(
      path.join(PROPIEDADES_ROOT, f),
    ).catch(() => null);
    if (p?.id === id) return p;
  }
  return null;
}

export async function savePropiedad(p: Propiedad): Promise<void> {
  if (!existsSync(PROPIEDADES_ROOT)) {
    await mkdir(PROPIEDADES_ROOT, { recursive: true });
  }
  const filePath = p.filePath || path.join(PROPIEDADES_ROOT, `${p.id}.md`);
  await writeFile(filePath, serializePropiedad({ ...p, filePath }), "utf8");
}

export async function updatePropiedad(p: Propiedad): Promise<void> {
  await writeFile(p.filePath, serializePropiedad(p), "utf8");
}

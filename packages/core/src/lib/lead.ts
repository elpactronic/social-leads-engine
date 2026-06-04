import {
  readFile,
  writeFile,
  readdir,
  mkdir,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Lead, LeadFrontmatter, LeadBody, LeadStatus } from "../types/lead";
import { getProjectRoot } from "./paths";

const LEADS_ROOT = path.join(getProjectRoot(), "content", "leads");
const FRONTMATTER_DELIM = "---";

function parseLeadFrontmatter(raw: string): {
  fm: LeadFrontmatter;
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
  const fm = YAML.parse(fmRaw) as LeadFrontmatter;
  return { fm, body };
}

function parseLeadBody(body: string): LeadBody {
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
    mensaje_inicial: sections.mensajeinicial ?? "",
    notas_calificacion: sections.notascalificacion ?? "",
    respuestas_sugeridas: sections.respuestassugeridas ?? "",
  };
}

function serializeLead(l: Lead): string {
  const fm: Record<string, unknown> = {
    id: l.id,
    fecha: l.fecha,
    plataforma: l.plataforma,
    status: l.status,
    rubro: l.rubro,
    interes: l.interes,
  };
  if (l.nombre) fm.nombre = l.nombre;
  if (l.contacto) fm.contacto = l.contacto;
  if (l.zona_preferida) fm.zona_preferida = l.zona_preferida;
  if (l.presupuesto_max !== undefined) fm.presupuesto_max = l.presupuesto_max;
  if (l.moneda) fm.moneda = l.moneda;
  if (l.timing) fm.timing = l.timing;
  if (l.propiedad_id) fm.propiedad_id = l.propiedad_id;
  if (l.ghl_contact_id) fm.ghl_contact_id = l.ghl_contact_id;
  if (l.whatsapp_derivado) fm.whatsapp_derivado = l.whatsapp_derivado;
  if (l.derivado_at) fm.derivado_at = l.derivado_at;

  const fmStr = YAML.stringify(fm, { lineWidth: 0 }).trimEnd();
  return [
    FRONTMATTER_DELIM,
    fmStr,
    FRONTMATTER_DELIM,
    "",
    "## Mensaje inicial",
    l.mensaje_inicial,
    "",
    "## Notas calificacion",
    l.notas_calificacion,
    "",
    "## Respuestas sugeridas",
    l.respuestas_sugeridas,
    "",
  ].join("\n");
}

async function readLeadFile(filePath: string): Promise<Lead> {
  const raw = await readFile(filePath, "utf8");
  const { fm, body } = parseLeadFrontmatter(raw);
  const sections = parseLeadBody(body);
  return { ...fm, ...sections, filePath };
}

export async function listLeads(filtroStatus?: LeadStatus): Promise<Lead[]> {
  if (!existsSync(LEADS_ROOT)) return [];
  const files = await readdir(LEADS_ROOT);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort().reverse();
  const result: Lead[] = [];
  for (const f of mdFiles) {
    const l = await readLeadFile(path.join(LEADS_ROOT, f)).catch(() => null);
    if (!l) continue;
    if (filtroStatus && l.status !== filtroStatus) continue;
    result.push(l);
  }
  return result;
}

export async function findLeadById(id: string): Promise<Lead | null> {
  if (!existsSync(LEADS_ROOT)) return null;
  const files = await readdir(LEADS_ROOT);
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const l = await readLeadFile(path.join(LEADS_ROOT, f)).catch(() => null);
    if (l?.id === id) return l;
  }
  return null;
}

export async function saveLead(l: Lead): Promise<void> {
  if (!existsSync(LEADS_ROOT)) {
    await mkdir(LEADS_ROOT, { recursive: true });
  }
  const filePath = l.filePath || path.join(LEADS_ROOT, `${l.id}.md`);
  await writeFile(filePath, serializeLead({ ...l, filePath }), "utf8");
}

export async function updateLead(l: Lead): Promise<void> {
  await writeFile(l.filePath, serializeLead(l), "utf8");
}

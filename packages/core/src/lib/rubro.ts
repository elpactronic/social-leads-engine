import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { getProjectRoot } from "./paths";
import type { RubroConfig } from "../types/rubro";

export type { RubroConfig };

const RUBRO_PATH = path.join(getProjectRoot(), "config", "rubro.yaml");

export class RubroNotConfiguredError extends Error {
  constructor() {
    super(
      "config/rubro.yaml no existe. Ejecuta /configure-rubro dentro de Claude Code para crearlo.",
    );
    this.name = "RubroNotConfiguredError";
  }
}

export async function loadRubro(): Promise<RubroConfig> {
  if (!existsSync(RUBRO_PATH)) {
    throw new RubroNotConfiguredError();
  }
  const raw = await readFile(RUBRO_PATH, "utf8");
  return YAML.parse(raw) as RubroConfig;
}

export function isRubroConfigured(): boolean {
  return existsSync(RUBRO_PATH);
}

const PROMPT_HARD_LIMIT = 1000;

export function buildImagePrompt(
  rubro: RubroConfig,
  postImagePrompt: string,
): string {
  const visuals = rubro.brand.story_visuals ?? {};
  const palette = rubro.brand.palette ?? {};
  const background = visuals.background ?? palette.background ?? "#1a1a2e";
  const accent = visuals.accent ?? palette.accent ?? "#e94560";

  const brief =
    `Pure visual background for a 9:16 social media post. ` +
    `Palette: dark base (${background}), accent (${accent}). ` +
    `Professional, clean, appealing composition for ${rubro.rubro.type} business. ` +
    `All surfaces (screens, papers, signs, books, packaging) are completely blank and unmarked. ` +
    `Keep the lower 40% calm — typography is added later.`;

  const noTextBlock =
    `ABSOLUTE RULE — NO TEXT IN THE IMAGE. ` +
    `Zero letters, words, numbers, captions, subtitles, labels, signs, logos, watermarks, brand names, signatures, handwriting, stickers, screen UI, or readable symbols. ` +
    `Any surface that would normally show text is rendered COMPLETELY BLANK. ` +
    `OUTPUT MUST BE 100% TEXT-FREE.`;

  const fixedLen = brief.length + noTextBlock.length + 4;
  const room = Math.max(0, PROMPT_HARD_LIMIT - fixedLen);
  const middle = truncateOnWord(postImagePrompt.trim(), room);

  return `${brief}\n\n${middle}\n\n${noTextBlock}`.trim();
}

function truncateOnWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, Math.max(0, max - 1));
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim();
}

export function buildWhatsAppLink(rubro: RubroConfig, mensaje?: string): string {
  const numero = rubro.contacto.whatsapp.replace(/\D/g, "");
  const texto = mensaje
    ? encodeURIComponent(mensaje)
    : encodeURIComponent(`Hola, vi tu publicación y me interesa saber más.`);
  return `https://wa.me/${numero}?text=${texto}`;
}

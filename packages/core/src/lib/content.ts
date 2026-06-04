import {
  readFile,
  writeFile,
  readdir,
  mkdir,
  copyFile,
  unlink,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type {
  Post,
  PostBody,
  PostFrontmatter,
  PostStatus,
  CalendarSummary,
} from "../types/post";
import { getProjectRoot } from "./paths";

const CALENDARS_ROOT = path.join(getProjectRoot(), "content", "calendars");
const PUBLISHED_ROOT = path.join(getProjectRoot(), "content", "published");

const FRONTMATTER_DELIM = "---";

const ID_PATTERN = /^(\d{4}-\d{2}-\d{2})-(\d+)$/;

function parseFrontmatter(raw: string): { fm: PostFrontmatter; body: string } {
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
  const fm = YAML.parse(fmRaw) as PostFrontmatter;
  return { fm, body };
}

function parseBodySections(body: string): PostBody {
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
    text: sections.text ?? "",
    subtext: sections.subtext ?? "",
    cta: sections.cta ?? "",
    dm_response: sections.dmresponse ?? "",
    whatsapp_cta: sections.whatsappcta ?? "",
    imagePrompt: sections.imageprompt ?? "",
    notes: sections.notes ?? "",
  };
}

function buildFrontmatterRecord(fm: PostFrontmatter): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: fm.id,
    date: fm.date,
    slot: fm.slot,
    status: fm.status,
    platform: fm.platform,
    format: fm.format,
    funnel_stage: fm.funnel_stage,
    function: fm.function,
    sale: fm.sale,
    rubro: fm.rubro,
    image_model: fm.image_model,
    image_url: fm.image_url,
    container_id: fm.container_id,
    published_at: fm.published_at,
  };
  if (fm.propiedad_id) out.propiedad_id = fm.propiedad_id;
  if (fm.change_request) out.change_request = fm.change_request;
  if (fm.image_error) out.image_error = fm.image_error;
  return out;
}

function serializePost(post: Post): string {
  const fmStr = YAML.stringify(buildFrontmatterRecord(post), {
    lineWidth: 0,
  }).trimEnd();
  return [
    FRONTMATTER_DELIM,
    fmStr,
    FRONTMATTER_DELIM,
    "",
    "## Text",
    post.text,
    "",
    "## Subtext",
    post.subtext,
    "",
    "## CTA",
    post.cta,
    "",
    "## DM Response",
    post.dm_response,
    "",
    "## WhatsApp CTA",
    post.whatsapp_cta,
    "",
    "## Image prompt",
    post.imagePrompt,
    "",
    "## Notes",
    post.notes,
    "",
  ].join("\n");
}

async function readPostFile(filePath: string): Promise<Post> {
  const raw = await readFile(filePath, "utf8");
  const { fm, body } = parseFrontmatter(raw);
  const sections = parseBodySections(body);
  return { ...fm, ...sections, filePath };
}

export async function listCalendars(): Promise<CalendarSummary[]> {
  if (!existsSync(CALENDARS_ROOT)) return [];
  const dates = await readdir(CALENDARS_ROOT);
  const out: CalendarSummary[] = [];
  for (const date of dates.sort().reverse()) {
    const dir = path.join(CALENDARS_ROOT, date);
    const files = await readdir(dir).catch(() => [] as string[]);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    const byStatus: Record<PostStatus, number> = {
      draft: 0,
      approved: 0,
      "needs-revision": 0,
      "generating-image": 0,
      ready: 0,
      published: 0,
      failed: 0,
    };
    for (const f of mdFiles) {
      try {
        const post = await readPostFile(path.join(dir, f));
        byStatus[post.status]++;
      } catch {
        // ignore malformed
      }
    }
    out.push({ date, count: mdFiles.length, byStatus });
  }
  return out;
}

export async function listPosts(date: string): Promise<Post[]> {
  const dir = path.join(CALENDARS_ROOT, date);
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort();
  return Promise.all(mdFiles.map((f) => readPostFile(path.join(dir, f))));
}

export async function findPostById(id: string): Promise<Post | null> {
  if (!existsSync(CALENDARS_ROOT)) return null;
  const m = id.match(ID_PATTERN);
  if (m) {
    const [, date, slotRaw] = m;
    const slot = Number(slotRaw);
    const dir = path.join(CALENDARS_ROOT, date);
    if (existsSync(dir)) {
      const files = await readdir(dir).catch(() => [] as string[]);
      const candidates = files.filter((f) => {
        if (!f.endsWith(".md")) return false;
        const prefix = f.match(/^(\d+)-/);
        return prefix ? Number(prefix[1]) === slot : false;
      });
      for (const f of candidates) {
        const post = await readPostFile(path.join(dir, f)).catch(() => null);
        if (post?.id === id) return post;
      }
    }
  }
  const dates = await readdir(CALENDARS_ROOT);
  for (const date of dates) {
    const dir = path.join(CALENDARS_ROOT, date);
    const files = await readdir(dir).catch(() => [] as string[]);
    for (const f of files) {
      if (!f.endsWith(".md")) continue;
      const post = await readPostFile(path.join(dir, f)).catch(() => null);
      if (post?.id === id) return post;
    }
  }
  return null;
}

export async function updatePost(post: Post): Promise<void> {
  await writeFile(post.filePath, serializePost(post), "utf8");
}

export async function deletePost(post: Post): Promise<void> {
  await unlink(post.filePath);
}

export async function archivePublishedPost(post: Post): Promise<void> {
  if (!existsSync(PUBLISHED_ROOT)) {
    await mkdir(PUBLISHED_ROOT, { recursive: true });
  }
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = path.basename(post.filePath);
  const dest = path.join(PUBLISHED_ROOT, `${ts}_${baseName}`);
  await copyFile(post.filePath, dest);
}

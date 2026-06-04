import path from "node:path";
import { NextResponse } from "next/server";
import {
  listStories,
  loadAvatar,
  buildZip,
  type ZipEntry,
  type Story,
} from "@warm-stories/core";
import { composeStoryImage } from "@/lib/compose-story-image";

function entryNameFor(story: Story): string {
  const base = path.basename(story.filePath, path.extname(story.filePath));
  return `${base}.png`;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const stories = await listStories(date);

  if (stories.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Calendario vacío o inexistente" },
      { status: 404 },
    );
  }

  const withImage = stories.filter((s) => Boolean(s.image_url));
  if (withImage.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Ninguna historia tiene imagen generada todavía" },
      { status: 400 },
    );
  }

  const avatar = await loadAvatar();
  const palette = avatar.brand.palette;

  const entries: ZipEntry[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const story of withImage) {
    try {
      const data = await composeStoryImage(story, palette);
      entries.push({ filename: entryNameFor(story), data });
    } catch (err) {
      skipped.push({
        id: story.id,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (entries.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo componer ninguna imagen",
        skipped,
      },
      { status: 502 },
    );
  }

  const zip = await buildZip(entries);
  const filename = `historias-${date}.zip`;
  const headers = new Headers({
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(zip.byteLength),
    "X-Images-Included": String(entries.length),
    "X-Images-Skipped": String(skipped.length),
  });
  return new Response(new Uint8Array(zip), { status: 200, headers });
}

import { NextResponse } from "next/server";
import {
  archivePublishedStory,
  findStoryById,
  updateStory,
  publishStory,
} from "@warm-stories/core";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const story = await findStoryById(decoded);
  if (!story) {
    return NextResponse.json(
      { ok: false, error: "Story no encontrada" },
      { status: 404 },
    );
  }
  // Crítico: nunca publicar lo que no fue aprobado.
  if (story.status !== "ready") {
    return NextResponse.json(
      {
        ok: false,
        error: `Solo se publica desde status ready (actual: ${story.status})`,
      },
      { status: 400 },
    );
  }
  if (!story.image_url) {
    return NextResponse.json(
      { ok: false, error: "Story sin image_url; genera imagen primero" },
      { status: 400 },
    );
  }

  try {
    const { containerId, mediaId } = await publishStory({
      imageUrl: story.image_url,
    });
    const updated = {
      ...story,
      status: "published" as const,
      container_id: containerId,
      published_at: new Date().toISOString(),
    };
    await updateStory(updated);
    await archivePublishedStory(updated);
    return NextResponse.json({ ok: true, mediaId });
  } catch (err) {
    await updateStory({ ...story, status: "failed" });
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error }, { status: 502 });
  }
}

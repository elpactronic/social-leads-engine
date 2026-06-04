import { NextResponse } from "next/server";
import { findStoryById, updateStory } from "@warm-stories/core";

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
  if (story.status !== "draft") {
    return NextResponse.json(
      { ok: false, error: `No se puede aprobar desde status ${story.status}` },
      { status: 400 },
    );
  }
  await updateStory({ ...story, status: "approved" });
  return NextResponse.json({ ok: true });
}

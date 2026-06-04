import { NextResponse } from "next/server";
import { findStoryById, deleteStory } from "@warm-stories/core";

export async function DELETE(
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
  if (story.status === "generating-image") {
    return NextResponse.json(
      {
        ok: false,
        error: "No se puede eliminar mientras la imagen se está generando",
      },
      { status: 400 },
    );
  }
  await deleteStory(story);
  return NextResponse.json({ ok: true });
}

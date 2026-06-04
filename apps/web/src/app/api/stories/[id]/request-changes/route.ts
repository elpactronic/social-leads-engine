import { NextResponse } from "next/server";
import { findStoryById, updateStory } from "@warm-stories/core";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const body = (await req.json().catch(() => ({}))) as { feedback?: string };
  const feedback = (body.feedback ?? "").trim();
  if (feedback.length < 5) {
    return NextResponse.json(
      { ok: false, error: "El feedback es muy corto." },
      { status: 400 },
    );
  }
  const story = await findStoryById(decoded);
  if (!story) {
    return NextResponse.json(
      { ok: false, error: "Story no encontrada" },
      { status: 404 },
    );
  }
  if (story.status === "published") {
    return NextResponse.json(
      { ok: false, error: "No se pide cambio sobre una ya publicada." },
      { status: 400 },
    );
  }
  await updateStory({
    ...story,
    status: "needs-revision",
    change_request: feedback,
  });
  return NextResponse.json({ ok: true });
}

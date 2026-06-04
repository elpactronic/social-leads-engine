import { NextResponse } from "next/server";
import {
  findPostById,
  updatePost,
  createTask,
  pollUntilDone,
  buildImagePrompt,
  loadRubro,
} from "@social-leads/core";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const story = await findPostById(decoded);
  if (!story) {
    return NextResponse.json(
      { ok: false, error: "Story no encontrada" },
      { status: 404 },
    );
  }
  if (story.status !== "approved") {
    return NextResponse.json(
      {
        ok: false,
        error: `Solo se genera imagen desde status approved (actual: ${story.status})`,
      },
      { status: 400 },
    );
  }

  const model =
    story.image_model || process.env.KIE_AI_DEFAULT_MODEL || "z-image";

  await updatePost({ ...story, status: "generating-image" });

  try {
    const rubro = await loadRubro();
    const prompt = buildImagePrompt(rubro, story.imagePrompt);
    const { taskId } = await createTask({
      model,
      prompt,
    });
    const info = await pollUntilDone(taskId);

    if (info.status !== "succeeded" || !info.imageUrl) {
      await updatePost({ ...story, status: "failed", image_model: model });
      return NextResponse.json(
        { ok: false, error: info.error ?? "kie.ai no retornó imageUrl" },
        { status: 502 },
      );
    }

    await updatePost({
      ...story,
      status: "ready",
      image_model: model,
      image_url: info.imageUrl,
    });
    return NextResponse.json({ ok: true, imageUrl: info.imageUrl });
  } catch (err) {
    await updatePost({ ...story, status: "failed", image_model: model });
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}

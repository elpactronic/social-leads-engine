import { NextResponse } from "next/server";
import {
  findPostById,
  updatePost,
  createTask,
  pollUntilDone,
  buildImagePrompt,
  loadRubro,
} from "@social-leads/core";

export const maxDuration = 360;

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
  if (story.status === "published") {
    return NextResponse.json(
      { ok: false, error: "No se regenera imagen de una historia publicada." },
      { status: 400 },
    );
  }

  const model =
    story.image_model || process.env.KIE_AI_DEFAULT_MODEL || "z-image";

  await updatePost({
    ...story,
    status: "generating-image",
    image_model: model,
    image_url: "",
    image_error: "",
  });

  try {
    const rubro = await loadRubro();
    const prompt = buildImagePrompt(rubro, story.imagePrompt);
    const { taskId } = await createTask({
      model,
      prompt,
    });
    const info = await pollUntilDone(taskId);

    if (info.status !== "succeeded" || !info.imageUrl) {
      const errMsg = info.error ?? "kie.ai devolvió status sin imageUrl.";
      await updatePost({
        ...story,
        status: "failed",
        image_model: model,
        image_url: "",
        image_error: errMsg,
      });
      return NextResponse.json({ ok: false, error: errMsg }, { status: 502 });
    }

    await updatePost({
      ...story,
      status: "ready",
      image_model: model,
      image_url: info.imageUrl,
      image_error: "",
    });
    return NextResponse.json({ ok: true, imageUrl: info.imageUrl });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await updatePost({
      ...story,
      status: "failed",
      image_model: model,
      image_url: "",
      image_error: errMsg,
    });
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }
}

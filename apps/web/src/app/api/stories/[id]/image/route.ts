import { NextResponse } from "next/server";
import {
  findStoryById,
  updateStory,
  createTask,
  pollUntilDone,
  buildImagePrompt,
  loadAvatar,
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

  await updateStory({ ...story, status: "generating-image" });

  try {
    const avatar = await loadAvatar();
    const prompt = buildImagePrompt(avatar, story.imagePrompt);
    const { taskId } = await createTask({
      model,
      prompt,
    });
    const info = await pollUntilDone(taskId);

    if (info.status !== "succeeded" || !info.imageUrl) {
      await updateStory({ ...story, status: "failed", image_model: model });
      return NextResponse.json(
        { ok: false, error: info.error ?? "kie.ai no retornó imageUrl" },
        { status: 502 },
      );
    }

    await updateStory({
      ...story,
      status: "ready",
      image_model: model,
      image_url: info.imageUrl,
    });
    return NextResponse.json({ ok: true, imageUrl: info.imageUrl });
  } catch (err) {
    await updateStory({ ...story, status: "failed", image_model: model });
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}

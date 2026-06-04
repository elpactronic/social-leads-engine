import { NextResponse } from "next/server";
import {
  listStories,
  updateStory,
  createTask,
  pollUntilDone,
  buildImagePrompt,
  loadAvatar,
} from "@warm-stories/core";

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

  const pending = stories.filter(
    (s) => (s.status === "approved" || s.status === "failed") && !s.image_url,
  );
  if (pending.length === 0) {
    return NextResponse.json({ ok: true, generated: 0, failed: 0 });
  }

  const defaultModel = process.env.KIE_AI_DEFAULT_MODEL || "z-image";
  const avatar = await loadAvatar();
  let generated = 0;
  let failed = 0;
  const errors: { id: string; error: string }[] = [];

  for (const story of pending) {
    const model = story.image_model || defaultModel;
    await updateStory({
      ...story,
      status: "generating-image",
      image_model: model,
      image_error: "",
    });

    try {
      const { taskId } = await createTask({
        model,
        prompt: buildImagePrompt(avatar, story.imagePrompt),
      });
      const info = await pollUntilDone(taskId);

      if (info.status !== "succeeded" || !info.imageUrl) {
        const errMsg = info.error ?? "kie.ai devolvió status sin imageUrl.";
        await updateStory({
          ...story,
          status: "failed",
          image_model: model,
          image_error: errMsg,
        });
        failed++;
        errors.push({ id: story.id, error: errMsg });
        continue;
      }

      await updateStory({
        ...story,
        status: "ready",
        image_model: model,
        image_url: info.imageUrl,
        image_error: "",
      });
      generated++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await updateStory({
        ...story,
        status: "failed",
        image_model: model,
        image_error: errMsg,
      });
      failed++;
      errors.push({ id: story.id, error: errMsg });
    }
  }

  return NextResponse.json({ ok: failed === 0, generated, failed, errors });
}

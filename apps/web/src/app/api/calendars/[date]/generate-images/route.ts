import { NextResponse } from "next/server";
import {
  listPosts,
  updatePost,
  createTask,
  pollUntilDone,
  buildImagePrompt,
  loadRubro,
} from "@social-leads/core";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const stories = await listPosts(date);

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
  const rubro = await loadRubro();
  let generated = 0;
  let failed = 0;
  const errors: { id: string; error: string }[] = [];

  for (const story of pending) {
    const model = story.image_model || defaultModel;
    await updatePost({
      ...story,
      status: "generating-image",
      image_model: model,
      image_error: "",
    });

    try {
      const { taskId } = await createTask({
        model,
        prompt: buildImagePrompt(rubro, story.imagePrompt),
      });
      const info = await pollUntilDone(taskId);

      if (info.status !== "succeeded" || !info.imageUrl) {
        const errMsg = info.error ?? "kie.ai devolvió status sin imageUrl.";
        await updatePost({
          ...story,
          status: "failed",
          image_model: model,
          image_error: errMsg,
        });
        failed++;
        errors.push({ id: story.id, error: errMsg });
        continue;
      }

      await updatePost({
        ...story,
        status: "ready",
        image_model: model,
        image_url: info.imageUrl,
        image_error: "",
      });
      generated++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await updatePost({
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

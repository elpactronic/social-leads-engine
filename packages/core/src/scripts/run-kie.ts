// CLI wrapper para que la skill /generate-image dispare la generación
// de imagen vía kie.ai sin meter código de fetch dentro del .md de la skill.
//
// Uso:
//   npx tsx packages/core/scripts/run-kie.ts \
//     --story-id 2026-05-13-01 \
//     --model nano-banana
//
// El script:
//   1. Busca la historia por id.
//   2. Construye el prompt final con buildImagePrompt(avatar, story.imagePrompt).
//   3. Crea el task en kie.ai y hace polling hasta succeeded/failed.
//   4. Actualiza el .md: image_url, image_model, status: ready (o failed +
//      image_error si falló).
//   5. Imprime JSON al stdout con el resultado.

import {
  findStoryById,
  updateStory,
  loadAvatar,
  buildImagePrompt,
  createTask,
  pollUntilDone,
} from "../src/index";
import type { KieModelId } from "../src/index";

interface Args {
  storyId: string;
  model: KieModelId;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--story-id") out.storyId = argv[++i];
    else if (a === "--model") out.model = argv[++i] as KieModelId;
  }
  if (!out.storyId) throw new Error("--story-id requerido");
  if (!out.model) throw new Error("--model requerido");
  return out as Args;
}

async function main(): Promise<void> {
  const { storyId, model } = parseArgs(process.argv.slice(2));

  const story = await findStoryById(storyId);
  if (!story) {
    throw new Error(`Historia no encontrada: ${storyId}`);
  }
  if (!story.imagePrompt?.trim()) {
    throw new Error(
      `Historia ${storyId} no tiene 'Image prompt' en el cuerpo.`,
    );
  }

  const avatar = await loadAvatar();
  const prompt = buildImagePrompt(avatar, story.imagePrompt);

  // Marcar como generating-image antes de disparar el job; si la generación
  // tarda y el proceso se interrumpe, el .md queda en estado claro.
  story.status = "generating-image";
  story.image_model = model;
  await updateStory(story);

  let taskId: string;
  try {
    const created = await createTask({ model, prompt });
    taskId = created.taskId;
  } catch (e) {
    story.status = "failed";
    story.image_error = e instanceof Error ? e.message : String(e);
    await updateStory(story);
    throw e;
  }

  const info = await pollUntilDone(taskId);

  if (info.status === "failed" || !info.imageUrl) {
    story.status = "failed";
    story.image_error = info.error ?? "kie.ai falló sin detalle";
    await updateStory(story);
    process.stdout.write(
      JSON.stringify({
        ok: false,
        storyId,
        taskId,
        error: story.image_error,
      }) + "\n",
    );
    process.exit(1);
  }

  story.image_url = info.imageUrl;
  story.status = "ready";
  story.image_error = undefined;
  await updateStory(story);

  process.stdout.write(
    JSON.stringify({
      ok: true,
      storyId,
      taskId,
      imageUrl: info.imageUrl,
      model,
    }) + "\n",
  );
}

main().catch((e) => {
  process.stderr.write(
    `run-kie error: ${e instanceof Error ? e.message : String(e)}\n`,
  );
  process.exit(1);
});

// CLI wrapper para que la skill /publish-story dispare la publicación
// a Instagram Graph API sin meter código de fetch dentro del .md de la skill.
//
// Uso:
//   npx tsx packages/core/scripts/run-publish.ts --story-id 2026-05-13-01
//
// Pre-condiciones (validadas):
//   - La historia existe.
//   - status: ready o approved (con image_url presente).
//   - image_url no vacío (URL pública servida por kie.ai).
//
// El script:
//   1. Llama publishStory(imageUrl, caption).
//   2. Actualiza el .md: status: published, container_id, published_at.
//   3. Archiva una copia a content/published/<timestamp>_<filename>.md.
//   4. Imprime JSON con containerId y mediaId.

import {
  findStoryById,
  updateStory,
  archivePublishedStory,
  publishStory,
} from "../src/index";

interface Args {
  storyId: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--story-id") out.storyId = argv[++i];
  }
  if (!out.storyId) throw new Error("--story-id requerido");
  return out as Args;
}

function buildCaption(text: string, subtext: string, cta: string): string {
  // IG caption opcional para stories; lo dejamos vacío por defecto porque
  // el copy va overlay encima de la imagen y duplicarlo confunde. Si el
  // usuario quiere caption, puede setearlo manualmente antes.
  return [text, subtext, cta].filter((s) => s?.trim()).join("\n\n");
}

async function main(): Promise<void> {
  const { storyId } = parseArgs(process.argv.slice(2));

  const story = await findStoryById(storyId);
  if (!story) {
    throw new Error(`Historia no encontrada: ${storyId}`);
  }
  if (story.status !== "ready" && story.status !== "approved") {
    throw new Error(
      `Historia ${storyId} tiene status '${story.status}'. Se requiere 'ready' (con imagen generada) o 'approved' (con image_url manual).`,
    );
  }
  if (!story.image_url) {
    throw new Error(
      `Historia ${storyId} no tiene image_url. Genera la imagen primero con /generate-image.`,
    );
  }

  const caption = buildCaption(story.text, story.subtext, story.cta);

  let result: { containerId: string; mediaId: string };
  try {
    result = await publishStory({
      imageUrl: story.image_url,
      caption: caption.length > 0 ? caption : undefined,
    });
  } catch (e) {
    story.status = "failed";
    story.image_error = e instanceof Error ? e.message : String(e);
    await updateStory(story);
    throw e;
  }

  story.status = "published";
  story.container_id = result.containerId;
  story.published_at = new Date().toISOString();
  await updateStory(story);
  await archivePublishedStory(story);

  process.stdout.write(
    JSON.stringify({
      ok: true,
      storyId,
      containerId: result.containerId,
      mediaId: result.mediaId,
      publishedAt: story.published_at,
    }) + "\n",
  );
}

main().catch((e) => {
  process.stderr.write(
    `run-publish error: ${e instanceof Error ? e.message : String(e)}\n`,
  );
  process.exit(1);
});

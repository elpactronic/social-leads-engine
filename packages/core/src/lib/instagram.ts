// Cliente HTTP para Instagram Graph API v25.0.
// Doc oficial: https://developers.facebook.com/docs/instagram-platform/content-publishing/
// Sin CLI oficial. SDK `facebook-nodejs-business-sdk` es overkill para 2 endpoints.

const BASE_URL = "https://graph.instagram.com/v25.0";

export interface PublishStoryInput {
  imageUrl: string; // debe ser URL pública accesible (ej: la que retorna kie.ai)
  caption?: string;
}

export interface PublishStoryResult {
  containerId: string;
  mediaId: string;
}

function getCredentials(): { igId: string; token: string } {
  const igId = process.env.IG_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!igId || !token) {
    throw new Error("IG_ID o IG_ACCESS_TOKEN no configurados en .env");
  }
  return { igId, token };
}

export async function createStoryContainer(
  input: PublishStoryInput,
): Promise<{ containerId: string }> {
  const { igId, token } = getCredentials();
  const body: Record<string, unknown> = {
    media_type: "STORIES",
    image_url: input.imageUrl,
  };
  if (input.caption) body.caption = input.caption;

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(igId)}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IG createStoryContainer fallo ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { id?: string };
  if (!json.id) {
    throw new Error(`IG createStoryContainer sin id en respuesta: ${JSON.stringify(json)}`);
  }
  return { containerId: json.id };
}

export async function publishContainer(
  containerId: string,
): Promise<{ mediaId: string }> {
  const { igId, token } = getCredentials();

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(igId)}/media_publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ creation_id: containerId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IG publishContainer fallo ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { id?: string };
  if (!json.id) {
    throw new Error(`IG publishContainer sin id: ${JSON.stringify(json)}`);
  }
  return { mediaId: json.id };
}

export async function publishStory(
  input: PublishStoryInput,
): Promise<PublishStoryResult> {
  const { containerId } = await createStoryContainer(input);
  const { mediaId } = await publishContainer(containerId);
  return { containerId, mediaId };
}

export async function getPublishingLimit(): Promise<{ used: number; cap: number }> {
  const { igId, token } = getCredentials();
  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(igId)}/content_publishing_limit?access_token=${encodeURIComponent(token)}`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IG content_publishing_limit fallo ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    data?: Array<{ quota_usage?: number; config?: { quota_total?: number } }>;
  };
  const row = json.data?.[0];
  return {
    used: row?.quota_usage ?? 0,
    cap: row?.config?.quota_total ?? 100,
  };
}

// Cliente HTTP para Facebook Graph API v25.0.
// Doc: https://developers.facebook.com/docs/graph-api/reference/page/photos/
// Publica fotos en una Facebook Page con caption (message).

const BASE_URL = "https://graph.facebook.com/v25.0";

export interface PublishFacebookPostInput {
  imageUrl: string;
  message?: string;
}

export interface PublishFacebookPostResult {
  postId: string;
  photoId: string;
}

function getCredentials(): { pageId: string; token: string } {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    throw new Error(
      "FB_PAGE_ID o FB_PAGE_ACCESS_TOKEN no configurados en .env",
    );
  }
  return { pageId, token };
}

export async function publishFacebookPost(
  input: PublishFacebookPostInput,
): Promise<PublishFacebookPostResult> {
  const { pageId, token } = getCredentials();

  const body: Record<string, unknown> = {
    url: input.imageUrl,
    published: true,
  };
  if (input.message) body.message = input.message;

  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(pageId)}/photos?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`FB publishFacebookPost falló ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { id?: string; post_id?: string };
  if (!json.id) {
    throw new Error(
      `FB publishFacebookPost sin id en respuesta: ${JSON.stringify(json)}`,
    );
  }

  return {
    photoId: json.id,
    postId: json.post_id ?? json.id,
  };
}

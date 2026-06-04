import { afterEach, describe, expect, it, vi } from "vitest";
import { publishStory } from "../src/lib/instagram";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.IG_ID;
  delete process.env.IG_ACCESS_TOKEN;
});

describe("instagram.ts", () => {
  it("publishStory hace flujo de 2 pasos: media + media_publish", async () => {
    process.env.IG_ID = "1234";
    process.env.IG_ACCESS_TOKEN = "tok";

    const fetchMock = vi.fn();
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "container_xyz" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "media_abc" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const res = await publishStory({ imageUrl: "https://x/img.png" });

    expect(res).toEqual({ containerId: "container_xyz", mediaId: "media_abc" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [url1, init1] = fetchMock.mock.calls[0];
    expect(String(url1)).toBe("https://graph.instagram.com/v25.0/1234/media");
    const body1 = JSON.parse(init1?.body as string);
    expect(body1).toEqual({ media_type: "STORIES", image_url: "https://x/img.png" });

    const [url2, init2] = fetchMock.mock.calls[1];
    expect(String(url2)).toBe("https://graph.instagram.com/v25.0/1234/media_publish");
    const body2 = JSON.parse(init2?.body as string);
    expect(body2).toEqual({ creation_id: "container_xyz" });
  });

  it("publishStory falla si faltan credenciales", async () => {
    await expect(publishStory({ imageUrl: "https://x/img.png" })).rejects.toThrow(
      /IG_ID|IG_ACCESS_TOKEN/,
    );
  });
});

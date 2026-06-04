import { afterEach, describe, expect, it, vi } from "vitest";
import { createTask, getTaskInfo } from "../src/lib/kie";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.KIE_AI_API_KEY;
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("kie.ts", () => {
  it("createTask envía Bearer + body con model + input.prompt + aspect_ratio default 9:16", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        code: 200,
        msg: "success",
        data: { taskId: "tsk_123" },
      }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const res = await createTask({ model: "z-image", prompt: "hola" });

    expect(res.taskId).toBe("tsk_123");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.kie.ai/api/v1/jobs/createTask");
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-key");
    const body = JSON.parse(init?.body as string);
    expect(body).toEqual({
      model: "z-image",
      input: { prompt: "hola", aspect_ratio: "9:16" },
    });
  });

  it("createTask respeta aspectRatio override", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      jsonResponse({ code: 200, data: { taskId: "tsk_456" } }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await createTask({ model: "z-image", prompt: "x", aspectRatio: "1:1" });
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(body.input.aspect_ratio).toBe("1:1");
  });

  it("createTask trunca prompt a 1000 caracteres respetando palabra", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      jsonResponse({ code: 200, data: { taskId: "tsk_789" } }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const longPrompt = "palabra ".repeat(200); // 1600 chars
    await createTask({ model: "z-image", prompt: longPrompt });
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(body.input.prompt.length).toBeLessThanOrEqual(1000);
    expect(body.input.prompt.endsWith(" ")).toBe(false);
  });

  it("createTask lanza con msg de kie cuando code !== 200", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    globalThis.fetch = vi.fn(async () =>
      jsonResponse({ code: 500, msg: "This field is required", data: null }),
    ) as unknown as typeof fetch;

    await expect(createTask({ model: "z-image", prompt: "x" })).rejects.toThrow(
      /This field is required/,
    );
  });

  it("createTask falla con error útil si no hay API key", async () => {
    await expect(createTask({ model: "z-image", prompt: "x" })).rejects.toThrow(
      /KIE_AI_API_KEY/,
    );
  });

  it("getTaskInfo mapea state=success y parsea resultJson", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    globalThis.fetch = vi.fn(async () =>
      jsonResponse({
        code: 200,
        msg: "success",
        data: {
          taskId: "tsk_123",
          state: "success",
          resultJson: JSON.stringify({
            resultUrls: ["https://cdn/img.png"],
          }),
          failCode: "",
          failMsg: "",
        },
      }),
    ) as unknown as typeof fetch;

    const info = await getTaskInfo("tsk_123");
    expect(info.status).toBe("succeeded");
    expect(info.imageUrl).toBe("https://cdn/img.png");
    expect(info.error).toBeUndefined();
  });

  it("getTaskInfo mapea state=fail y reporta failCode + failMsg", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    globalThis.fetch = vi.fn(async () =>
      jsonResponse({
        code: 200,
        data: {
          state: "fail",
          failCode: "E_PROMPT",
          failMsg: "Prompt rejected",
          resultJson: "",
        },
      }),
    ) as unknown as typeof fetch;

    const info = await getTaskInfo("tsk_x");
    expect(info.status).toBe("failed");
    expect(info.imageUrl).toBeUndefined();
    expect(info.error).toContain("E_PROMPT");
    expect(info.error).toContain("Prompt rejected");
  });

  it("getTaskInfo mapea estados intermedios a running/pending", async () => {
    process.env.KIE_AI_API_KEY = "test-key";
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ code: 200, data: { state: "queuing" } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ code: 200, data: { state: "generating" } }),
      ) as unknown as typeof fetch;

    expect((await getTaskInfo("a")).status).toBe("pending");
    expect((await getTaskInfo("b")).status).toBe("running");
  });
});

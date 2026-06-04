// Cliente HTTP para kie.ai.
// Doc oficial:
// - https://docs.kie.ai/market/z-image/z-image
// - https://docs.kie.ai/market/common/get-task-detail

const BASE_URL = "https://api.kie.ai/api/v1";

const PROMPT_MAX_LEN = 1000;

export type KieAspectRatio = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export type KieModelId =
  | "z-image"
  | "nano-banana"
  | "nano-banana-2-1k"
  | "seedream-4.0"
  | "seedream-4.5"
  | "gpt-image-2-1k"
  | (string & {});

export interface KieCreateTaskInput {
  model: KieModelId;
  prompt: string;
  aspectRatio?: KieAspectRatio;
  nsfwChecker?: boolean;
}

export interface KieTaskCreated {
  taskId: string;
}

export type KieTaskStatus = "pending" | "running" | "succeeded" | "failed";

export interface KieTaskInfo {
  taskId: string;
  status: KieTaskStatus;
  imageUrl?: string;
  error?: string;
}

function getApiKey(): string {
  const key = process.env.KIE_AI_API_KEY;
  if (!key) {
    throw new Error("KIE_AI_API_KEY no configurada en .env");
  }
  return key;
}

function truncatePrompt(prompt: string): string {
  if (prompt.length <= PROMPT_MAX_LEN) return prompt;
  // Cortar en límite de palabra para no romper la mitad de algo.
  const slice = prompt.slice(0, PROMPT_MAX_LEN - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 200 ? slice.slice(0, lastSpace) : slice).trim();
}

export async function createTask(
  input: KieCreateTaskInput,
): Promise<KieTaskCreated> {
  const body: Record<string, unknown> = {
    model: input.model,
    input: {
      prompt: truncatePrompt(input.prompt),
      aspect_ratio: input.aspectRatio ?? "9:16",
      ...(input.nsfwChecker !== undefined
        ? { nsfw_checker: input.nsfwChecker }
        : {}),
    },
  };

  const res = await fetch(`${BASE_URL}/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: { code?: number; msg?: string; data?: { taskId?: string } } = {};
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `kie.ai createTask: respuesta no-JSON (HTTP ${res.status}): ${text.slice(0, 400)}`,
    );
  }

  if (!res.ok || json.code !== 200) {
    const detail = json.msg ?? text.slice(0, 400);
    throw new Error(
      `kie.ai createTask falló (HTTP ${res.status}, code ${json.code ?? "?"}): ${detail}`,
    );
  }

  const taskId = json.data?.taskId;
  if (!taskId) {
    throw new Error(
      `kie.ai createTask: respuesta sin data.taskId. Body: ${text.slice(0, 400)}`,
    );
  }
  return { taskId };
}

export async function getTaskInfo(taskId: string): Promise<KieTaskInfo> {
  const url = new URL(`${BASE_URL}/jobs/recordInfo`);
  url.searchParams.set("taskId", taskId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  const text = await res.text();
  let json: { code?: number; msg?: string; data?: Record<string, unknown> } =
    {};
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `kie.ai recordInfo: respuesta no-JSON (HTTP ${res.status}): ${text.slice(0, 400)}`,
    );
  }

  if (!res.ok || json.code !== 200 || !json.data) {
    const detail = json.msg ?? text.slice(0, 400);
    throw new Error(
      `kie.ai recordInfo falló (HTTP ${res.status}, code ${json.code ?? "?"}): ${detail}`,
    );
  }

  const data = json.data;
  const stateRaw = String(data.state ?? "waiting");
  const status: KieTaskStatus =
    stateRaw === "success"
      ? "succeeded"
      : stateRaw === "fail"
        ? "failed"
        : stateRaw === "generating" ||
            stateRaw === "running" ||
            stateRaw === "processing"
          ? "running"
          : "pending";

  let imageUrl: string | undefined;
  const resultJsonRaw = data.resultJson;
  if (typeof resultJsonRaw === "string" && resultJsonRaw.length > 0) {
    try {
      const parsed = JSON.parse(resultJsonRaw) as {
        resultUrls?: string[];
        urls?: string[];
      };
      imageUrl = parsed.resultUrls?.[0] ?? parsed.urls?.[0];
    } catch {
      // resultJson malformado: lo ignoramos y dejamos undefined
    }
  }

  const failMsg = typeof data.failMsg === "string" ? data.failMsg : undefined;
  const failCode =
    typeof data.failCode === "string" ? data.failCode : undefined;
  const error =
    status === "failed"
      ? [failCode, failMsg].filter(Boolean).join(" — ") ||
        "kie.ai fail sin detalle"
      : undefined;

  return { taskId, status, imageUrl, error };
}

export async function pollUntilDone(
  taskId: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<KieTaskInfo> {
  const intervalMs = opts.intervalMs ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000;
  const startedAt = Date.now();
  while (true) {
    const info = await getTaskInfo(taskId);
    if (info.status === "succeeded" || info.status === "failed") return info;
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(
        `kie.ai polling timeout (${timeoutMs}ms) para taskId ${taskId}`,
      );
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

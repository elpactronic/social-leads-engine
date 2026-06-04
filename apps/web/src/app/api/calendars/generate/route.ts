import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { getProjectRoot, listPosts } from "@social-leads/core";

const TIMEOUT_MS = 10 * 60 * 1000;

export const maxDuration = 600;

interface Body {
  topic?: unknown;
  date?: unknown;
  count?: unknown;
  platform?: unknown;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body inválido (esperaba JSON)." },
      { status: 400 },
    );
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json(
      { ok: false, error: "Falta el tema u oferta del calendario." },
      { status: 400 },
    );
  }

  const dateRaw = typeof body.date === "string" ? body.date.trim() : "";
  if (!dateRaw || !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
    return NextResponse.json(
      { ok: false, error: "La fecha debe estar en formato YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const countRaw =
    typeof body.count === "number"
      ? body.count
      : typeof body.count === "string" && body.count.trim() !== ""
        ? Number(body.count)
        : undefined;
  if (countRaw !== undefined && (!Number.isInteger(countRaw) || countRaw < 1)) {
    return NextResponse.json(
      { ok: false, error: "La cantidad debe ser un entero mayor a 0." },
      { status: 400 },
    );
  }

  const projectRoot = getProjectRoot();

  if (!existsSync(path.join(projectRoot, "config/rubro.yaml"))) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No existe config/rubro.yaml. Corre /configure-rubro desde Claude Code antes de generar el calendario.",
      },
      { status: 400 },
    );
  }

  if (!existsSync(path.join(projectRoot, "content/knowledge-base.md"))) {
    return NextResponse.json(
      {
        ok: false,
        error: "No existe content/knowledge-base.md (lo necesita el skill).",
      },
      { status: 400 },
    );
  }

  const validPlatforms = ["instagram", "facebook", "tiktok", "all"];
  const platform =
    typeof body.platform === "string" && validPlatforms.includes(body.platform)
      ? body.platform
      : "instagram";

  const platformLabel =
    platform === "all"
      ? "instagram, facebook y tiktok (distribuir los posts entre las tres plataformas)"
      : platform;

  const parts = [topic, `Fecha: ${dateRaw}.`, `Plataforma: ${platformLabel}.`];
  if (countRaw !== undefined) parts.push(`Cantidad: ${countRaw} posts.`);
  const argumentString = parts.join(" ");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (
        type: "log" | "stderr" | "done" | "error",
        message: string,
      ) => {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type, message }) + "\n"),
        );
      };

      send("log", `Comando: /generate-calendar ${argumentString}`);
      send(
        "log",
        "Spawneando Claude Code en headless (puede tardar varios minutos)...",
      );

      const child = spawn(
        "claude",
        [
          "-p",
          `/generate-calendar ${argumentString}`,
          "--permission-mode",
          "acceptEdits",
          "--verbose",
        ],
        {
          cwd: projectRoot,
          env: process.env,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );

      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
      }, TIMEOUT_MS);

      let stdoutBuf = "";
      let stderrBuf = "";

      child.stdout.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8");
        stdoutBuf += text;
        for (const line of text.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed) send("log", trimmed);
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8");
        stderrBuf += text;
        for (const line of text.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed) send("stderr", trimmed);
        }
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        send("error", `No se pudo invocar claude CLI: ${err.message}`);
        controller.close();
      });

      child.on("close", async (code) => {
        clearTimeout(timer);

        if (timedOut) {
          send("error", `Timeout tras ${TIMEOUT_MS / 1000}s.`);
          controller.close();
          return;
        }

        let postCount = 0;
        try {
          const stories = await listPosts(dateRaw);
          postCount = stories.length;
        } catch {
          // ignore
        }

        if (postCount === 0) {
          send(
            "error",
            code !== 0
              ? `claude CLI salió con código ${code} y no se generó ningún post.`
              : `claude terminó OK pero no se creó ningún post en content/calendars/${dateRaw}/. Revisa los logs (probablemente el skill abortó por falta de datos).`,
          );
        } else {
          send(
            "done",
            `Generados ${postCount} post${postCount === 1 ? "" : "s"} en content/calendars/${dateRaw}/.`,
          );
        }

        // Mantenemos refs a stdoutBuf/stderrBuf por si en el futuro queremos
        // dumpear todo al cliente; por ahora ya fueron enviadas línea a línea.
        void stdoutBuf;
        void stderrBuf;
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

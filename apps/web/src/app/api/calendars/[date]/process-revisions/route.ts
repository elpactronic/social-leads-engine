import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { listStories } from "@warm-stories/core";

const TIMEOUT_MS = 5 * 60 * 1000;

export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const stories = await listStories(date);
  const pending = stories.filter((s) => s.status === "needs-revision");
  if (pending.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No hay historias pendientes de revisión." },
      { status: 400 },
    );
  }

  const result = await runClaude([
    "-p",
    "/process-revisions",
    "--permission-mode",
    "acceptEdits",
    "--output-format",
    "json",
  ]);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        stdout: result.stdout,
        stderr: result.stderr,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    processed: pending.length,
    output: result.stdout,
  });
}

interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

function runClaude(args: string[]): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn("claude", args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
    }, TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        stdout,
        stderr,
        error: `No se pudo invocar claude CLI: ${err.message}`,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        resolve({
          ok: false,
          stdout,
          stderr,
          error: `Timeout tras ${TIMEOUT_MS / 1000}s ejecutando /process-revisions.`,
        });
        return;
      }
      if (code !== 0) {
        resolve({
          ok: false,
          stdout,
          stderr,
          error: `claude CLI salió con código ${code}.`,
        });
        return;
      }
      resolve({ ok: true, stdout, stderr });
    });
  });
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FailedStory {
  id: string;
  slot: number;
  model: string;
  error: string;
}

interface Props {
  date: string;
  draftCount: number;
  pendingImage: number;
  generating: number;
  ready: number;
  failed: number;
  regenerable: number;
  downloadable: number;
  needsRevision: number;
  failedStories: FailedStory[];
}

type BusyAction =
  | "approve"
  | "images"
  | "regenerate"
  | "revisions"
  | "download"
  | null;

export default function CalendarActions({
  date,
  draftCount,
  pendingImage,
  generating,
  ready,
  failed,
  regenerable,
  downloadable,
  needsRevision,
  failedStories,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<BusyAction>(null);
  const [msg, setMsg] = useState<string>("");

  // Mientras hay trabajo en curso (busy o generating en background),
  // refrescamos el server component para ver el avance tarjeta por tarjeta.
  useEffect(() => {
    if (busy === null && generating === 0) return;
    const id = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(id);
  }, [busy, generating, router]);

  async function call(action: "approve-all" | "generate-images") {
    setBusy(action === "approve-all" ? "approve" : "images");
    setMsg("");
    try {
      const res = await fetch(
        `/api/calendars/${encodeURIComponent(date)}/${action}`,
        { method: "POST" },
      );
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        approved?: number;
        generated?: number;
        failed?: number;
        errors?: { id: string; error: string }[];
      };
      if (!res.ok || !json.ok) {
        const detail = json.errors?.[0]?.error
          ? ` — ${json.errors[0].error.slice(0, 200)}`
          : "";
        setMsg((json.error ?? `Error en ${action}`) + detail);
      } else if (action === "approve-all") {
        setMsg(`Aprobadas ${json.approved ?? 0} historias.`);
      } else {
        setMsg(
          `Generadas ${json.generated ?? 0} · Fallidas ${json.failed ?? 0}`,
        );
      }
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function regenerateAll() {
    if (
      !window.confirm(
        `Vas a regenerar ${regenerable} ${regenerable === 1 ? "imagen ya creada" : "imágenes ya creadas"}. Esto vuelve a llamar a kie.ai y puede tardar varios minutos. ¿Continuar?`,
      )
    ) {
      return;
    }
    setBusy("regenerate");
    setMsg("Regenerando imágenes...");
    try {
      const res = await fetch(
        `/api/calendars/${encodeURIComponent(date)}/regenerate-images`,
        { method: "POST" },
      );
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        generated?: number;
        failed?: number;
        errors?: { id: string; error: string }[];
      };
      if (!res.ok || !json.ok) {
        const detail = json.errors?.[0]?.error
          ? ` — ${json.errors[0].error.slice(0, 200)}`
          : "";
        setMsg((json.error ?? "Error al regenerar") + detail);
      } else {
        setMsg(
          `Regeneradas ${json.generated ?? 0} · Fallidas ${json.failed ?? 0}`,
        );
      }
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function downloadAll() {
    setBusy("download");
    setMsg("Empaquetando imágenes...");
    try {
      const res = await fetch(
        `/api/calendars/${encodeURIComponent(date)}/download-images`,
        { method: "POST" },
      );
      if (!res.ok) {
        const json = (await res
          .json()
          .catch(() => ({}) as { error?: string })) as { error?: string };
        setMsg(json.error ?? `Error al descargar (HTTP ${res.status})`);
        return;
      }
      const included = res.headers.get("X-Images-Included") ?? "?";
      const skipped = res.headers.get("X-Images-Skipped") ?? "0";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historias-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg(
        `Descargadas ${included} imágenes${skipped !== "0" ? ` · ${skipped} omitidas` : ""}.`,
      );
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function processRevisions() {
    setBusy("revisions");
    setMsg(
      "Ejecutando /process-revisions en Claude Code (puede tardar varios minutos)...",
    );
    try {
      const res = await fetch(
        `/api/calendars/${encodeURIComponent(date)}/process-revisions`,
        { method: "POST" },
      );
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        processed?: number;
        stderr?: string;
      };
      if (!res.ok || !json.ok) {
        const detail = json.stderr ? ` — ${json.stderr.slice(0, 200)}` : "";
        setMsg((json.error ?? "Error al procesar cambios") + detail);
      } else {
        setMsg(`Procesadas ${json.processed ?? 0} historias.`);
        router.refresh();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const canApprove = draftCount > 0;
  const canGenerate = pendingImage > 0 && draftCount === 0;
  const canRegenerate = regenerable > 0;
  const canDownload = downloadable > 0;
  const canProcessRevisions = needsRevision > 0;

  return (
    <div className="card">
      <h2>Revisión del calendario</h2>
      <p className="muted">
        Primero aprueba los textos en bloque. Cuando estén listos, genera las
        imágenes para todas las historias en una sola pasada.
      </p>
      <div className="toolbar">
        <button
          disabled={!canApprove || busy !== null}
          onClick={() => call("approve-all")}
        >
          {busy === "approve"
            ? "Aprobando..."
            : `Aprobar ${draftCount} texto${draftCount === 1 ? "" : "s"}`}
        </button>
        <button
          className="secondary"
          disabled={!canGenerate || busy !== null}
          onClick={() => call("generate-images")}
          title={
            draftCount > 0
              ? "Aprueba primero todos los textos"
              : pendingImage === 0
                ? "Nada pendiente de imagen"
                : ""
          }
        >
          {busy === "images"
            ? `Generando... (${ready}/${ready + generating + pendingImage} listas)`
            : `Generar ${pendingImage} imagen${pendingImage === 1 ? "" : "es"}${failed > 0 ? ` (${failed} a reintentar)` : ""}`}
        </button>
        {canRegenerate && (
          <button
            className="secondary"
            disabled={busy !== null}
            onClick={regenerateAll}
            title="Vuelve a llamar a kie.ai con el prompt actual para todas las imágenes ya creadas"
          >
            {busy === "regenerate"
              ? `Regenerando... (${ready}/${regenerable} listas)`
              : `Regenerar ${regenerable} imagen${regenerable === 1 ? "" : "es"}`}
          </button>
        )}
        {canDownload && (
          <button
            className="secondary"
            disabled={busy !== null}
            onClick={downloadAll}
            title="Descarga todas las imágenes generadas en un .zip para subirlas a Instagram manualmente"
          >
            {busy === "download"
              ? "Empaquetando..."
              : `Descargar ${downloadable} imagen${downloadable === 1 ? "" : "es"} (.zip)`}
          </button>
        )}
        {canProcessRevisions && (
          <button
            className="secondary"
            disabled={busy !== null}
            onClick={processRevisions}
            title="Spawn de Claude Code en headless para aplicar el feedback escrito"
          >
            {busy === "revisions"
              ? "Procesando cambios..."
              : `Ejecutar ${needsRevision} cambio${needsRevision === 1 ? "" : "s"} pendiente${needsRevision === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
      {(generating > 0 || busy === "images" || busy === "regenerate") && (
        <p className="muted">
          {generating} generando · {ready} listas
          {failed > 0 ? ` · ${failed} fallidas` : ""}
        </p>
      )}
      {msg && <p className="muted">{msg}</p>}
      {failedStories.length > 0 && (
        <details className="error-log" open={busy !== "images"}>
          <summary>
            Ver log de errores ({failedStories.length}{" "}
            {failedStories.length === 1 ? "historia" : "historias"})
          </summary>
          <ul className="error-list">
            {failedStories.map((s) => (
              <li key={s.id} className="error-item">
                <div className="error-item-head">
                  <strong>
                    #{String(s.slot).padStart(2, "0")} · {s.id}
                  </strong>
                  {s.model && <span className="muted"> · {s.model}</span>}
                </div>
                <pre className="error-item-body">{s.error}</pre>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

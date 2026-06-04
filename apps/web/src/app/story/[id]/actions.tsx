"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PostStatus } from "@social-leads/core";

interface Props {
  id: string;
  status: PostStatus;
  hasImage: boolean;
  existingChangeRequest: string;
  imageError: string;
}

export default function StoryActions({
  id,
  status,
  hasImage,
  existingChangeRequest,
  imageError,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [requestBusy, setRequestBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [feedback, setFeedback] = useState(existingChangeRequest);

  async function call(
    action: "approve" | "image" | "publish" | "regenerate-image",
  ) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(
        `/api/stories/${encodeURIComponent(id)}/${action}`,
        { method: "POST" },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error ?? `Error en ${action}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function requestChanges() {
    if (feedback.trim().length < 5) {
      setMsg("Escribe qué quieres cambiar (mínimo 5 caracteres).");
      return;
    }
    setRequestBusy(true);
    setMsg("");
    try {
      const res = await fetch(
        `/api/stories/${encodeURIComponent(id)}/request-changes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: feedback.trim() }),
        },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error ?? "Error al solicitar cambios");
      } else {
        setMsg(
          "Listo. Vuelve a Claude Code y ejecuta /process-revisions para regenerar.",
        );
        router.refresh();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setRequestBusy(false);
    }
  }

  const canRequestChanges = status !== "published";

  return (
    <div className="card">
      <h2>Acciones</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {status === "draft" && (
          <button disabled={busy} onClick={() => call("approve")}>
            Aprobar
          </button>
        )}
        {status === "approved" && !hasImage && (
          <button disabled={busy} onClick={() => call("image")}>
            Generar imagen
          </button>
        )}
        {status === "ready" && hasImage && (
          <button disabled={busy} onClick={() => call("publish")}>
            Publicar a Instagram
          </button>
        )}
        {status === "published" && <span className="muted">Ya publicada.</span>}
        {status === "needs-revision" && (
          <span className="muted">
            Cambios pendientes. Ejecuta <code>/process-revisions</code> en
            Claude Code.
          </span>
        )}
        {status === "failed" && (
          <button disabled={busy} onClick={() => call("regenerate-image")}>
            {busy ? "Reintentando..." : "Reintentar imagen"}
          </button>
        )}
        {status === "ready" && hasImage && (
          <button
            className="secondary"
            disabled={busy}
            onClick={() => call("regenerate-image")}
            title="Vuelve a generar la imagen con el prompt actual"
          >
            {busy ? "Regenerando..." : "Regenerar imagen"}
          </button>
        )}
      </div>
      {status === "failed" && imageError && (
        <details style={{ marginTop: 8 }}>
          <summary className="muted">Ver último error de kie.ai</summary>
          <pre
            style={{
              marginTop: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {imageError}
          </pre>
        </details>
      )}
      {busy && <p className="muted">Procesando...</p>}

      {canRequestChanges && (
        <details className="lm-feedback" style={{ marginTop: 12 }}>
          <summary>Solicitar cambios (regenerar desde Claude Code)</summary>
          <p className="muted">
            Escribe qué quieres que cambie. Al enviar, la historia queda marcada
            como <code>needs-revision</code>. Vuelve a tu sesión de Claude Code
            y ejecuta <code>/process-revisions</code> — usa tu sesión activa, no
            la API, así no eleva el costo.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Ej: el hook está flojo, hazlo más concreto. Cambia el CTA por algo con palabra clave."
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={requestBusy} onClick={requestChanges}>
              {requestBusy ? "Guardando..." : "Solicitar cambios"}
            </button>
          </div>
        </details>
      )}

      {msg && <p style={{ color: "var(--bad)" }}>{msg}</p>}
    </div>
  );
}

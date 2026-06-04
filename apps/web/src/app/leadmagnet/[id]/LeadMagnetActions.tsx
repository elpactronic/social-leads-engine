"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadMagnetStatus } from "@warm-stories/core";

interface Props {
  id: string;
  status: LeadMagnetStatus;
  existingChangeRequest: string;
}

export default function LeadMagnetActions({
  id,
  status,
  existingChangeRequest,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "request" | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [feedback, setFeedback] = useState(existingChangeRequest);

  async function approve() {
    setBusy("approve");
    setMsg("");
    try {
      const res = await fetch(
        `/api/leadmagnets/${encodeURIComponent(id)}/approve`,
        { method: "POST" },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) setMsg(json.error ?? "Error al aprobar");
      else router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function requestChanges() {
    if (feedback.trim().length < 5) {
      setMsg("Escribe qué quieres cambiar (mínimo 5 caracteres).");
      return;
    }
    setBusy("request");
    setMsg("");
    try {
      const res = await fetch(
        `/api/leadmagnets/${encodeURIComponent(id)}/request-changes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: feedback.trim() }),
        },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok)
        setMsg(json.error ?? "Error al solicitar cambios");
      else {
        setMsg(
          "Listo. Vuelve a Claude Code y ejecuta /process-revisions para regenerarlo.",
        );
        router.refresh();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="lm-actions">
      <div className="lm-actions-row">
        <button
          onClick={() => window.print()}
          className="secondary"
          type="button"
        >
          Imprimir / Guardar PDF
        </button>
        {status === "draft" || status === "needs-revision" ? (
          <button
            disabled={busy !== null}
            onClick={approve}
            type="button"
            title="Marca el lead magnet como aprobado para distribuirlo"
          >
            {busy === "approve" ? "Aprobando..." : "Aprobar"}
          </button>
        ) : null}
      </div>

      <details className="lm-feedback">
        <summary>Solicitar cambios</summary>
        <p className="muted">
          Escribe qué quieres que cambie. Al enviar, el archivo queda marcado
          como <code>needs-revision</code>. Vuelve a Claude Code y ejecuta{" "}
          <code>/process-revisions</code> — usa tu sesión activa, no la API, así
          no se eleva el costo.
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Ej: haz el hook más fuerte. Reemplaza la sección 3 por algo más concreto. Cambia el CTA final."
        />
        <div className="lm-actions-row">
          <button
            disabled={busy !== null}
            onClick={requestChanges}
            type="button"
          >
            {busy === "request" ? "Guardando..." : "Solicitar cambios"}
          </button>
        </div>
      </details>

      {msg && <p className="muted lm-msg">{msg}</p>}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StoryPreview from "@/components/StoryPreview";
import type { Story, AvatarConfig } from "@warm-stories/core";

interface Props {
  story: Story;
  palette: AvatarConfig["brand"]["palette"];
}

export default function StoryGridItem({ story, palette }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<
    "approve" | "request" | "regenerate" | "delete" | null
  >(null);
  const [error, setError] = useState<string>("");
  const [showRequest, setShowRequest] = useState(false);
  const [feedback, setFeedback] = useState(story.change_request ?? "");

  function openDetail() {
    router.push(`/story/${encodeURIComponent(story.id)}`);
  }

  async function approve(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy("approve");
    setError("");
    try {
      const res = await fetch(
        `/api/stories/${encodeURIComponent(story.id)}/approve`,
        { method: "POST" },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error al aprobar");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function remove(e: React.MouseEvent) {
    e.stopPropagation();
    const confirmed = window.confirm(
      `¿Eliminar la historia #${String(story.slot).padStart(2, "0")}? Esta acción borra el archivo .md y no se puede deshacer.`,
    );
    if (!confirmed) return;
    setBusy("delete");
    setError("");
    try {
      const res = await fetch(`/api/stories/${encodeURIComponent(story.id)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error al eliminar");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function regenerate(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy("regenerate");
    setError("");
    try {
      const res = await fetch(
        `/api/stories/${encodeURIComponent(story.id)}/regenerate-image`,
        { method: "POST" },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error al regenerar");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function requestChanges(e: React.MouseEvent) {
    e.stopPropagation();
    if (feedback.trim().length < 5) {
      setError("Escribe al menos 5 caracteres.");
      return;
    }
    setBusy("request");
    setError("");
    try {
      const res = await fetch(
        `/api/stories/${encodeURIComponent(story.id)}/request-changes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: feedback.trim() }),
        },
      );
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Error al pedir cambios");
      } else {
        setShowRequest(false);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const canRequest = story.status !== "published";
  const isDraft = story.status === "draft";
  const hasPendingRequest = Boolean(story.change_request);
  const isFailed = story.status === "failed";
  const canRegenerate =
    story.status !== "published" &&
    story.status !== "generating-image" &&
    (Boolean(story.image_url) || isFailed);
  const canDelete = story.status !== "generating-image";

  return (
    <div className="preview-grid-item">
      <div
        onClick={openDetail}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") openDetail();
        }}
        style={{ cursor: "pointer" }}
      >
        <StoryPreview story={story} palette={palette} size="sm" />
        <div className="preview-grid-meta">
          <span>
            #{String(story.slot).padStart(2, "0")} · {story.function}
          </span>
          <span className={`status ${story.status}`}>{story.status}</span>
        </div>
      </div>

      <div className="preview-grid-actions">
        {isDraft && (
          <button
            className="preview-grid-approve"
            disabled={busy !== null}
            onClick={approve}
          >
            {busy === "approve" ? "Aprobando..." : "Aprobar"}
          </button>
        )}
        {canRequest && (
          <button
            className="preview-grid-request secondary"
            disabled={busy !== null}
            onClick={(e) => {
              e.stopPropagation();
              setShowRequest((v) => !v);
              setError("");
            }}
          >
            {hasPendingRequest ? "Editar cambios" : "Pedir cambios"}
          </button>
        )}
        {canRegenerate && (
          <button
            className="preview-grid-regenerate secondary"
            disabled={busy !== null}
            onClick={regenerate}
            title={
              isFailed
                ? "Vuelve a intentar generar la imagen tras el último fallo"
                : "Vuelve a generar la imagen con el prompt actual"
            }
          >
            {busy === "regenerate"
              ? isFailed
                ? "Reintentando..."
                : "Regenerando..."
              : isFailed
                ? "Reintentar imagen"
                : "Regenerar imagen"}
          </button>
        )}
        {canDelete && (
          <button
            className="preview-grid-delete danger"
            disabled={busy !== null}
            onClick={remove}
            title="Eliminar esta historia"
          >
            {busy === "delete" ? "Eliminando..." : "Eliminar"}
          </button>
        )}
      </div>

      {showRequest && canRequest && (
        <div
          className="preview-grid-request-form"
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Ej: el hook está flojo, hazlo más concreto."
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={busy !== null}
              onClick={requestChanges}
              style={{ flex: 1, fontSize: 12, padding: "6px 10px" }}
            >
              {busy === "request" ? "Guardando..." : "Enviar"}
            </button>
            <button
              className="secondary"
              disabled={busy !== null}
              onClick={(e) => {
                e.stopPropagation();
                setShowRequest(false);
                setFeedback(story.change_request ?? "");
                setError("");
              }}
              style={{ fontSize: 12, padding: "6px 10px" }}
            >
              Cancelar
            </button>
          </div>
          <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>
            Al enviar queda en <code>needs-revision</code>. Ejecuta{" "}
            <code>/process-revisions</code> en Claude Code para aplicar.
          </p>
        </div>
      )}

      {error && <p style={{ color: "var(--bad)", fontSize: 12 }}>{error}</p>}
    </div>
  );
}

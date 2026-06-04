import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listStories,
  listLeadMagnetsForCalendar,
  loadAvatar,
} from "@warm-stories/core";
import CalendarActions from "./CalendarActions";
import LeadMagnetGenerate from "./LeadMagnetGenerate";
import StoryGridItem from "./StoryGridItem";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const stories = await listStories(date);

  if (stories.length === 0) {
    notFound();
  }

  const avatar = await loadAvatar();
  const palette = avatar.brand.palette;
  const leadMagnets = await listLeadMagnetsForCalendar(date);

  const draftCount = stories.filter((s) => s.status === "draft").length;
  const pendingImage = stories.filter(
    (s) => (s.status === "approved" || s.status === "failed") && !s.image_url,
  ).length;
  const generating = stories.filter(
    (s) => s.status === "generating-image",
  ).length;
  const ready = stories.filter((s) => s.status === "ready").length;
  const published = stories.filter((s) => s.status === "published").length;
  const failed = stories.filter((s) => s.status === "failed").length;
  const regenerable = stories.filter(
    (s) => s.status !== "published" && Boolean(s.image_url),
  ).length;
  const downloadable = stories.filter((s) => Boolean(s.image_url)).length;
  const needsRevision = stories.filter(
    (s) => s.status === "needs-revision",
  ).length;

  return (
    <main>
      <Link href="/" className="muted">
        ← volver
      </Link>
      <h1>Calendario {date}</h1>
      <p className="muted">
        {stories.length} historias · {draftCount} draft · {ready} ready ·{" "}
        {published} publicadas
      </p>

      <CalendarActions
        date={date}
        draftCount={draftCount}
        pendingImage={pendingImage}
        generating={generating}
        ready={ready}
        failed={failed}
        regenerable={regenerable}
        downloadable={downloadable}
        needsRevision={needsRevision}
        failedStories={stories
          .filter((s) => s.status === "failed")
          .map((s) => ({
            id: s.id,
            slot: s.slot,
            model: s.image_model || "",
            error:
              s.image_error || "Sin detalle (regenera para capturar el error).",
          }))}
      />

      <h2>Lead magnet</h2>
      {leadMagnets.length === 0 ? (
        <LeadMagnetGenerate date={date} />
      ) : (
        <div>
          {leadMagnets.map((lm) => (
            <Link
              key={lm.id}
              href={`/leadmagnet/${encodeURIComponent(lm.id)}` as never}
              className="lm-card"
              style={{ color: "inherit" }}
            >
              <div>
                <strong>{lm.keyword}</strong>{" "}
                <span className="muted"> · creado {lm.created}</span>
                {lm.change_request && (
                  <p className="muted" style={{ marginTop: 6 }}>
                    Cambios pedidos: {lm.change_request.slice(0, 140)}
                    {lm.change_request.length > 140 ? "…" : ""}
                  </p>
                )}
              </div>
              <span className={`status ${lm.status}`}>{lm.status}</span>
            </Link>
          ))}
        </div>
      )}

      <h2>Preview tipográfico</h2>
      <p className="muted">
        Cada historia es UN slide con UNA idea, alineada a su función dentro del
        funnel (gancho → empatía → insight → prueba → CTA). Cuando se generen
        las imágenes, el texto queda superpuesto con contraste sobre el fondo.
      </p>

      <div className="preview-grid">
        {stories.map((s) => (
          <StoryGridItem key={s.id} story={s} palette={palette} />
        ))}
      </div>
    </main>
  );
}

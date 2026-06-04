import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findLeadMagnetById,
  loadAvatar,
  renderMarkdown,
} from "@warm-stories/core";
import LeadMagnetActions from "./LeadMagnetActions";

export const dynamic = "force-dynamic";

export default async function LeadMagnetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const lm = await findLeadMagnetById(decoded);
  if (!lm) notFound();

  const avatar = await loadAvatar();
  const palette = avatar.brand.palette;
  const html = renderMarkdown(lm.body);

  const accent = palette.accent ?? "#1E40AF";
  const ink = palette.primary ?? "#111827";

  return (
    <main className="lm-shell">
      <div className="lm-toolbar no-print">
        <Link
          href={`/calendar/${lm.related_calendar}` as never}
          className="muted"
        >
          ← {lm.related_calendar}
        </Link>
        <span className={`status ${lm.status}`}>{lm.status}</span>
        <LeadMagnetActions
          id={lm.id}
          status={lm.status}
          existingChangeRequest={lm.change_request ?? ""}
        />
      </div>

      <article
        className="lm-doc"
        style={
          {
            "--lm-accent": accent,
            "--lm-ink": ink,
          } as React.CSSProperties
        }
      >
        <header className="lm-doc-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="lm-doc-logo"
            src="/logo.png"
            alt={`${avatar.brand.name} logo`}
            width={48}
            height={48}
          />
          <div className="lm-doc-brand">
            {avatar.brand.name} · {avatar.brand.instagram_handle}
          </div>
        </header>
        <div
          className="lm-doc-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer className="lm-doc-footer">
          <div className="lm-doc-footer-brand">{avatar.brand.name}</div>
          {lm.offer_link && (
            <div className="lm-doc-footer-cta">
              Si quieres más como esto, súmate a la comunidad:{" "}
              <a href={lm.offer_link} target="_blank" rel="noopener">
                {lm.offer_link.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </footer>
      </article>
    </main>
  );
}

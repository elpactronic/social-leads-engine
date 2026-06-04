import Link from "next/link";
import { listCalendars } from "@social-leads/core";
import type { PostPlatform } from "@social-leads/core";
import GenerateCalendarForm from "../components/GenerateCalendarForm";

export const dynamic = "force-dynamic";

const PLATFORM_ICON: Record<PostPlatform, string> = {
  instagram: "📷",
  facebook: "👍",
  tiktok: "🎵",
  multi: "🌐",
};

const PLATFORM_LABEL: Record<PostPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  multi: "Multi",
};

export default async function HomePage() {
  const calendars = await listCalendars();

  return (
    <main>
      <h1>Vision House · Social Leads</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Genera calendarios desde aquí o desde Claude Code con{" "}
        <code>/generate-calendar &lt;tema&gt;</code>.
      </p>

      <GenerateCalendarForm />

      {calendars.length === 0 ? (
        <div className="card warning-notice" role="status">
          <svg
            className="warning-notice-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <p>
            No hay calendarios todavía. Empieza generando el primero con el
            formulario de arriba.
          </p>
        </div>
      ) : (
        <div>
          <h2>Calendarios</h2>
          {calendars.map((c) => (
            <div key={c.date} className="card calendar-card">
              {/* Fecha */}
              <div className="calendar-card-date">
                <strong>{c.date}</strong>
                <span className="muted">
                  {c.count} post{c.count !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Fila por plataforma */}
              {c.byPlatform.map((group) => (
                <Link
                  key={group.platform}
                  href={`/calendar/${c.date}?platform=${group.platform}` as never}
                  className="calendar-platform-row"
                >
                  <span className="calendar-platform-name">
                    {PLATFORM_ICON[group.platform]}{" "}
                    {PLATFORM_LABEL[group.platform]}
                  </span>
                  <span className="muted calendar-platform-count">
                    {group.count} post{group.count !== 1 ? "s" : ""}
                  </span>
                  <div className="calendar-platform-status">
                    {Object.entries(group.byStatus)
                      .filter(([, n]) => n > 0)
                      .map(([s, n]) => (
                        <span key={s} className={`status ${s}`}>
                          {s}: {n}
                        </span>
                      ))}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

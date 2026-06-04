import Link from "next/link";
import { listCalendars } from "@warm-stories/core";
import GenerateCalendarForm from "../components/GenerateCalendarForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const calendars = await listCalendars();

  return (
    <main>
      <h1>warm-stories</h1>
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
            <Link
              key={c.date}
              href={`/calendar/${c.date}` as never}
              className="card"
              style={{ display: "block", color: "inherit" }}
            >
              <div className="row">
                <div>
                  <strong>{c.date}</strong>{" "}
                  <span className="muted">
                    · {c.count} historia{c.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(c.byStatus)
                    .filter(([, n]) => n > 0)
                    .map(([s, n]) => (
                      <span key={s} className={`status ${s}`}>
                        {s}: {n}
                      </span>
                    ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

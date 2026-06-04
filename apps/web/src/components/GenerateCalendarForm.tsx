"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface LogEntry {
  type: "log" | "stderr" | "done" | "error";
  message: string;
}

export default function GenerateCalendarForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [count, setCount] = useState("5");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [fieldError, setFieldError] = useState<
    "topic" | "date" | "count" | null
  >(null);

  const topicRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic.trim()) {
      setFieldError("topic");
      setMsg("Por favor escribe el tema u oferta del calendario.");
      topicRef.current?.focus();
      return;
    }
    if (!date) {
      setFieldError("date");
      setMsg("Selecciona la fecha del calendario.");
      dateRef.current?.focus();
      return;
    }
    const n = Number(count);
    if (count === "" || !Number.isInteger(n) || n < 1 || n > 20) {
      setFieldError("count");
      setMsg("La cantidad debe ser un número entre 1 y 20.");
      countRef.current?.focus();
      return;
    }
    setFieldError(null);
    setBusy(true);
    setLog([]);
    setMsg(
      "Ejecutando /generate-calendar en Claude Code (puede tardar varios minutos)...",
    );

    try {
      const res = await fetch("/api/calendars/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          date,
          count: Number(count),
        }),
      });

      if (!res.ok) {
        const json = (await res
          .json()
          .catch(() => ({}) as { error?: string })) as {
          error?: string;
        };
        setMsg(json.error ?? `Error HTTP ${res.status}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setMsg("La respuesta no es un stream legible.");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let finalEvent: LogEntry | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (!line.trim()) continue;
          try {
            const evt = JSON.parse(line) as LogEntry;
            setLog((prev) => [...prev, evt]);
            if (evt.type === "done" || evt.type === "error") {
              finalEvent = evt;
            }
          } catch {
            // línea no-JSON
          }
        }
      }

      if (finalEvent?.type === "done") {
        setMsg(finalEvent.message);
        setTopic("");
        setDate("");
        setCount("5");
        router.refresh();
      } else if (finalEvent?.type === "error") {
        setMsg(finalEvent.message);
      } else {
        setMsg(
          "La generación terminó sin un evento final claro. Revisa el log.",
        );
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card generate-form" onSubmit={submit} noValidate>
      <h2>Generar calendario</h2>
      <div className="generate-form-row">
        <label className="generate-form-field" style={{ flex: 2 }}>
          <span>Tema u oferta</span>
          <input
            ref={topicRef}
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (fieldError === "topic") setFieldError(null);
            }}
            placeholder="Ej: lanzamiento del curso de scraping con n8n"
            disabled={busy}
            aria-invalid={fieldError === "topic"}
          />
        </label>
        <label className="generate-form-field">
          <span>Fecha</span>
          <div
            className="date-input-wrap"
            data-empty={date === "" ? "true" : "false"}
          >
            <input
              ref={dateRef}
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (fieldError === "date") setFieldError(null);
              }}
              onClick={(e) => {
                const el = e.currentTarget as HTMLInputElement & {
                  showPicker?: () => void;
                };
                el.showPicker?.();
              }}
              onFocus={(e) => {
                const el = e.currentTarget as HTMLInputElement & {
                  showPicker?: () => void;
                };
                el.showPicker?.();
              }}
              disabled={busy}
              aria-invalid={fieldError === "date"}
            />
          </div>
        </label>
        <label className="generate-form-field" style={{ flex: "0 0 110px" }}>
          <span>Cantidad</span>
          <input
            ref={countRef}
            type="number"
            min={1}
            max={20}
            step={1}
            value={count}
            onKeyDown={(e) => {
              if (["-", "+", ".", "e", "E", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              let clean = e.target.value.replace(/[^0-9]/g, "");
              clean = clean.replace(/^0+/, "");
              if (clean !== "" && Number(clean) > 20) return;
              setCount(clean);
              if (clean === "") {
                setFieldError("count");
                setMsg("La cantidad debe ser un número entre 1 y 20.");
              } else if (fieldError === "count") {
                setFieldError(null);
                setMsg("");
              }
            }}
            onBlur={() => {
              if (count === "") {
                setCount("5");
                if (fieldError === "count") {
                  setFieldError(null);
                  setMsg("");
                }
              }
            }}
            disabled={busy}
            aria-invalid={fieldError === "count"}
          />
        </label>
      </div>
      <div className="toolbar">
        <button type="submit" disabled={busy}>
          {busy ? "Generando..." : "Generar calendario"}
        </button>
      </div>
      {msg && <p className="muted">{msg}</p>}
      {log.length > 0 && (
        <details className="generate-log-wrap" open={busy}>
          <summary>
            Log de Claude Code ({log.length}{" "}
            {log.length === 1 ? "línea" : "líneas"})
          </summary>
          <pre ref={logRef} className="generate-log">
            {log.map((entry, i) => (
              <div
                key={i}
                className={`generate-log-line generate-log-${entry.type}`}
              >
                {entry.message}
              </div>
            ))}
          </pre>
        </details>
      )}
    </form>
  );
}

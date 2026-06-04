// Renderer Markdown → HTML mínimo, suficiente para los lead magnets que genera
// la skill: H1/H2/H3, párrafos, listas, énfasis, tablas simples y separadores.
// No usamos `marked` ni `remark` para no agregar dependencias.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(s: string): string {
  let out = escapeHtml(s);
  // links [text](url)
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, url) =>
      `<a href="${url}" target="_blank" rel="noopener">${text}</a>`,
  );
  // bold **x** o __x__
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // italic *x* o _x_ (después de bold)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
  // inline code
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

function renderTable(lines: string[]): string {
  // formato: | a | b |\n| --- | --- |\n| 1 | 2 |
  const rows = lines.map((l) =>
    l
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim()),
  );
  const head = rows[0];
  const body = rows.slice(2);
  const headHtml = `<tr>${head.map((c) => `<th>${renderInline(c)}</th>`).join("")}</tr>`;
  const bodyHtml = body
    .map(
      (r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`,
    )
    .join("");
  return `<table><thead>${headHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
}

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }
    if (trimmed === "---") {
      out.push("<hr />");
      i++;
      continue;
    }
    const h = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${renderInline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    // tabla: línea con | y la siguiente con --- |
    if (
      trimmed.startsWith("|") &&
      lines[i + 1]?.trim().match(/^\|[-\s|]+\|$/)
    ) {
      const tbl: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tbl.push(lines[i]);
        i++;
      }
      out.push(renderTable(tbl));
      continue;
    }
    // listas - * o números
    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];
      while (
        i < lines.length &&
        (/^[-*]\s+/.test(lines[i].trim()) || /^\d+\.\s+/.test(lines[i].trim()))
      ) {
        const t = lines[i].trim().replace(/^([-*]|\d+\.)\s+/, "");
        items.push(`<li>${renderInline(t)}</li>`);
        i++;
      }
      out.push(
        `<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`,
      );
      continue;
    }
    // párrafo: junta líneas hasta blanco
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "") {
      const next = lines[i].trim();
      if (
        /^(#{1,6})\s+/.test(next) ||
        next === "---" ||
        next.startsWith("|") ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      )
        break;
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${renderInline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

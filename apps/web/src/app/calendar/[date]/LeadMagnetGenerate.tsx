interface Props {
  date: string;
}

export default function LeadMagnetGenerate({ date }: Props) {
  return (
    <div className="card">
      <p>
        Todavía no hay lead magnet asociado a este calendario. Genéralo desde
        Claude Code con:
      </p>
      <pre>/generate-leadmagnet {date}</pre>
      <p className="muted">
        Se crea un PDF descargable aquí en la web app, listo para revisar y
        aprobar. La generación corre en tu sesión de Claude Code — no usa la API
        de Anthropic, así que no eleva costos.
      </p>
    </div>
  );
}

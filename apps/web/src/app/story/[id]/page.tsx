import Link from "next/link";
import { notFound } from "next/navigation";
import { findPostById, loadRubro } from "@social-leads/core";
import PostPreview from "@/components/PostPreview";
import StoryActions from "./actions";

export const dynamic = "force-dynamic";

export default async function StoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const story = await findPostById(decoded);
  if (!story) notFound();

  const rubro = await loadRubro();

  return (
    <main>
      <Link href={`/calendar/${story.date}` as never} className="muted">
        ← {story.date}
      </Link>
      <h1>
        Historia #{String(story.slot).padStart(2, "0")} — {story.function}
      </h1>
      <p>
        <span className={`status ${story.status}`}>{story.status}</span>
        {story.sale && <span className="muted"> · venta</span>}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <div className="story-preview-lg">
            <PostPreview
              post={story}
              palette={rubro.brand.palette}
              size="lg"
            />
          </div>
          {!story.image_url && (
            <p className="muted" style={{ marginTop: 12, textAlign: "center" }}>
              Fondo provisional con paleta de marca. Aprueba los textos del
              calendario y luego genera las imágenes.
            </p>
          )}
        </div>

        <div>
          <div className="card">
            <h2>Texto principal</h2>
            <p>{story.text}</p>
            <p className="muted" style={{ marginTop: 4 }}>
              Función del slot: {story.function}
            </p>
          </div>

          {story.subtext && (
            <div className="card">
              <h2>Apoyo</h2>
              <p>{story.subtext}</p>
            </div>
          )}

          {story.cta && (
            <div className="card">
              <h2>CTA</h2>
              <p>{story.cta}</p>
            </div>
          )}

          <div className="card">
            <h2>Image prompt (background)</h2>
            <pre>{story.imagePrompt}</pre>
            {story.image_url && (
              <p className="muted" style={{ marginTop: 8 }}>
                Imagen generada — el texto se superpone en el preview.
              </p>
            )}
          </div>

          {story.notes && (
            <div className="card">
              <h2>Notes</h2>
              <p className="muted">{story.notes}</p>
            </div>
          )}

          <StoryActions
            id={story.id}
            status={story.status}
            hasImage={Boolean(story.image_url)}
            existingChangeRequest={story.change_request ?? ""}
            imageError={story.image_error ?? ""}
          />
        </div>
      </div>
    </main>
  );
}

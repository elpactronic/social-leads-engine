import type { Post, RubroConfig } from "@social-leads/core";
import StoryPreview from "./StoryPreview";

interface Props {
  post: Post;
  palette: RubroConfig["brand"]["palette"];
  size?: "sm" | "md" | "lg";
}

function FacebookPreview({ post, palette, size = "md" }: Props) {
  const accent = palette.accent ?? "#1E40AF";
  const primary = palette.primary ?? "#E63329";

  return (
    <div className={`fb-preview fb-preview-${size}`} aria-label={`Post Facebook ${post.slot}`}>

      {/* Header estilo página de Facebook */}
      <div className="fb-preview-header">
        <div className="fb-preview-avatar" style={{ background: primary }}>
          VH
        </div>
        <div className="fb-preview-page-info">
          <span className="fb-preview-page-name">Vision House</span>
          <span className="fb-preview-time">Ahora · 🌐</span>
        </div>
        <span className="fb-preview-slot" style={{ color: accent }}>
          #{String(post.slot).padStart(2, "0")}
        </span>
      </div>

      {/* Caption — texto independiente de la imagen */}
      <div className="fb-preview-caption">
        <p className="fb-preview-text">{post.text}</p>
        {post.subtext?.trim() && (
          <p className="fb-preview-subtext">{post.subtext}</p>
        )}
      </div>

      {/* Imagen como elemento propio, no de fondo */}
      <div className="fb-preview-img-wrap">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.text}
            className="fb-preview-img"
          />
        ) : (
          <div className="fb-preview-img-placeholder">
            <span className="fb-preview-img-placeholder-label">
              Imagen pendiente
            </span>
            <span className="fb-preview-img-placeholder-sub">
              {post.function} · {post.funnel_stage}
            </span>
          </div>
        )}
      </div>

      {/* CTA como botón de enlace de Facebook */}
      {post.cta?.trim() && (
        <div className="fb-preview-cta-bar">
          <span className="fb-preview-cta-btn" style={{ borderColor: accent, color: accent }}>
            {post.cta}
          </span>
        </div>
      )}

      {/* Barra de reacciones */}
      <div className="fb-preview-reactions">
        <span>👍 Me gusta</span>
        <span>💬 Comentar</span>
        <span>↗ Compartir</span>
      </div>
    </div>
  );
}

function TikTokPreview({ post, palette, size = "md" }: Props) {
  const accent = palette.accent ?? "#ff0050";
  const hasImage = Boolean(post.image_url);
  const background = palette.background ?? "#000";
  const fallback = `linear-gradient(180deg, ${background} 0%, #1a1a1a 100%)`;

  return (
    <div className={`tiktok-preview tiktok-preview-${size}`} aria-label={`Post TikTok ${post.slot}`}>
      <div
        className="tiktok-preview-canvas"
        style={{
          background: hasImage
            ? `url(${post.image_url}) center/cover no-repeat`
            : fallback,
        }}
      >
        {hasImage && <div className="story-preview-veil" />}

        <div className="tiktok-sidebar">
          <div className="tiktok-sidebar-item">❤️<span>0</span></div>
          <div className="tiktok-sidebar-item">💬<span>0</span></div>
          <div className="tiktok-sidebar-item">↗<span>0</span></div>
        </div>

        <div className="tiktok-bottom">
          <div className="tiktok-username">@VisionHouse_ok</div>
          {post.text && <p className="tiktok-text">{post.text}</p>}
          {post.cta?.trim() && (
            <span className="tiktok-cta" style={{ borderColor: accent, color: accent }}>
              {post.cta}
            </span>
          )}
          <div className="tiktok-meta">
            <span
              className="story-preview-chip"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
            >
              #{String(post.slot).padStart(2, "0")} · {post.function}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostPreview({ post, palette, size = "md" }: Props) {
  if (post.platform === "facebook") {
    return <FacebookPreview post={post} palette={palette} size={size} />;
  }
  if (post.platform === "tiktok") {
    return <TikTokPreview post={post} palette={palette} size={size} />;
  }
  return <StoryPreview story={post} palette={palette} size={size} />;
}

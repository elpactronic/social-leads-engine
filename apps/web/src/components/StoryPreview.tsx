import type { Story, AvatarConfig } from "@warm-stories/core";

interface Props {
  story: Story;
  palette: AvatarConfig["brand"]["palette"];
  size?: "sm" | "md" | "lg";
}

export default function StoryPreview({ story, palette, size = "md" }: Props) {
  const background = palette.background ?? "#000000";
  const surface = palette.surface ?? "#0A0A0F";
  const textColor = palette.primary ?? "#FFFFFF";
  const accent = palette.highlight ?? palette.accent ?? "#1E40AF";

  const hasImage = Boolean(story.image_url);
  const hasSubtext = Boolean(story.subtext?.trim());
  const hasCta = Boolean(story.cta?.trim());
  const fallback = `linear-gradient(135deg, ${background} 0%, ${surface} 100%)`;

  return (
    <div
      className={`story-preview story-preview-${size}`}
      aria-label={`Historia ${story.slot}`}
    >
      <div
        className="story-preview-canvas"
        style={{
          background: hasImage
            ? `url(${story.image_url}) center/cover no-repeat`
            : fallback,
        }}
      >
        {hasImage && <div className="story-preview-veil" />}

        <div className="story-preview-stack">
          <div className="story-preview-meta">
            <span
              className="story-preview-chip"
              style={{ borderColor: accent, color: textColor }}
            >
              #{String(story.slot).padStart(2, "0")} · {story.function}
            </span>
            {story.sale && (
              <span
                className="story-preview-chip"
                style={{
                  background: accent,
                  color: textColor,
                  borderColor: accent,
                }}
              >
                venta
              </span>
            )}
          </div>

          <div className="story-preview-body-block">
            <h2 className="story-preview-text" style={{ color: textColor }}>
              {story.text}
            </h2>
            {hasSubtext && (
              <p className="story-preview-subtext" style={{ color: textColor }}>
                {story.subtext}
              </p>
            )}
          </div>

          {hasCta ? (
            <div
              className="story-preview-cta"
              style={{ background: accent, color: textColor }}
            >
              {story.cta}
            </div>
          ) : (
            <span aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}

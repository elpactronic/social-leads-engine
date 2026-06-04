import { ImageResponse } from "next/og";
import type { Post, RubroConfig } from "@social-leads/core";

const WIDTH = 1080;
const HEIGHT = 1920;

// Polls/quizzes/questions se ponen como sticker nativo de Instagram, no en la
// imagen. Detectamos por prefijo de etiqueta o por mención explícita a "sticker".
const STICKER_CTA_PREFIXES = [
  "poll:",
  "encuesta:",
  "pregunta:",
  "question:",
  "quiz:",
  "slider:",
  "emoji slider:",
];

function isStickerCta(cta: string): boolean {
  const trimmed = cta.trim().toLowerCase();
  if (!trimmed) return true;
  if (STICKER_CTA_PREFIXES.some((p) => trimmed.startsWith(p))) return true;
  if (/\bsticker\b/.test(trimmed)) return true;
  return false;
}

export async function composeStoryImage(
  story: Post,
  palette: RubroConfig["brand"]["palette"],
): Promise<Uint8Array> {
  // No incluimos meta (#slot · función, venta). El CTA sí va en la imagen,
  // salvo cuando es un poll/pregunta/sticker que se monta nativo en IG.
  const background = palette.background ?? "#000000";
  const surface = palette.surface ?? "#0A0A0F";
  const textColor = palette.primary ?? "#FFFFFF";
  const accentColor = palette.highlight ?? palette.accent ?? "#1E40AF";
  const hasImage = Boolean(story.image_url);
  const hasSubtext = Boolean(story.subtext?.trim());
  const ctaText = story.cta?.trim() ?? "";
  const showCta = Boolean(ctaText) && !isStickerCta(ctaText);
  const fallback = `linear-gradient(135deg, ${background} 0%, ${surface} 100%)`;

  const element = (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        ...(hasImage
          ? {
              backgroundImage: `url(${story.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundImage: fallback }),
      }}
    >
      {/* veil */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* stack: copy del slide (texto + subtext) y, fuera del body-block,
          el CTA pill como en StoryPreview */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 28,
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            padding: 44,
            background: "rgba(0,0,0,0.55)",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2
            style={{
              color: textColor,
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -1.6,
              fontWeight: 800,
              margin: 0,
            }}
          >
            {story.text}
          </h2>
          {hasSubtext && (
            <p
              style={{
                color: textColor,
                fontSize: 38,
                lineHeight: 1.4,
                opacity: 0.92,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {story.subtext}
            </p>
          )}
        </div>
        {showCta && (
          <div
            style={{
              alignSelf: "flex-start",
              display: "flex",
              background: accentColor,
              color: textColor,
              fontSize: 38,
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: 0.3,
              padding: "24px 34px",
              borderRadius: 20,
              boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
              maxWidth: "92%",
            }}
          >
            {ctaText}
          </div>
        )}
      </div>
    </div>
  );

  const response = new ImageResponse(element, {
    width: WIDTH,
    height: HEIGHT,
  });
  const buf = await response.arrayBuffer();
  return new Uint8Array(buf);
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts, loadRubro } from "@social-leads/core";
import type { PostPlatform } from "@social-leads/core";
import CalendarActions from "./CalendarActions";
import StoryGridItem from "./StoryGridItem";

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

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ platform?: string }>;
}) {
  const { date } = await params;
  const { platform: platformParam } = await searchParams;

  const allPosts = await listPosts(date);
  if (allPosts.length === 0) notFound();

  const validPlatforms: PostPlatform[] = ["instagram", "facebook", "tiktok", "multi"];
  const activePlatform =
    platformParam && validPlatforms.includes(platformParam as PostPlatform)
      ? (platformParam as PostPlatform)
      : null;

  const posts = activePlatform
    ? allPosts.filter((p) => p.platform === activePlatform)
    : allPosts;

  // Plataformas presentes en este calendario
  const platformsInCalendar = validPlatforms.filter((pl) =>
    allPosts.some((p) => p.platform === pl),
  );

  const rubro = await loadRubro();
  const palette = rubro.brand.palette;

  const draftCount = posts.filter((s) => s.status === "draft").length;
  const pendingImage = posts.filter(
    (s) => (s.status === "approved" || s.status === "failed") && !s.image_url,
  ).length;
  const generating = posts.filter((s) => s.status === "generating-image").length;
  const ready = posts.filter((s) => s.status === "ready").length;
  const published = posts.filter((s) => s.status === "published").length;
  const failed = posts.filter((s) => s.status === "failed").length;
  const regenerable = posts.filter(
    (s) => s.status !== "published" && Boolean(s.image_url),
  ).length;
  const downloadable = posts.filter((s) => Boolean(s.image_url)).length;
  const needsRevision = posts.filter((s) => s.status === "needs-revision").length;

  return (
    <main>
      <Link href="/" className="muted">
        ← volver
      </Link>
      <h1>
        {activePlatform
          ? `${PLATFORM_ICON[activePlatform]} ${PLATFORM_LABEL[activePlatform]} · ${date}`
          : `Calendario ${date}`}
      </h1>

      {/* Tabs de plataforma */}
      {platformsInCalendar.length > 1 && (
        <div className="platform-tabs" style={{ marginBottom: 16 }}>
          <Link
            href={`/calendar/${date}` as never}
            className={`platform-tab${!activePlatform ? " platform-tab--active" : ""}`}
          >
            Todos
          </Link>
          {platformsInCalendar.map((pl) => (
            <Link
              key={pl}
              href={`/calendar/${date}?platform=${pl}` as never}
              className={`platform-tab${activePlatform === pl ? " platform-tab--active" : ""}`}
            >
              <span className="platform-tab-icon">{PLATFORM_ICON[pl]}</span>
              {PLATFORM_LABEL[pl]}
            </Link>
          ))}
        </div>
      )}

      <p className="muted" style={{ marginBottom: 16 }}>
        {posts.length} post{posts.length !== 1 ? "s" : ""} · {draftCount} draft
        · {ready} ready · {published} publicado{published !== 1 ? "s" : ""}
      </p>

      <CalendarActions
        date={date}
        draftCount={draftCount}
        pendingImage={pendingImage}
        generating={generating}
        ready={ready}
        failed={failed}
        regenerable={regenerable}
        downloadable={downloadable}
        needsRevision={needsRevision}
        failedStories={posts
          .filter((s) => s.status === "failed")
          .map((s) => ({
            id: s.id,
            slot: s.slot,
            model: s.image_model || "",
            error: s.image_error || "Sin detalle (regenera para capturar el error).",
          }))}
      />

      <div className="preview-grid">
        {posts.map((s) => (
          <StoryGridItem key={s.id} story={s} palette={palette} />
        ))}
      </div>
    </main>
  );
}

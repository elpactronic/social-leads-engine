import { NextResponse } from "next/server";
import {
  archivePublishedPost,
  findPostById,
  updatePost,
  publishStory,
  publishFacebookPost,
} from "@social-leads/core";
import type { Post } from "@social-leads/core";

function buildFacebookCaption(post: Post): string {
  const parts: string[] = [];
  if (post.text) parts.push(post.text);
  if (post.subtext) parts.push(post.subtext);
  if (post.cta) parts.push(`\n${post.cta}`);
  return parts.join("\n");
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const post = await findPostById(decoded);
  if (!post) {
    return NextResponse.json(
      { ok: false, error: "Post no encontrado" },
      { status: 404 },
    );
  }

  if (post.status !== "ready") {
    return NextResponse.json(
      {
        ok: false,
        error: `Solo se publica desde status ready (actual: ${post.status})`,
      },
      { status: 400 },
    );
  }
  if (!post.image_url) {
    return NextResponse.json(
      { ok: false, error: "Post sin image_url; genera imagen primero" },
      { status: 400 },
    );
  }

  try {
    let containerId = "";
    let mediaId = "";

    if (post.platform === "facebook") {
      const caption = buildFacebookCaption(post);
      const result = await publishFacebookPost({
        imageUrl: post.image_url,
        message: caption,
      });
      containerId = result.photoId;
      mediaId = result.postId;
    } else if (post.platform === "tiktok") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "TikTok publishing no está disponible aún (requiere aprobación del Content Posting API de TikTok).",
        },
        { status: 501 },
      );
    } else {
      // instagram o multi → Instagram por defecto
      const result = await publishStory({ imageUrl: post.image_url });
      containerId = result.containerId;
      mediaId = result.mediaId;
    }

    const updated = {
      ...post,
      status: "published" as const,
      container_id: containerId,
      published_at: new Date().toISOString(),
    };
    await updatePost(updated);
    await archivePublishedPost(updated);
    return NextResponse.json({ ok: true, mediaId });
  } catch (err) {
    await updatePost({ ...post, status: "failed" });
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error }, { status: 502 });
  }
}

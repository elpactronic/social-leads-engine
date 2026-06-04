import { NextResponse } from "next/server";
import { listPosts, updatePost } from "@social-leads/core";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  const stories = await listPosts(date);

  if (stories.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Calendario vacío o inexistente" },
      { status: 404 },
    );
  }

  const drafts = stories.filter((s) => s.status === "draft");
  if (drafts.length === 0) {
    return NextResponse.json({ ok: true, approved: 0 });
  }

  for (const s of drafts) {
    await updatePost({ ...s, status: "approved" });
  }

  return NextResponse.json({ ok: true, approved: drafts.length });
}

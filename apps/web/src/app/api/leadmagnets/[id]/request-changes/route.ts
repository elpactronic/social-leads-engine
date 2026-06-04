import { NextResponse } from "next/server";
import { findLeadMagnetById, updateLeadMagnet } from "@warm-stories/core";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const body = (await req.json().catch(() => ({}))) as { feedback?: string };
  const feedback = (body.feedback ?? "").trim();
  if (feedback.length < 5) {
    return NextResponse.json(
      { ok: false, error: "El feedback es muy corto." },
      { status: 400 },
    );
  }
  const lm = await findLeadMagnetById(decoded);
  if (!lm) {
    return NextResponse.json(
      { ok: false, error: "Lead magnet no encontrado" },
      { status: 404 },
    );
  }
  if (lm.status === "published") {
    return NextResponse.json(
      { ok: false, error: "No se pide cambio sobre uno ya publicado." },
      { status: 400 },
    );
  }
  await updateLeadMagnet({
    ...lm,
    status: "needs-revision",
    change_request: feedback,
  });
  return NextResponse.json({ ok: true });
}

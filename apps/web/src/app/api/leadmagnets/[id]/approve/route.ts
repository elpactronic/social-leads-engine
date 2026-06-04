import { NextResponse } from "next/server";
import { findLeadMagnetById, updateLeadMagnet } from "@warm-stories/core";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const lm = await findLeadMagnetById(decoded);
  if (!lm) {
    return NextResponse.json(
      { ok: false, error: "Lead magnet no encontrado" },
      { status: 404 },
    );
  }
  if (lm.status === "published") {
    return NextResponse.json(
      { ok: false, error: "Ya publicado" },
      { status: 400 },
    );
  }
  await updateLeadMagnet({
    ...lm,
    status: "approved",
    change_request: "",
  });
  return NextResponse.json({ ok: true });
}

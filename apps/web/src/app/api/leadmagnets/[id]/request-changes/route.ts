import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Lead magnets no implementados en esta versión." },
    { status: 501 },
  );
}

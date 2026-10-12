import { NextRequest, NextResponse } from "next/server";
import { saveFeedback } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const { id, vote } = await req.json();
  if (!id || !["up", "down"].includes(vote)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  await saveFeedback(String(id), vote);
  return NextResponse.json({ ok: true });
}

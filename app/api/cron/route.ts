import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/brief";
import { sendBrief, sendFailureAlert } from "@/lib/email";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Vercel Cron (Mon 01:00 UTC = 06:30 IST) sends `Authorization: Bearer $CRON_SECRET`.
// Manual trigger: GET /api/cron?secret=...
export async function GET(req: NextRequest) {
  const ok =
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}` ||
    req.nextUrl.searchParams.get("secret") === process.env.CRON_SECRET;
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const brief = await runPipeline();
    await sendBrief(brief);
    return NextResponse.json({ ok: true, id: brief.id, domains: brief.domains.length });
  } catch (e) {
    const msg = (e as Error).message;
    await sendFailureAlert(msg).catch(() => {});
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

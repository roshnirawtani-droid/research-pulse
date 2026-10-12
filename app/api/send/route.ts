import { NextRequest, NextResponse } from "next/server";
import { latestBrief } from "@/lib/brief";
import { sendBrief } from "@/lib/email";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Public "email me the latest edition" endpoint. Sends the stored brief only (no pipeline run),
// with a best-effort per-IP and per-address limit so it can't be used to spam.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs = 3_600_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return true;
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export async function POST(req: NextRequest) {
  const { email, website } = await req.json().catch(() => ({}));
  if (website) return NextResponse.json({ ok: true }); // honeypot
  const to = String(email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to) || to.length > 254)
    return NextResponse.json({ ok: false, error: "That doesn't look like an email address." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (limited(`ip:${ip}`, 5) || limited(`to:${to}`, 2))
    return NextResponse.json({ ok: false, error: "Too many requests. Try again in an hour." }, { status: 429 });

  const brief = await latestBrief();
  if (!brief) return NextResponse.json({ ok: false, error: "No edition has been published yet." }, { status: 404 });

  try {
    await sendBrief(brief, to);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    const sandbox = /testing|verify|domain|only send/i.test(msg);
    return NextResponse.json(
      { ok: false, error: sandbox ? "Resend's free test sender only delivers to the account owner's own address. Verify a domain in Resend to email anyone." : msg },
      { status: 502 },
    );
  }
}

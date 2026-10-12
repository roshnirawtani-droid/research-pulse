import { Resend } from "resend";
import type { Brief } from "./types";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function briefHtml(b: Brief): string {
  const sections = b.domains
    .map(
      (d) => `<h2>${esc(d.domain)}</h2>` +
        (d.top.length
          ? d.top
              .map(
                (p) => `<p><b><a href="${p.url}">${esc(p.title)}</a></b><br>
<small>${esc(p.type)} · significance ${p.score}/5 · Suggested: ${esc(p.suggestion)}</small><br>${esc(p.why)}</p>`,
              )
              .join("")
          : "<p><i>Nothing significant this week.</i></p>") +
        (d.also.length ? `<p><small><b>Also published:</b> ${d.also.map(esc).join(" · ")}</small></p>` : ""),
    )
    .join("");
  return `<div style="font-family:sans-serif;max-width:680px"><h1>Research Pulse · ${b.id}</h1>${sections}
<hr><small>AI-suggested from abstracts only. Verify the original paper before telling a client anything.</small></div>`;
}

export async function sendBrief(b: Brief, to?: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.BRIEF_FROM_EMAIL?.trim() || "Research Pulse <onboarding@resend.dev>",
    to: (to ?? process.env.BRIEF_TO_EMAIL!).trim(),
    subject: `Research Pulse · week of ${b.id}`,
    html: briefHtml(b),
  });
  if (error) throw new Error(error.message);
}

export async function sendFailureAlert(message: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.BRIEF_FROM_EMAIL?.trim() || "Research Pulse <onboarding@resend.dev>",
    to: process.env.BRIEF_TO_EMAIL!.trim(),
    subject: "Research Pulse run FAILED",
    html: `<p>The weekly run failed:</p><pre>${esc(message)}</pre>`,
  });
}

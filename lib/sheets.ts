import type { Brief, Domain } from "./types";

// Fallback so the app works before the Sheet is connected.
export const DEFAULT_DOMAINS: Domain[] = [
  { name: "LLM Agents", keywords: ["agent", "tool use", "agentic"], category: "cs.AI" },
  { name: "LLM Evaluation", keywords: ["benchmark", "evaluation", "LLM"], category: "cs.CL" },
  { name: "AI Safety & Security", keywords: ["safety", "jailbreak", "alignment"], category: "cs.CR" },
];

export const sheetsEnabled = () => !!(process.env.SHEET_WEBHOOK_URL && process.env.SHEET_TOKEN);

// The Sheet is reached through a small Google Apps Script web app bound to it (see apps-script/Code.gs).
async function call(body: Record<string, unknown>) {
  const res = await fetch(process.env.SHEET_WEBHOOK_URL!.trim(), {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ token: process.env.SHEET_TOKEN?.trim(), ...body }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.error) throw new Error(`Sheet: ${json.error}`);
  return json;
}

// Ranges like "domains!A2:C" mean: tab "domains", skip the header row.
async function read(range: string): Promise<string[][]> {
  const [sheet, cols] = range.split("!");
  const { rows } = await call({ action: "read", sheet });
  return /\d/.test(cols) ? rows.slice(1) : rows;
}

async function append(range: string, rows: string[][]) {
  await call({ action: "append", sheet: range.split("!")[0], rows });
}

// Tab `domains`: name | keywords (comma-separated) | arxiv_category
export async function getDomains(): Promise<Domain[]> {
  if (!sheetsEnabled()) return DEFAULT_DOMAINS;
  const rows = (await read("domains!A2:C")).filter((r) => r[0]);
  return rows.length
    ? rows.map((r) => ({ name: r[0], keywords: (r[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean), category: r[2] || "cs.AI" }))
    : DEFAULT_DOMAINS;
}

export async function addDomain(d: Domain) {
  if (!sheetsEnabled()) throw new Error("Google Sheet not connected");
  await append("domains!A:C", [[d.name, d.keywords.join(", "), d.category]]);
}

// Tab `papers_log`: date | domain | arxiv_id | title | score | type | url  (also the dedupe memory)
export async function getSeenIds(): Promise<Set<string>> {
  if (!sheetsEnabled()) return new Set();
  return new Set((await read("papers_log!C2:C")).map((r) => r[0]));
}

export async function logPapers(brief: Brief) {
  if (!sheetsEnabled()) return;
  const rows = brief.domains.flatMap((d) =>
    d.top.map((p) => [brief.generatedAt, d.domain, p.id, p.title, String(p.score), p.type, p.url]),
  );
  if (rows.length) await append("papers_log!A:G", rows);
}

// Tab `briefs`: id | generatedAt | json   (powers the archive page)
export async function saveBrief(b: Brief) {
  if (!sheetsEnabled()) return;
  await append("briefs!A:C", [[b.id, b.generatedAt, JSON.stringify(b)]]);
}

export async function listBriefs(): Promise<Brief[]> {
  if (!sheetsEnabled()) return [];
  return (await read("briefs!C2:C")).map((r) => JSON.parse(r[0]) as Brief).reverse();
}

// Tab `feedback`: date | arxiv_id | vote
export async function saveFeedback(arxivId: string, vote: "up" | "down") {
  if (!sheetsEnabled()) return;
  await append("feedback!A:C", [[new Date().toISOString(), arxivId, vote]]);
}

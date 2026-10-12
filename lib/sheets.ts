import { google } from "googleapis";
import type { Brief, Domain } from "./types";

// Fallback so the app works before the Sheet is connected.
export const DEFAULT_DOMAINS: Domain[] = [
  { name: "LLM Agents", keywords: ["agent", "tool use", "agentic"], category: "cs.AI" },
  { name: "LLM Evaluation", keywords: ["benchmark", "evaluation", "LLM"], category: "cs.CL" },
  { name: "AI Safety & Security", keywords: ["safety", "jailbreak", "alignment"], category: "cs.CR" },
];

export const sheetsEnabled = () => !!(process.env.SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

function client() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

const id = () => process.env.SHEET_ID!;

async function read(range: string): Promise<string[][]> {
  const r = await client().spreadsheets.values.get({ spreadsheetId: id(), range });
  return (r.data.values as string[][]) ?? [];
}

async function append(range: string, rows: string[][]) {
  await client().spreadsheets.values.append({
    spreadsheetId: id(),
    range,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
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

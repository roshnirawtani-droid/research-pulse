import { XMLParser } from "fast-xml-parser";
import type { Domain, Paper } from "./types";

const parser = new XMLParser({ ignoreAttributes: false });

// Live arXiv API: papers from the last `days` days matching the domain's keywords + category.
export async function fetchDomainPapers(domain: Domain, days = 7, max = 60): Promise<Paper[]> {
  const kw = domain.keywords.map((k) => `all:"${k}"`).join(" OR ");
  const q = `cat:${domain.category} AND (${kw})`;
  const url =
    `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}` +
    `&sortBy=submittedDate&sortOrder=descending&max_results=${max}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`arXiv ${res.status} for ${domain.name}`);
  const feed = parser.parse(await res.text()).feed;
  const entries = feed.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : [];
  const cutoff = Date.now() - days * 864e5;
  return entries
    .map((e: any): Paper => ({
      id: String(e.id).split("/abs/")[1] ?? String(e.id),
      title: String(e.title).replace(/\s+/g, " ").trim(),
      abstract: String(e.summary).replace(/\s+/g, " ").trim(),
      authors: (Array.isArray(e.author) ? e.author : [e.author]).map((a: any) => a.name),
      published: e.published,
      url: String(e.id),
    }))
    .filter((p: Paper) => new Date(p.published).getTime() >= cutoff);
}

// Pre-rank by keyword hits (code, not AI) and keep the top N.
export function preRank(papers: Paper[], keywords: string[], top = 15): Paper[] {
  const score = (p: Paper) => {
    const t = `${p.title} ${p.abstract}`.toLowerCase();
    return keywords.reduce((s, k) => s + (t.includes(k.toLowerCase()) ? 1 : 0), 0);
  };
  return [...papers].sort((a, b) => score(b) - score(a)).slice(0, top);
}

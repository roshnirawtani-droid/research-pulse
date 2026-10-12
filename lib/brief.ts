import { fetchDomainPapers, preRank } from "./arxiv";
import { scorePapers } from "./gemini";
import { getDomains, getSeenIds, listBriefs, logPapers, saveBrief } from "./sheets";
import type { Brief } from "./types";

export async function buildBrief(): Promise<Brief> {
  const [domains, seen] = await Promise.all([getDomains(), getSeenIds()]);
  const out: Brief["domains"] = [];

  for (const d of domains) {
    try {
      const fresh = (await fetchDomainPapers(d)).filter((p) => !seen.has(p.id));
      const ranked = preRank(fresh, d.keywords, 15);
      const scored = await scorePapers(d.name, ranked);
      const top = scored.filter((p) => p.score >= 3).slice(0, 5);
      const topIds = new Set(top.map((p) => p.id));
      out.push({ domain: d.name, top, also: ranked.filter((p) => !topIds.has(p.id)).map((p) => p.title) });
    } catch (e) {
      out.push({ domain: `${d.name} (failed: ${(e as Error).message})`, top: [], also: [] });
    }
    await new Promise((r) => setTimeout(r, 3000)); // arXiv asks for ~1 request / 3s
  }

  const now = new Date();
  return { id: now.toISOString().slice(0, 10), generatedAt: now.toISOString(), domains: out };
}

export async function runPipeline(): Promise<Brief> {
  const brief = await buildBrief();
  await Promise.all([saveBrief(brief), logPapers(brief)]);
  return brief;
}

export async function latestBrief(): Promise<Brief | null> {
  return (await listBriefs())[0] ?? null;
}

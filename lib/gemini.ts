import { GoogleGenAI, Type } from "@google/genai";
import type { Paper, ScoredPaper } from "./types";

const ai = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const PROMPT = `You triage new research papers for Kavita, a senior technology-advisory consultant.
Use ONLY the title and abstract given. Never invent results, numbers or claims.
For each paper return:
- score 1-5 (5 = highly significant). Significant means: a new benchmark, a surprising evaluation result, or a paper that shifts how a problem is framed. Incremental work scores 1-2.
- type: one of "New benchmark", "Surprising result", "Reframes problem", "Incremental", "Other".
- why: at most 2 sentences on why it matters, grounded in the abstract.
- suggestion: "Read", "Client-worthy" or "Skip".
Do NOT give advice to clients or say what to tell them.`;

export async function scorePapers(domain: string, papers: Paper[]): Promise<ScoredPaper[]> {
  if (!papers.length) return [];
  const input = papers.map((p, i) => `[${i}] ${p.title}\n${p.abstract}`).join("\n\n");
  const res = await ai().models.generateContent({
    model: "gemini-flash-latest",
    contents: `${PROMPT}\n\nDomain: ${domain}\n\n${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            index: { type: Type.INTEGER },
            score: { type: Type.INTEGER },
            type: { type: Type.STRING },
            why: { type: Type.STRING },
            suggestion: { type: Type.STRING },
          },
          required: ["index", "score", "type", "why", "suggestion"],
        },
      },
    },
  });
  const rows: any[] = JSON.parse(res.text ?? "[]");
  return rows
    .filter((r) => papers[r.index])
    .map((r) => ({ ...papers[r.index], score: r.score, type: r.type, why: r.why, suggestion: r.suggestion }))
    .sort((a, b) => b.score - a.score);
}

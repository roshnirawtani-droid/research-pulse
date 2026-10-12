export type Domain = { name: string; keywords: string[]; category: string };

export type Paper = {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: string;
  url: string;
};

export type ScoredPaper = Paper & {
  score: number;
  type: string;
  why: string;
  suggestion: "Read" | "Client-worthy" | "Skip";
};

export type DomainBrief = { domain: string; top: ScoredPaper[]; also: string[] };

export type Brief = { id: string; generatedAt: string; domains: DomainBrief[] };

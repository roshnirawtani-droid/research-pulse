import { Fragment } from "react";
import { unstable_cache } from "next/cache";
import BriefView from "./BriefView";
import { buildBrief, latestBrief } from "@/lib/brief";
import { sheetsEnabled } from "@/lib/sheets";
import type { Brief } from "@/lib/types";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Until the Sheet is connected, generate a live brief on demand and cache it for a day.
const liveOnce = unstable_cache(buildBrief, ["live-brief"], { revalidate: 86400 });

const TONES: [string, string][] = [
  ["#5b3d2b", "#2a1c14"], ["#7a5a3e", "#3b2a1d"], ["#9a8466", "#4f4332"], ["#3c4a43", "#1c2420"],
  ["#a38a6d", "#6a5238"], ["#2f2a26", "#14110f"], ["#8b6a4a", "#4a3624"],
];

function Ticker({ brief }: { brief: Brief }) {
  const ids = brief.domains.flatMap((d) => [...d.top.map((p) => p.id), ...d.also.map((_, i) => `${d.domain.slice(0, 3)}·${i + 1}`)]);
  const row = (offset: number) => {
    const items = Array.from({ length: 24 }, (_, i) => ids[(i + offset) % Math.max(ids.length, 1)] ?? "·");
    return [...items, ...items].map((id, i) => {
      const [c1, c2] = TONES[(i + offset) % TONES.length];
      return <span key={i} className="tile" style={{ ["--c1" as string]: c1, ["--c2" as string]: c2 }}>{id.slice(0, 7)}</span>;
    });
  };
  return (
    <div className="ticker" aria-hidden>
      <div className="track">{row(0)}</div>
      <div className="track rev">{row(5)}</div>
    </div>
  );
}

export default async function Home() {
  const brief = sheetsEnabled() ? await latestBrief() : await liveOnce();
  const words = ["Composed", "weekly", "research."];
  return (
    <>
      <section className="hero">
        <h1>
          {words.map((w, i) => (
            <Fragment key={w}>
              <span className="w"><span style={{ ["--i" as string]: i }}>{i === 1 ? <em>{w}</em> : w}</span></span>{" "}
            </Fragment>
          ))}
        </h1>
        <p className="hero-script">What mattered on arXiv, in ten minutes.</p>
        <p className="hero-sub">New papers, scored and explained from the abstract. You decide what to read.</p>
      </section>
      {brief && <Ticker brief={brief} />}
      {brief ? <BriefView brief={brief} /> : <p className="note">No brief yet. The first one arrives Monday 7 AM IST.</p>}
    </>
  );
}

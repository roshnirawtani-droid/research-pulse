import { Fragment } from "react";
import { unstable_cache } from "next/cache";
import BriefView from "./BriefView";
import { buildBrief, latestBrief } from "@/lib/brief";
import { sheetsEnabled } from "@/lib/sheets";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Until the Sheet is connected, generate a live brief on demand and cache it for a day.
const liveOnce = unstable_cache(buildBrief, ["live-brief"], { revalidate: 86400 });

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
      {brief ? <BriefView brief={brief} /> : <p className="note">No brief yet. The first one arrives Monday 7 AM IST.</p>}
    </>
  );
}

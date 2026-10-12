import { unstable_cache } from "next/cache";
import BriefView from "./BriefView";
import Dispatch from "./Dispatch";
import { buildBrief, latestBrief } from "@/lib/brief";
import { sheetsEnabled } from "@/lib/sheets";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Until the Sheet is connected, generate a live brief on demand and cache it for a day.
const liveOnce = unstable_cache(buildBrief, ["live-brief"], { revalidate: 86400 });

export default async function Home() {
  const brief = sheetsEnabled() ? await latestBrief() : await liveOnce();
  return (
    <>
      <section className="hero">
        <div className="blobs" aria-hidden>
          <span className="blob b1" />
          <span className="blob b2" />
        </div>
        <div className="hero-copy">
          <div className="hero-kicker">The front page</div>
          <h1 className="wipe">
            The week in <em>research,</em> set in type.
          </h1>
          <p className="hero-deck">
            New papers from arXiv, scored for significance and explained from the abstract. Ten minutes to read, and you decide what goes to a client.
          </p>
        </div>
        <Dispatch />
      </section>
      {brief ? <BriefView brief={brief} /> : <p className="note">No edition yet. The first one goes to press Monday 7 AM IST.</p>}
    </>
  );
}

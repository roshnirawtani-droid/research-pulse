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
  if (!brief) return <p>No brief yet. The first one arrives Monday 7 AM IST.</p>;
  return <BriefView brief={brief} />;
}

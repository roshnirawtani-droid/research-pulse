import { listBriefs } from "@/lib/sheets";
import BriefView from "../BriefView";

export const dynamic = "force-dynamic";

export default async function Archive() {
  const briefs = await listBriefs();
  if (!briefs.length) return <p>No archived briefs yet.</p>;
  return (
    <div>
      <h1>Archive</h1>
      {briefs.map((b) => (
        <details key={b.id}><summary>Week of {b.id}</summary><BriefView brief={b} /></details>
      ))}
    </div>
  );
}

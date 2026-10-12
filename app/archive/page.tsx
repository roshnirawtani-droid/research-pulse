import { listBriefs } from "@/lib/sheets";
import BriefView from "../BriefView";
import Reveal from "../Reveal";

export const dynamic = "force-dynamic";

export default async function Archive() {
  const briefs = await listBriefs();
  return (
    <div>
      <h1 className="page-title wipe">The <em>archive</em></h1>
      {!briefs.length && <p className="note">No back issues yet.</p>}
      {briefs.map((b) => (
        <Reveal as="details" key={b.id} className="arch">
          <summary>Edition of {b.id}<small>{b.domains.reduce((n, d) => n + d.top.length, 0)} stories</small></summary>
          <BriefView brief={b} />
        </Reveal>
      ))}
    </div>
  );
}

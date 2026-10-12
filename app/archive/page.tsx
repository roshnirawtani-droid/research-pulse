import { listBriefs } from "@/lib/sheets";
import BriefView from "../BriefView";
import Reveal from "../Reveal";

export const dynamic = "force-dynamic";

export default async function Archive() {
  const briefs = await listBriefs();
  if (!briefs.length) return <><h1 className="page-title">The <em>archive</em></h1><p className="note">No archived briefs yet.</p></>;
  return (
    <div>
      <h1 className="page-title">The <em>archive</em></h1>
      {briefs.map((b) => (
        <Reveal as="details" key={b.id} className="arch">
          <summary>Week of {b.id}<small>{b.domains.reduce((n, d) => n + d.top.length, 0)} papers</small></summary>
          <BriefView brief={b} />
        </Reveal>
      ))}
    </div>
  );
}

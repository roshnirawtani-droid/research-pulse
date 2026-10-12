import { revalidatePath } from "next/cache";
import { addDomain, getDomains, sheetsEnabled } from "@/lib/sheets";
import Reveal from "../Reveal";

export const dynamic = "force-dynamic";

async function add(form: FormData) {
  "use server";
  await addDomain({
    name: String(form.get("name")),
    keywords: String(form.get("keywords")).split(",").map((s) => s.trim()).filter(Boolean),
    category: String(form.get("category") || "cs.AI"),
  });
  revalidatePath("/settings");
}

export default async function Settings() {
  const domains = await getDomains();
  return (
    <div>
      <h1 className="page-title">Monitored <em>domains</em></h1>
      <div>
        {domains.map((d, i) => (
          <Reveal key={d.name} className="drow" delay={i * 70}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3>{d.name}</h3>
              <p>{d.keywords.join(" · ")}</p>
            </div>
            <span className="cat">{d.category}</span>
          </Reveal>
        ))}
      </div>
      {sheetsEnabled() ? (
        <form action={add} className="form">
          <div className="field"><input name="name" placeholder="Domain name" required /></div>
          <div className="field"><input name="keywords" placeholder="keywords, comma separated" required /></div>
          <div className="field"><input name="category" placeholder="arXiv category (e.g. cs.AI)" /></div>
          <button type="submit" className="btn" data-mag><span>Add domain</span></button>
        </form>
      ) : (
        <p className="note">Connect the Google Sheet to edit domains.</p>
      )}
    </div>
  );
}

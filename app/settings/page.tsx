import { revalidatePath } from "next/cache";
import { addDomain, getDomains, sheetsEnabled } from "@/lib/sheets";

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
      <h1>Monitored domains</h1>
      <ul>{domains.map((d) => <li key={d.name}><b>{d.name}</b> — {d.keywords.join(", ")} ({d.category})</li>)}</ul>
      {sheetsEnabled() ? (
        <form action={add} style={{ display: "grid", gap: 8, maxWidth: 400 }}>
          <input name="name" placeholder="Domain name" required />
          <input name="keywords" placeholder="keywords, comma separated" required />
          <input name="category" placeholder="arXiv category (e.g. cs.AI)" />
          <button type="submit">Add domain</button>
        </form>
      ) : (
        <p><i>Connect the Google Sheet to edit domains.</i></p>
      )}
    </div>
  );
}

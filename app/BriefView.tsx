"use client";
import { useState } from "react";
import type { Brief } from "@/lib/types";

export default function BriefView({ brief }: { brief: Brief }) {
  const [voted, setVoted] = useState<Record<string, string>>({});
  const vote = async (id: string, v: "up" | "down") => {
    setVoted((s) => ({ ...s, [id]: v }));
    await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, vote: v }) });
  };
  return (
    <div>
      <p style={{ color: "#666" }}>Last updated: {new Date(brief.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      {brief.domains.map((d) => (
        <section key={d.domain}>
          <h2>{d.domain}</h2>
          {d.top.length === 0 && <p><i>Nothing significant this week.</i></p>}
          {d.top.map((p) => (
            <div key={p.id} style={{ borderLeft: "3px solid #4a6cf7", paddingLeft: 12, margin: "16px 0" }}>
              <b><a href={p.url} target="_blank" rel="noreferrer">{p.title}</a></b>
              <div style={{ fontSize: 13, color: "#555" }}>{p.type} · significance {p.score}/5 · Suggested: {p.suggestion}</div>
              <div>{p.why}</div>
              <div>
                <button disabled={!!voted[p.id]} onClick={() => vote(p.id, "up")}>👍</button>{" "}
                <button disabled={!!voted[p.id]} onClick={() => vote(p.id, "down")}>👎</button>
              </div>
            </div>
          ))}
          {d.also.length > 0 && (
            <details><summary>Also published ({d.also.length})</summary><ul>{d.also.map((t) => <li key={t}>{t}</li>)}</ul></details>
          )}
        </section>
      ))}
      <p style={{ fontSize: 12, color: "#777" }}>AI-suggested from abstracts only. Verify the original paper before telling a client anything.</p>
    </div>
  );
}

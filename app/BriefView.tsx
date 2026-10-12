"use client";
import { useState } from "react";
import type { Brief } from "@/lib/types";
import Reveal from "./Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

export default function BriefView({ brief }: { brief: Brief }) {
  const [voted, setVoted] = useState<Record<string, string>>({});
  const vote = async (id: string, v: "up" | "down") => {
    setVoted((s) => ({ ...s, [id]: v }));
    await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, vote: v }) });
  };
  const total = brief.domains.reduce((n, d) => n + d.top.length, 0);

  return (
    <div>
      <Reveal className="issue">
        <span><i className="pulse" />Last updated <b>{new Date(brief.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</b></span>
        <span>{brief.domains.length} domains · <b>{total}</b> papers worth your time</span>
      </Reveal>
      <Reveal as="div" rule />

      {brief.domains.map((d, di) => (
        <section key={d.domain} className="domain">
          <Reveal className="domain-head">
            <div>
              <span className="domain-no">No. {di + 1}</span>
              <h2 className="domain-name">{d.domain}</h2>
            </div>
            <span className="domain-count">{d.top.length} selected · {d.also.length} also</span>
          </Reveal>
          <Reveal as="div" rule />

          {d.top.length === 0 && <Reveal className="empty">Nothing significant this week.</Reveal>}

          {d.top.map((p, i) => (
            <Reveal key={p.id} className="entry" delay={60}>
              <div className="entry-no">{pad(i + 1)}</div>
              <div>
                <h3 className="entry-title"><a href={p.url} target="_blank" rel="noreferrer">{p.title}</a></h3>
                <div className="meta">
                  <span className="chip">{p.type}</span>
                  <span className="meter" aria-label={`significance ${p.score} of 5`}>
                    {[0, 1, 2, 3, 4].map((k) => <i key={k} className={k < p.score ? "f" : ""} style={{ ["--k" as string]: k }} />)}
                  </span>
                  <span>Suggested · {p.suggestion}</span>
                </div>
                <p className="why">{p.why}</p>
                <div className="actions">
                  <button data-mag className={`vote ${voted[p.id] === "up" ? "on" : ""}`} disabled={!!voted[p.id]} onClick={() => vote(p.id, "up")} aria-label="Useful">👍</button>
                  <button data-mag className={`vote ${voted[p.id] === "down" ? "on" : ""}`} disabled={!!voted[p.id]} onClick={() => vote(p.id, "down")} aria-label="Not useful">👎</button>
                  <span className={`thanks ${voted[p.id] ? "show" : ""}`}>noted, thank you</span>
                </div>
              </div>
            </Reveal>
          ))}

          {d.also.length > 0 && (
            <Reveal as="details" className="also">
              <summary><span className="plus">+</span>Also published ({d.also.length})</summary>
              <ul>{d.also.map((t) => <li key={t}>{t}</li>)}</ul>
            </Reveal>
          )}
        </section>
      ))}

      <Reveal className="foot">
        <span className="script">Read, then verify.</span>
        AI-suggested from abstracts only. Verify the original paper before telling a client anything.
      </Reveal>
    </div>
  );
}

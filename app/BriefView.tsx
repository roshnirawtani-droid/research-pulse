"use client";
import { useState } from "react";
import type { Brief } from "@/lib/types";
import CountUp from "./CountUp";
import Reveal from "./Reveal";

const pad = (n: number) => String(n).padStart(2, "0");
const letter = (i: number) => String.fromCharCode(65 + i);

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
        <span>{brief.domains.length} sections · <CountUp to={total} /> stories worth your time</span>
      </Reveal>

      {brief.domains.map((d, di) => (
        <section key={d.domain} className="section">
          <Reveal className="section-bar">
            <span>Section {letter(di)}</span>
            <h2>{d.domain}</h2>
            <span>{d.top.length} filed · {d.also.length} in brief</span>
          </Reveal>

          {d.top.length === 0 && <Reveal className="empty">Nothing significant this week. A quiet news day.</Reveal>}

          <div className="articles">
            {d.top.map((p, i) => (
              <Reveal as="article" key={p.id} className={`art ${i === 0 ? "lead" : ""}`} delay={i * 60}>
                <div className="kicker"><span>№ {pad(i + 1)}</span><span className="tag">{p.type}</span></div>
                <h3 className="hed"><a href={p.url} target="_blank" rel="noreferrer">{p.title}</a></h3>
                <div className="byline">
                  By the AI desk
                  <span className="stars" aria-label={`significance ${p.score} of 5`}>
                    {[0, 1, 2, 3, 4].map((k) => <i key={k} className={k < p.score ? "f" : ""} style={{ ["--k" as string]: k }} />)}
                  </span>
                  <span className="sug">{p.suggestion}</span>
                </div>
                <p className="why">{p.why}</p>
                <div className="actions">
                  <button data-mag className={`vote ${voted[p.id] === "up" ? "on" : ""}`} disabled={!!voted[p.id]} onClick={() => vote(p.id, "up")} aria-label="Useful">▲ Useful</button>
                  <button data-mag className={`vote ${voted[p.id] === "down" ? "on" : ""}`} disabled={!!voted[p.id]} onClick={() => vote(p.id, "down")} aria-label="Not useful">▼ Skip</button>
                  <span className={`thanks ${voted[p.id] ? "show" : ""}`}>Noted, thank you.</span>
                </div>
              </Reveal>
            ))}
          </div>

          {d.also.length > 0 && (
            <Reveal as="details" className="also">
              <summary><span className="plus">+</span>In brief ({d.also.length} more titles)</summary>
              <ul>{d.also.map((t) => <li key={t}>{t}</li>)}</ul>
            </Reveal>
          )}
        </section>
      ))}

      <Reveal className="foot">
        <b>Read, then verify.</b> AI-suggested from abstracts only. Verify the original paper before telling a client anything.
      </Reveal>
    </div>
  );
}

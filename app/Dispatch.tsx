"use client";
import { useState, type FormEvent } from "react";

type State = { kind: "idle" | "sending" | "ok" | "err"; msg?: string };

// Hero email box: sends the latest edition to the address entered, to prove the email pipeline works.
export default function Dispatch() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const website = (new FormData(e.currentTarget).get("website") as string) || "";
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website }) });
      const j = await res.json();
      if (j.ok) setState({ kind: "ok", msg: `Dispatched to ${email}. Check your inbox (and spam).` });
      else setState({ kind: "err", msg: j.error || "Delivery failed." });
    } catch {
      setState({ kind: "err", msg: "Network error. Try again." });
    }
  };

  return (
    <form className="dispatch" onSubmit={submit} noValidate>
      <div className="dispatch-tag">Dispatch desk</div>
      <label htmlFor="dispatch-email" className="dispatch-title">Get this edition in your inbox.</label>
      <p className="dispatch-sub">Type an address. We send the latest brief straight away.</p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
      <div className="dispatch-row">
        <input id="dispatch-email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={state.kind === "sending"} />
        <button type="submit" className="btn" data-mag disabled={state.kind === "sending" || !email}>
          <span>{state.kind === "sending" ? "Setting type" : "Send"}{state.kind === "sending" && <i className="dots" />}</span>
        </button>
      </div>
      <div className={`dispatch-status ${state.kind}`} role="status" aria-live="polite">
        {state.kind === "ok" && <>✓ {state.msg}</>}
        {state.kind === "err" && <>✕ {state.msg}</>}
      </div>
    </form>
  );
}

"use client";
import { useEffect, useState, type MouseEvent } from "react";

type VT = { ready: Promise<void> };

// Light/dark switch. Uses the View Transitions API for a circular "ink spill" reveal when available.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as "light" | "dark") || "light");
  }, []);

  const flip = (e: MouseEvent<HTMLButtonElement>) => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("rp-theme", next); } catch {}
      setTheme(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) return apply();
    const x = e.clientX, y = e.clientY;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(apply).ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      ),
    );
  };

  return (
    <button className="toggle" onClick={flip} aria-label="Toggle dark mode" data-mag>
      <span className="toggle-ico">{theme === "dark" ? "☀" : "☾"}</span>
      {theme === "dark" ? "Day edition" : "Night edition"}
    </button>
  );
}

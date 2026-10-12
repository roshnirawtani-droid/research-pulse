"use client";
import { useEffect, useRef } from "react";

const DROPS = [
  { s: 30, k: 0.24 },
  { s: 24, k: 0.17 },
  { s: 19, k: 0.12 },
  { s: 14, k: 0.08 },
  { s: 10, k: 0.055 },
];

// Page-level motion: scroll progress + parallax var, fluid goo cursor blob, magnetic buttons.
export default function Chrome() {
  const drops = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--p", String(max > 0 ? window.scrollY / max : 0));
        if (!reduce) root.style.setProperty("--sy", String(window.scrollY));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const fine = window.matchMedia("(hover: hover)").matches && !reduce;
    const pos = DROPS.map(() => ({ x: -100, y: -100 }));
    let tx = -100, ty = -100, grow = 1, growT = 1, run = 0, seen = false;

    const loop = () => {
      grow += (growT - grow) * 0.14;
      DROPS.forEach((d, i) => {
        const p = pos[i];
        const k = d.k;
        p.x += ((i === 0 ? tx : pos[i - 1].x) - p.x) * (i === 0 ? k + 0.1 : k + 0.12);
        p.y += ((i === 0 ? ty : pos[i - 1].y) - p.y) * (i === 0 ? k + 0.1 : k + 0.12);
        const el = drops.current[i];
        if (el) el.style.transform = `translate3d(${p.x - d.s / 2}px, ${p.y - d.s / 2}px, 0) scale(${i === 0 ? grow : 1 + (grow - 1) * 0.5})`;
      });
      run = requestAnimationFrame(loop);
    };

    const move = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; pos.forEach((p) => { p.x = tx; p.y = ty; }); document.body.classList.add("goo-on"); }
      const t = e.target as HTMLElement;
      growT = t.closest("a, button, summary, input, label") ? 2.6 : 1;
      const m = t.closest<HTMLElement>("[data-mag]");
      document.querySelectorAll<HTMLElement>("[data-mag]").forEach((n) => { if (n !== m) n.style.transform = ""; });
      if (m && !m.hasAttribute("disabled")) {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.18}px, ${(e.clientY - (r.top + r.height / 2)) * 0.18}px)`;
      }
    };
    const leave = () => document.body.classList.remove("goo-on");
    const enter = () => seen && document.body.classList.add("goo-on");

    if (fine) {
      run = requestAnimationFrame(loop);
      window.addEventListener("mousemove", move);
      document.addEventListener("mouseleave", leave);
      document.addEventListener("mouseenter", enter);
    }
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(run);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <>
      <div className="progress" />
      <div className="goo" aria-hidden>
        {DROPS.map((d, i) => (
          <div key={i} className="drop" style={{ width: d.s, height: d.s }} ref={(el) => { drops.current[i] = el; }} />
        ))}
      </div>
    </>
  );
}

"use client";
import { useEffect, useRef } from "react";

// Page-level motion: scroll progress, parallax variable, custom cursor, magnetic buttons.
export default function Chrome() {
  const cursor = useRef<HTMLDivElement>(null);

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
    let x = 0, y = 0, cx = 0, cy = 0, run = 0;
    const el = cursor.current;
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (el) el.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      run = requestAnimationFrame(loop);
    };
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      el?.classList.add("on");
      const t = e.target as HTMLElement;
      el?.classList.toggle("big", !!t.closest("a, button, summary"));
      // magnetic pull
      const m = t.closest<HTMLElement>("[data-mag]");
      document.querySelectorAll<HTMLElement>("[data-mag]").forEach((n) => {
        if (n !== m) n.style.transform = "";
      });
      if (m && !m.hasAttribute("disabled")) {
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
        m.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    const leave = () => el?.classList.remove("on");
    if (fine) {
      run = requestAnimationFrame(loop);
      window.addEventListener("mousemove", move);
      document.addEventListener("mouseleave", leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(run);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      <div className="progress" />
      <div className="cursor" ref={cursor} />
    </>
  );
}

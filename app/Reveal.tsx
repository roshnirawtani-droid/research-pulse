"use client";
import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "section" | "article" | "h1" | "h2" | "p" | "li" | "span" | "details";

// Fades/rises its children into view the first time they scroll on screen.
export default function Reveal({
  as = "div",
  delay = 0,
  className = "",
  rule = false,
  children,
}: {
  as?: Tag;
  delay?: number;
  className?: string;
  rule?: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return createElement(
    as,
    { ref, className: `${rule ? "rule" : "rv"} ${className}`.trim(), style: { "--d": `${delay}ms` } as CSSProperties },
    children,
  );
}

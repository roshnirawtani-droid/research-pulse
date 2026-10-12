import type { ReactNode } from "react";
import { Newsreader, Playfair_Display, Space_Mono, UnifrakturMaguntia } from "next/font/google";
import Chrome from "./Chrome";
import ThemeToggle from "./ThemeToggle";
import "./globals.css";

export const metadata = { title: "Research Pulse", description: "Weekly AI-triaged research brief" };

const black = UnifrakturMaguntia({ weight: "400", subsets: ["latin"], variable: "--f-black" });
const head = Playfair_Display({ weight: ["700", "900"], style: ["normal", "italic"], subsets: ["latin"], variable: "--f-head" });
const body = Newsreader({ weight: ["400", "500"], style: ["normal", "italic"], subsets: ["latin"], variable: "--f-body" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--f-mono" });

// Runs before paint so the saved/system theme never flashes the wrong colours.
const themeInit = `try{var t=localStorage.getItem('rp-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}`;

function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  return Math.ceil(((+t - +new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7);
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  return (
    <html lang="en" suppressHydrationWarning className={`${black.variable} ${head.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <noscript>
          <style>{`.rv,.wipe{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}.rule{transform:none!important}`}</style>
        </noscript>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
              <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g" />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
            <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.006 0.01" numOctaves="2" seed="4" result="n">
                <animate attributeName="baseFrequency" dur="18s" values="0.006 0.01;0.012 0.006;0.006 0.01" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="70" />
            </filter>
          </defs>
        </svg>
        <div className="grain" />
        <Chrome />
        <div className="shell">
          <div className="dateline">
            <span>London · {date}</span>
            <span className="dl-mid">Vol. I · No. {isoWeek(now)}</span>
            <span className="dl-right">Price: ten minutes of your time <ThemeToggle /></span>
          </div>
          <header className="masthead">
            <div className="ear ear-l"><b>Weekly</b>Abstract-only.<br />Zero client advice.</div>
            <a href="/" className="nameplate" data-mag>Research Pulse</a>
            <div className="ear ear-r"><b>Verified</b>by a human<br />before it travels.</div>
          </header>
          <nav className="navbar">
            <a href="/">This week</a>
            <a href="/archive">Archive</a>
            <a href="/settings">Domains</a>
          </nav>
          {children}
          <footer className="colophon">
            <div>Set in Playfair, Newsreader &amp; Space Mono. Sourced from arXiv. Summarised by Gemini Flash.</div>
            <div>© Research Pulse. AI suggests; people decide.</div>
          </footer>
        </div>
      </body>
    </html>
  );
}

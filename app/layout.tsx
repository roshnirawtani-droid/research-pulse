import type { ReactNode } from "react";
import { Instrument_Sans, Instrument_Serif, Mrs_Saint_Delafield } from "next/font/google";
import Chrome from "./Chrome";
import "./globals.css";

export const metadata = { title: "Research Pulse", description: "Weekly AI-triaged research brief" };

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });
const script = Mrs_Saint_Delafield({ weight: "400", subsets: ["latin"], variable: "--font-script" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>
        <noscript>
          <style>{`.rv{opacity:1!important;transform:none!important;filter:none!important}.rule{transform:none!important}.hero h1 .w>span{transform:none!important}`}</style>
        </noscript>
        <div className="stripes" />
        <div className="grain" />
        <Chrome />
        <div className="shell">
          <header className="nav">
            <a href="/" className="brand" data-mag>
              <span className="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                  <path d="M12 2c3 3 3 7 0 10-3-3-3-7 0-10zM12 12c3 3 3 7 0 10-3-3-3-7 0-10zM2 12c3-3 7-3 10 0-3 3-7 3-10 0zM12 12c3-3 7-3 10 0-3 3-7 3-10 0z" />
                </svg>
                Research Pulse
              </span>
              <span className="brand-script">Scan × Signal × Judgement</span>
            </a>
            <nav className="nav-links">
              <a href="/">This week</a>
              <a href="/archive">Archive</a>
              <a href="/settings">Domains</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

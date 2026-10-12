import type { ReactNode } from "react";

export const metadata = { title: "Research Pulse", description: "Weekly AI-triaged research brief" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 760, margin: "0 auto", padding: 24, lineHeight: 1.5 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <a href="/"><b>Research Pulse</b></a>
          <a href="/archive">Archive</a>
          <a href="/settings">Domains</a>
        </nav>
        {children}
      </body>
    </html>
  );
}

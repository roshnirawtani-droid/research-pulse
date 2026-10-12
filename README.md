# Research Pulse

Weekly AI-triaged research brief. Every Monday 6:30 AM IST a Vercel Cron job pulls the last 7 days of arXiv papers per domain, dedupes and pre-ranks them in code, has Gemini Flash score significance and write a 2-line "why it matters" from the abstract, then emails the brief (Resend) and archives it on the site.

**Stack:** Next.js (Vercel) · Vercel Cron · arXiv API · Gemini Flash · Google Sheets (domains, paper log, briefs, feedback) · Resend

**Human boundary:** AI only suggests Read / Client-worthy / Skip. Kavita verifies the original paper before telling a client anything.

## Env vars
See `.env.example`. Manual run: `GET /api/cron?secret=$CRON_SECRET`.

## Google Sheet tabs
`domains` (name | keywords | arxiv_category) · `papers_log` · `briefs` · `feedback`

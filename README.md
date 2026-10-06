# Dealer AI Readiness Score

A public-facing prototype that scores a car dealership's **digital buying experience** — lead capture, inventory presentation, conversion, and conversational / AI readiness — then maps the biggest gaps to Spyne products (Vini AI and Studio AI).

This is a GTM / portfolio MVP. It is **not** a production SaaS, **not** an SEO audit, and **not** affiliated with Spyne.

## Why it exists

Dealership websites often lose shoppers before a salesperson ever talks to them: weak after-hours capture, buried test-drive CTAs, inconsistent inventory imagery.

This tool is meant to be demoed in about 30 seconds:

1. Enter a rooftop URL (or run the sample dealership)
2. See a 0–100 Dealer AI Readiness Score
3. Review the top revenue leaks, quick wins, and a potential Spyne fit

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Cheerio for lightweight HTML parsing
- OpenAI for qualitative opportunity write-ups
- No database, auth, billing, queues, or background workers

## Architecture

```
User URL
  → POST /api/analyze
  → scrape homepage + up to 4 relevant internal pages (lib/scraper.ts)
  → deterministic signals (lib/signals.ts)
  → transparent scoring (lib/scoring.ts)
  → LLM opportunities, with deterministic fallback (lib/ai.ts)
  → Spyne product mapping (lib/spyneMapping.ts)
  → results UI
```

If scraping fails, the UI stays intact and offers **Try the sample dealership**. If the OpenAI key is missing or the model call fails, opportunities are generated from detected signals so the demo still works.

## How to run locally

```bash
npm install
cp .env.example .env.local
# add OPENAI_API_KEY if you want live LLM copy; sample mode works without it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Analyze a live URL, or
- Click **Try a sample dealership** for a guaranteed demo (score 63/100)

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | No (fallback analysis is used) | OpenAI API key |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |

Never commit real keys. Copy `.env.example` to `.env.local`.

## How scoring works

Overall score is 0–100, summed from four categories:

| Category | Max |
| --- | --- |
| Lead Capture | 30 |
| Inventory Experience | 25 |
| Conversion Experience | 25 |
| AI Readiness | 20 |

Each check is `detected` (full points), `likely` (70%), `could_not_verify` (40%), or `not_detected` (0). The model does **not** calculate the score.

Labels:

- 0–40 Needs Attention
- 41–60 Developing
- 61–80 Strong
- 81–100 Advanced

## How AI analysis works

The LLM receives a compact extract of crawled pages plus the deterministic signals. It returns three opportunities (evidence, severity, why it matters, recommended action, optional Spyne product). It is instructed not to invent revenue numbers or claim something is definitely missing when the crawler simply did not find it.

## Limitations

- Crawls a handful of public pages only — not a full site audit
- Many dealer platforms block bots; sample mode exists for that
- Chat widgets loaded only via JavaScript may be missed
- Scores are directional, not a formal operational assessment
- Spyne mapping is a GTM hypothesis, not a pricing or ROI calculator

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in Project Settings → Environment Variables
4. Deploy

Vercel-ready: Next.js App Router, no extra server, `maxDuration` set to 60s on `/api/analyze`.

import { generateOpportunities } from "./ai";
import { calculateScores } from "./scoring";
import { scrapeDealership, summarizeScrapeForAi } from "./scraper";
import { detectSignals } from "./signals";
import { deriveQuickWins, mapSpyneProducts } from "./spyneMapping";
import type { AnalysisResult } from "./types";
import { normalizeUrl } from "./url";

export class ScrapeFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScrapeFailedError";
  }
}

export async function analyzeDealership(rawUrl: string): Promise<AnalysisResult> {
  const url = normalizeUrl(rawUrl);
  const scrape = await scrapeDealership(url);

  if (!scrape.ok || scrape.pages.length === 0) {
    throw new ScrapeFailedError(
      scrape.error || "Couldn't fully analyze this website. Try the sample dealership.",
    );
  }

  const signals = detectSignals(scrape.pages);
  const scores = calculateScores(signals);
  const opportunities = await generateOpportunities({
    url: scrape.homepageUrl,
    websiteSummary: summarizeScrapeForAi(scrape.pages),
    signals,
    scores,
  });

  return {
    url: scrape.homepageUrl,
    analyzedAt: new Date().toISOString(),
    mode: "live",
    scores,
    signals,
    opportunities,
    quickWins: deriveQuickWins(opportunities, signals),
    spyne: mapSpyneProducts(signals, opportunities),
    pagesAnalyzed: scrape.pages.map((page) => ({
      url: page.url,
      title: page.title || page.url,
    })),
  };
}

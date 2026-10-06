import * as cheerio from "cheerio/slim";
import type { ScrapedPage, ScrapeResult } from "./types";
import { isInternalLink, toAbsoluteUrl } from "./url";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const PRIORITY_PATH_WORDS = [
  "inventory",
  "vehicles",
  "used-cars",
  "usedcars",
  "new-cars",
  "newcars",
  "cars",
  "specials",
  "finance",
  "financing",
  "contact",
  "schedule",
  "test-drive",
  "testdrive",
  "service",
];

const PHONE_REGEX =
  /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g;
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function fetchHtml(url: string, timeoutMs: number): Promise<{
  html: string;
  finalUrl: string;
  status: number;
}> {
  const response = await fetch(url, {
    signal: timeoutSignal(timeoutMs),
    redirect: "follow",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const html = await response.text();
  return {
    html,
    finalUrl: response.url || url,
    status: response.status,
  };
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_REGEX) ?? [];
  return unique(matches.map((m) => m.trim()).slice(0, 8));
}

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) ?? [];
  return unique(matches.map((m) => m.toLowerCase()).slice(0, 8));
}

function parsePage(url: string, html: string): ScrapedPage {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe").remove();

  const title = $("title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const headings = unique(
    $("h1, h2, h3")
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get()
      .filter((t) => t.length > 1 && t.length < 160)
      .slice(0, 40),
  );

  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16000);

  const links = unique(
    $("a[href]")
      .map((_, el) => {
        const href = $(el).attr("href") || "";
        return toAbsoluteUrl(href, url);
      })
      .get()
      .filter((href): href is string => Boolean(href))
      .slice(0, 120),
  );

  const buttons = unique(
    $("a, button, input[type='submit']")
      .map((_, el) => {
        const text =
          $(el).text().trim() ||
          $(el).attr("value") ||
          $(el).attr("aria-label") ||
          "";
        return text.replace(/\s+/g, " ").trim();
      })
      .get()
      .filter((t) => t.length > 1 && t.length < 80)
      .slice(0, 60),
  );

  const formCount = $("form").length;

  const images = $("img")
    .map((_, el) => ({
      src: toAbsoluteUrl($(el).attr("src") || "", url) || $(el).attr("src") || "",
      alt: ($(el).attr("alt") || "").trim(),
    }))
    .get()
    .filter((img) => img.src)
    .slice(0, 80);

  const combined = `${title} ${metaDescription} ${bodyText} ${buttons.join(" ")}`;

  return {
    url,
    title,
    metaDescription,
    headings,
    bodyText,
    links,
    buttons,
    formCount,
    phones: extractPhones(combined),
    emails: extractEmails(combined),
    images,
    hasViewportMeta: $('meta[name="viewport"]').length > 0,
    isHttps: url.startsWith("https://"),
    htmlLower: html.toLowerCase().slice(0, 200000),
  };
}

function linkScore(href: string, origin: string): number {
  if (!isInternalLink(href, origin)) return -1;
  const path = href.toLowerCase();
  let score = 0;
  for (const word of PRIORITY_PATH_WORDS) {
    if (path.includes(word)) score += 3;
  }
  if (path === new URL(origin).pathname) score -= 5;
  return score;
}

function pickInternalPages(homepage: ScrapedPage, origin: string, limit: number): string[] {
  const ranked = homepage.links
    .map((href) => ({ href, score: linkScore(href, origin) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>([homepage.url]);
  const selected: string[] = [];

  for (const item of ranked) {
    const clean = item.href.split("?")[0];
    if (seen.has(clean) || seen.has(item.href)) continue;
    seen.add(clean);
    selected.push(item.href);
    if (selected.length >= limit) break;
  }

  return selected;
}

export async function scrapeDealership(inputUrl: string): Promise<ScrapeResult> {
  try {
    const homepageFetch = await fetchHtml(inputUrl, 10000);

    if (homepageFetch.status === 403 || homepageFetch.status === 401) {
      return {
        ok: false,
        homepageUrl: inputUrl,
        pages: [],
        blocked: true,
        error: "This website blocked the request. Many dealer sites restrict automated access.",
      };
    }

    if (homepageFetch.status >= 400) {
      return {
        ok: false,
        homepageUrl: inputUrl,
        pages: [],
        error: `Could not load the homepage (HTTP ${homepageFetch.status}).`,
      };
    }

    const homepage = parsePage(homepageFetch.finalUrl, homepageFetch.html);
    const extras = pickInternalPages(homepage, homepageFetch.finalUrl, 4);

    const extraPages = await Promise.all(
      extras.map(async (url) => {
        try {
          const fetched = await fetchHtml(url, 7000);
          if (fetched.status >= 400) return null;
          return parsePage(fetched.finalUrl, fetched.html);
        } catch {
          return null;
        }
      }),
    );

    const pages = [homepage, ...extraPages.filter((p): p is ScrapedPage => Boolean(p))];

    return {
      ok: true,
      homepageUrl: homepageFetch.finalUrl,
      pages,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "The website took too long to respond."
        : "Could not fetch this website. It may be blocked, down, or using a non-standard setup.";

    return {
      ok: false,
      homepageUrl: inputUrl,
      pages: [],
      error: message,
    };
  }
}

export function summarizeScrapeForAi(pages: ScrapedPage[]): string {
  return pages
    .map((page) => {
      return [
        `URL: ${page.url}`,
        `Title: ${page.title}`,
        `Meta: ${page.metaDescription}`,
        `Headings: ${page.headings.slice(0, 12).join(" | ")}`,
        `Buttons/CTAs: ${page.buttons.slice(0, 20).join(" | ")}`,
        `Forms: ${page.formCount}`,
        `Phones: ${page.phones.join(", ") || "none found"}`,
        `Emails: ${page.emails.join(", ") || "none found"}`,
        `Images: ${page.images.length} (alts: ${page.images
          .slice(0, 12)
          .map((img) => img.alt || "[empty]")
          .join(" / ")})`,
        `Text excerpt: ${page.bodyText.slice(0, 1800)}`,
      ].join("\n");
    })
    .join("\n\n---\n\n")
    .slice(0, 14000);
}

import { NextResponse } from "next/server";
import { analyzeDealership, ScrapeFailedError } from "@/lib/analyze";
import { getSampleAnalysis } from "@/lib/sample";
import type { AnalyzeApiResponse } from "@/lib/types";
import { normalizeUrl } from "@/lib/url";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      sample?: boolean;
    };

    if (body.sample) {
      return NextResponse.json({
        ok: true,
        result: getSampleAnalysis(),
      } satisfies AnalyzeApiResponse);
    }

    if (!body.url) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enter a dealership website URL to analyze.",
          suggestSample: true,
        } satisfies AnalyzeApiResponse,
        { status: 400 },
      );
    }

    try {
      normalizeUrl(body.url);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Invalid URL.",
          suggestSample: true,
        } satisfies AnalyzeApiResponse,
        { status: 400 },
      );
    }

    const analyzed = await analyzeDealership(body.url);
    return NextResponse.json({
      ok: true,
      result: analyzed,
    } satisfies AnalyzeApiResponse);
  } catch (error) {
    const message =
      error instanceof ScrapeFailedError
        ? `${error.message} Try the sample dealership.`
        : "Something went wrong while analyzing. Try the sample dealership.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
        suggestSample: true,
      } satisfies AnalyzeApiResponse,
      { status: error instanceof ScrapeFailedError ? 422 : 500 },
    );
  }
}

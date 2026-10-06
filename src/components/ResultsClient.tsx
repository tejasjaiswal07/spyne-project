"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { ResultsView } from "@/components/ResultsView";
import type { AnalysisResult, AnalyzeApiResponse } from "@/lib/types";

export function ResultsClient() {
  const params = useSearchParams();
  const router = useRouter();
  const url = params.get("url") || "";
  const sample = params.get("sample") === "1";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url && !sample) {
      setLoading(false);
      setError("Enter a dealership website to analyze.");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sample ? { sample: true } : { url }),
        });
        const data = (await response.json()) as AnalyzeApiResponse;
        if (cancelled) return;
        if (!data.ok) {
          setError(data.error);
          setResult(null);
        } else {
          setResult(data.result);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't fully analyze this website. Try the sample dealer.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [url, sample]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <p className="text-2xl font-semibold">Scoring this site…</p>
        <p className="mt-2 text-sm text-muted">
          {sample ? "Loading sample." : url.replace(/^https?:\/\//, "")}
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20">
        <h1 className="text-2xl font-semibold">Couldn’t finish</h1>
        <p className="mt-3 text-sm text-muted">{error || "Try the sample dealer."}</p>
        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={() => router.push("/results?sample=1")}
            className="h-12 rounded-lg bg-accent px-5 text-sm font-medium text-white"
          >
            Run sample dealer
          </button>
          <AnalyzeForm compact />
        </div>
      </div>
    );
  }

  return <ResultsView result={result} />;
}

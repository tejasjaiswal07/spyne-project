"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { ResultsView } from "@/components/ResultsView";
import type { AnalysisResult, AnalyzeApiResponse } from "@/lib/types";

const STEPS = [
  "Fetching public website pages",
  "Reading lead capture and inventory signals",
  "Scoring the digital buying journey",
  "Identifying the biggest revenue leaks",
];

export function ResultsClient() {
  const params = useSearchParams();
  const router = useRouter();
  const url = params.get("url") || "";
  const sample = params.get("sample") === "1";

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url && !sample) {
      setLoading(false);
      setError("Enter a dealership website to analyze.");
      return;
    }

    let cancelled = false;
    const timer = setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 1600);

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
          setError("Couldn't fully analyze this website. Try the sample dealership.");
        }
      } finally {
        if (!cancelled) setLoading(false);
        clearInterval(timer);
      }
    }

    run();
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [url, sample]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-20">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Analyzing
        </p>
        <h1 className="mt-3 font-serif text-4xl">
          Reading the digital buying experience
        </h1>
        <p className="mt-4 text-sm text-muted">
          {sample
            ? "Loading the sample dealership assessment."
            : `Reviewing publicly visible pages for ${url.replace(/^https?:\/\//, "")}.`}
        </p>
        <ul className="mt-10 space-y-3">
          {STEPS.map((item, index) => (
            <li
              key={item}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                index === step
                  ? "border-accent bg-white text-foreground"
                  : "border-line text-muted"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Couldn’t finish the analysis
        </p>
        <h1 className="mt-3 font-serif text-4xl">
          Couldn&apos;t fully analyze this website
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          {error || "Try the sample dealership."}
        </p>
        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={() => router.push("/results?sample=1")}
            className="h-12 rounded-lg bg-accent px-5 text-sm font-medium text-white"
          >
            Try the sample dealership
          </button>
          <AnalyzeForm compact />
        </div>
      </div>
    );
  }

  return <ResultsView result={result} />;
}

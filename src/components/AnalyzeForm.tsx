"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AnalyzeForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value) {
      setError("Enter a dealership website URL.");
      return;
    }
    setError("");
    router.push(`/results?url=${encodeURIComponent(value)}`);
  }

  return (
    <div className={compact ? "" : "w-full"}>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="dealer-url">
          Dealership website
        </label>
        <input
          id="dealer-url"
          type="url"
          inputMode="url"
          placeholder="https://yourdealership.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-12 flex-1 rounded-lg border border-line bg-white px-4 text-[15px] outline-none transition focus:border-accent"
        />
        <button
          type="submit"
          className="h-12 rounded-lg bg-accent px-5 text-sm font-medium text-white transition hover:bg-[#0f2c33]"
        >
          Analyze Dealership →
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <Link
          href="/results?sample=1"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Try a sample dealership
        </Link>
        <span className="hidden h-3 w-px bg-line sm:block" />
        <p>No login required. Takes about 15 seconds.</p>
      </div>
    </div>
  );
}

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
          className="h-10 flex-1 border border-line bg-white px-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="h-10 bg-accent px-4 text-sm text-white"
        >
          Analyze
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <p className="mt-4 text-sm">
        <Link
          href="/results?sample=1"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Run sample dealer
        </Link>
      </p>
    </div>
  );
}

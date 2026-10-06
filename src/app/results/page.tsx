import { Suspense } from "react";
import { Footer, Header } from "@/components/SiteChrome";
import { ResultsClient } from "@/components/ResultsClient";

function ResultsFallback() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <p className="text-2xl font-semibold">Scoring this site…</p>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<ResultsFallback />}>
          <ResultsClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

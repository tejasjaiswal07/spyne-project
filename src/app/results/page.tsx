import { Suspense } from "react";
import { Footer, Header } from "@/components/SiteChrome";
import { ResultsClient } from "@/components/ResultsClient";

function ResultsFallback() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-20">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Analyzing
      </p>
      <h1 className="mt-3 font-serif text-4xl">Preparing your assessment</h1>
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

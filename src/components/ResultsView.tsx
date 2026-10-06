import type { AnalysisResult, DetectionStatus } from "@/lib/types";

function statusLabel(status: DetectionStatus): string {
  switch (status) {
    case "detected":
      return "Yes";
    case "not_detected":
      return "No";
    case "likely":
      return "Likely";
    case "could_not_verify":
      return "Unclear";
  }
}

export function ResultsView({ result }: { result: AnalysisResult }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      {result.mode === "sample" || result.scrapeWarning ? (
        <p className="mb-6 text-sm text-muted">
          {result.scrapeWarning || "Sample dealer (demo)."}
        </p>
      ) : null}

      <p className="text-sm text-muted">{result.url.replace(/^https?:\/\//, "")}</p>
      <p className="mt-2 text-4xl font-medium">
        {result.scores.overall}
        <span className="text-lg font-normal text-muted"> / 100</span>
      </p>
      <p className="mt-1 text-sm">{result.scores.label}</p>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
        {result.scores.categories.map((cat) => (
          <div key={cat.key}>
            <p className="text-muted">{cat.label}</p>
            <p>
              {cat.score}/{cat.max}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Leaks</h2>
        <div className="mt-3 divide-y divide-line border-y border-line">
          {result.opportunities.map((opp) => (
            <article key={opp.title} className="py-4">
              <p className="text-sm">
                {opp.severity} · {opp.category}
              </p>
              <p className="mt-1 font-medium">{opp.title}</p>
              <p className="mt-1 text-sm text-muted">{opp.evidence}</p>
              <p className="mt-1 text-sm">Fix: {opp.recommendedAction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Do this next</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
          {result.quickWins.map((win) => (
            <li key={win}>{win}</li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium">What we saw</h2>
        <div className="mt-3 space-y-4">
          {[
            { label: "Lead capture", items: result.signals.leadCapture },
            { label: "Inventory", items: result.signals.inventory },
            { label: "Conversion", items: result.signals.conversion },
            { label: "AI / chat", items: result.signals.aiReadiness },
          ].map((group) => (
            <div key={group.label}>
              <p className="text-sm font-medium">{group.label}</p>
              <ul className="mt-1 text-sm">
                {group.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-0.5">
                    <span>{item.label}</span>
                    <span className="text-muted">{statusLabel(item.status)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

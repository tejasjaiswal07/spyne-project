import type { AnalysisResult, DetectionStatus, Opportunity } from "@/lib/types";

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

function severityClass(severity: Opportunity["severity"]): string {
  if (severity === "High") return "bg-[#f3e8e4] text-[#7a2e22]";
  if (severity === "Low") return "bg-[#eef0ed] text-[#3d443c]";
  return "bg-[#f4eee2] text-[#7a5b1e]";
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.max(4, Math.min(100, (score / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ece9e1]">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ResultsView({ result }: { result: AnalysisResult }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      {result.mode === "sample" || result.scrapeWarning ? (
        <p className="mb-6 text-sm text-muted">
          {result.scrapeWarning || "Sample dealer (demo)."}
        </p>
      ) : null}

      <p className="text-7xl font-semibold leading-none tracking-tight">
        {result.scores.overall}
        <span className="ml-2 text-2xl font-normal text-muted">/ 100</span>
      </p>
      <p className="mt-3 text-lg">{result.scores.label}</p>
      <p className="mt-1 text-sm text-muted">
        {result.url.replace(/^https?:\/\//, "")}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {result.scores.categories.map((cat) => (
          <div key={cat.key} className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs text-muted">{cat.label}</p>
            <p className="mt-1 text-lg font-medium">
              {cat.score}
              <span className="text-sm text-muted">/{cat.max}</span>
            </p>
            <div className="mt-3">
              <ScoreBar score={cat.score} max={cat.max} />
            </div>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Leaks</h2>
        <div className="mt-4 grid gap-3">
          {result.opportunities.map((opp) => (
            <article
              key={opp.title}
              className="rounded-xl border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${severityClass(opp.severity)}`}
                >
                  {opp.severity}
                </span>
                <span className="text-xs text-muted">{opp.category}</span>
              </div>
              <h3 className="mt-2 text-lg font-medium">{opp.title}</h3>
              <p className="mt-2 text-sm text-muted">{opp.evidence}</p>
              <p className="mt-3 text-sm">Fix: {opp.recommendedAction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Do this next</h2>
        <ol className="mt-4 grid gap-2">
          {result.quickWins.map((win, index) => (
            <li
              key={win}
              className="rounded-xl border border-line bg-white px-4 py-3 text-sm"
            >
              {index + 1}. {win}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">What we saw</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { label: "Lead capture", items: result.signals.leadCapture },
            { label: "Inventory", items: result.signals.inventory },
            { label: "Conversion", items: result.signals.conversion },
            { label: "AI / chat", items: result.signals.aiReadiness },
          ].map((group) => (
            <div key={group.label} className="rounded-xl border border-line bg-white p-4">
              <p className="text-sm font-medium">{group.label}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>{item.label}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {statusLabel(item.status)}
                    </span>
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

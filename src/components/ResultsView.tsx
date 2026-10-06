import type { AnalysisResult, DetectionStatus, Opportunity } from "@/lib/types";

function statusLabel(status: DetectionStatus): string {
  switch (status) {
    case "detected":
      return "Detected";
    case "not_detected":
      return "Not detected";
    case "likely":
      return "Likely";
    case "could_not_verify":
      return "Could not verify";
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
        className="h-full rounded-full bg-accent transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ResultsView({ result }: { result: AnalysisResult }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      {result.mode === "sample" || result.scrapeWarning ? (
        <div className="mb-8 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
          {result.scrapeWarning || "Showing a sample dealership assessment for demo purposes."}
        </div>
      ) : null}

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Dealer AI Readiness
      </p>
      <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-serif text-7xl leading-none tracking-tight sm:text-8xl">
            {result.scores.overall}
            <span className="ml-2 text-3xl text-muted">/ 100</span>
          </p>
          <p className="mt-4 text-lg text-foreground">{result.scores.summary}</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {result.url.replace(/^https?:\/\//, "")} · {result.scores.label} ·{" "}
            {result.pagesAnalyzed.length}{" "}
            {result.pagesAnalyzed.length === 1 ? "page" : "pages"} reviewed
          </p>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {result.scores.categories.map((cat) => (
            <div
              key={cat.key}
              className="rounded-xl border border-line bg-white p-4"
            >
              <p className="text-xs text-muted">{cat.label}</p>
              <p className="mt-1 text-xl font-medium">
                {cat.score}
                <span className="text-sm text-muted">/{cat.max}</span>
              </p>
              <div className="mt-3">
                <ScoreBar score={cat.score} max={cat.max} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-3xl">Top Revenue Leaks</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          The highest-leverage gaps in the publicly visible digital buying
          journey — not an SEO audit.
        </p>
        <div className="mt-8 grid gap-4">
          {result.opportunities.map((opp) => (
            <article
              key={opp.title}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${severityClass(opp.severity)}`}
                >
                  {opp.severity}
                </span>
                <span className="text-xs text-muted">{opp.category}</span>
              </div>
              <h3 className="mt-3 text-xl font-medium">{opp.title}</h3>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Evidence
                  </dt>
                  <dd className="mt-1 text-[15px] leading-relaxed">{opp.evidence}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Why it matters
                  </dt>
                  <dd className="mt-1 text-[15px] leading-relaxed">
                    {opp.whyItMatters}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Recommended action
                  </dt>
                  <dd className="mt-1 text-[15px] leading-relaxed">
                    {opp.recommendedAction}
                  </dd>
                </div>
              </dl>
              {opp.spyneProduct ? (
                <p className="mt-5 text-sm">
                  <span className="text-muted">Potential fit: </span>
                  <span className="font-medium">{opp.spyneProduct}</span>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl">Quick Wins</h2>
        <ol className="mt-6 grid gap-3">
          {result.quickWins.map((win, index) => (
            <li
              key={win}
              className="flex items-start gap-4 rounded-xl border border-line bg-white px-5 py-4"
            >
              <span className="mt-0.5 text-xs font-medium text-muted">
                0{index + 1}
              </span>
              <p className="text-[15px]">{win}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl">Where Spyne could help</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Deterministic mapping from detected gaps — not a sales calculator, and
          not a claim of guaranteed revenue impact.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {result.spyne.map((item) => (
            <article
              key={item.product}
              className="flex flex-col rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-medium">{item.product}</h3>
                {item.relevant ? (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                    Potential Spyne fit
                  </span>
                ) : (
                  <span className="text-[11px] text-muted">Secondary fit</span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.tagline}
              </p>
              <p className="mt-4 text-[15px]">{item.opportunity}</p>
              <a
                href="https://www.spyne.ai/"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Explore the opportunity →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
          Signals observed
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            { label: "Lead Capture", items: result.signals.leadCapture },
            { label: "Inventory", items: result.signals.inventory },
            { label: "Conversion", items: result.signals.conversion },
            { label: "AI Readiness", items: result.signals.aiReadiness },
          ].map((group) => (
            <div key={group.label} className="rounded-xl border border-line bg-white p-4">
              <p className="text-sm font-medium">{group.label}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3">
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

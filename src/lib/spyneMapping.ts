import type { DealerSignals, Opportunity, SpyneRecommendation } from "./types";

function isWeak(signals: DealerSignals, id: string): boolean {
  const all = [
    ...signals.leadCapture,
    ...signals.inventory,
    ...signals.conversion,
    ...signals.aiReadiness,
  ];
  const status = all.find((s) => s.id === id)?.status;
  return status === "not_detected" || status === "could_not_verify";
}

export function mapSpyneProducts(
  signals: DealerSignals,
  opportunities: Opportunity[],
): SpyneRecommendation[] {
  const viniFromSignals =
    isWeak(signals, "chat") ||
    isWeak(signals, "afterHours") ||
    isWeak(signals, "testDriveCta") ||
    isWeak(signals, "automated");

  const studioFromSignals =
    isWeak(signals, "videoTour") ||
    isWeak(signals, "altText") ||
    isWeak(signals, "vehicleImagery");

  const viniFromOps = opportunities.some((o) => o.spyneProduct === "Vini AI");
  const studioFromOps = opportunities.some((o) => o.spyneProduct === "Studio AI");

  return [
    {
      product: "Vini AI",
      tagline: "Capture, qualify and engage buyers 24/7.",
      opportunity: "Opportunity: capture and qualify inbound buyers after hours.",
      relevant: viniFromSignals || viniFromOps,
    },
    {
      product: "Studio AI",
      tagline: "Create consistent, high-quality vehicle visuals and publish inventory faster.",
      opportunity: "Opportunity: improve consistency and engagement of vehicle listings.",
      relevant: studioFromSignals || studioFromOps,
    },
  ];
}

export function deriveQuickWins(opportunities: Opportunity[], signals: DealerSignals): string[] {
  const wins: string[] = [];

  for (const opp of opportunities) {
    if (opp.title.toLowerCase().includes("test-drive") || opp.title.toLowerCase().includes("test drive")) {
      wins.push("Make test-drive booking more prominent on inventory and homepage.");
    } else if (opp.spyneProduct === "Studio AI") {
      wins.push("Raise listing quality with consistent vehicle imagery and richer media.");
    } else if (opp.spyneProduct === "Vini AI") {
      wins.push("Add always-on lead engagement so after-hours visitors can still convert.");
    } else {
      wins.push(opp.recommendedAction.replace(/\.$/, ""));
    }
  }

  const all = [...signals.conversion, ...signals.leadCapture];
  if (all.find((s) => s.id === "vehicleAction")?.status !== "detected") {
    wins.unshift("Add a stronger vehicle-level CTA on every listing.");
  }

  return [...new Set(wins)].slice(0, 3);
}

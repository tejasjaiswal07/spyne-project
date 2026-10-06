import type { DealerSignals, DetectionStatus, ScoreBreakdown, SignalCheck } from "./types";

function pointsFor(status: DetectionStatus, max: number): number {
  switch (status) {
    case "detected":
      return max;
    case "likely":
      return Math.round(max * 0.7);
    case "could_not_verify":
      return Math.round(max * 0.4);
    case "not_detected":
      return 0;
  }
}

function find(checks: SignalCheck[], id: string): DetectionStatus {
  return checks.find((c) => c.id === id)?.status ?? "could_not_verify";
}

function labelFor(overall: number): ScoreBreakdown["label"] {
  if (overall <= 40) return "Needs Attention";
  if (overall <= 60) return "Developing";
  if (overall <= 80) return "Strong";
  return "Advanced";
}

function summaryFor(label: ScoreBreakdown["label"]): string {
  switch (label) {
    case "Needs Attention":
      return "Several gaps in the digital buying journey may be losing shoppers before they reach your team.";
    case "Developing":
      return "The basics are in place, but conversion and always-on engagement still have meaningful room to grow.";
    case "Strong":
      return "Strong, with meaningful opportunities";
    case "Advanced":
      return "A polished digital buying experience, with a few remaining opportunities to tighten conversion.";
  }
}

export function calculateScores(signals: DealerSignals): ScoreBreakdown {
  const lead = Math.min(
    30,
    pointsFor(find(signals.leadCapture, "phone"), 6) +
      pointsFor(find(signals.leadCapture, "contactForm"), 6) +
      pointsFor(find(signals.leadCapture, "appointmentCta"), 3) +
      pointsFor(find(signals.leadCapture, "testDriveCta"), 3) +
      pointsFor(find(signals.leadCapture, "financingCta"), 3) +
      pointsFor(find(signals.leadCapture, "tradeInCta"), 3) +
      pointsFor(find(signals.leadCapture, "chatWidget"), 6),
  );

  const inventory = Math.min(
    25,
    pointsFor(find(signals.inventory, "inventoryPage"), 6) +
      pointsFor(find(signals.inventory, "vehicleDetail"), 5) +
      pointsFor(find(signals.inventory, "vehicleImagery"), 6) +
      pointsFor(find(signals.inventory, "multipleListings"), 4) +
      pointsFor(find(signals.inventory, "videoTour"), 4),
  );

  const conversion = Math.min(
    25,
    pointsFor(find(signals.conversion, "strongCta"), 5) +
      pointsFor(find(signals.conversion, "vehicleAction"), 5) +
      pointsFor(find(signals.conversion, "testDriveFlow"), 5) +
      pointsFor(find(signals.conversion, "financeTrade"), 5) +
      pointsFor(find(signals.conversion, "contactSales"), 5),
  );

  const ai = Math.min(
    20,
    pointsFor(find(signals.aiReadiness, "chat"), 7) +
      pointsFor(find(signals.aiReadiness, "afterHours"), 4) +
      pointsFor(find(signals.aiReadiness, "automated"), 4) +
      pointsFor(find(signals.aiReadiness, "multiChannel"), 5),
  );

  const overall = lead + inventory + conversion + ai;
  const label = labelFor(overall);

  return {
    categories: [
      { key: "leadCapture", label: "Lead Capture", score: lead, max: 30 },
      { key: "inventory", label: "Inventory", score: inventory, max: 25 },
      { key: "conversion", label: "Conversion", score: conversion, max: 25 },
      { key: "aiReadiness", label: "AI Readiness", score: ai, max: 20 },
    ],
    overall,
    label,
    summary: summaryFor(label),
  };
}

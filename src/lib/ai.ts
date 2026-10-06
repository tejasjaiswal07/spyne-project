import OpenAI from "openai";
import type { DealerSignals, Opportunity, ScoreBreakdown, SignalCheck } from "./types";

function flattenSignals(signals: DealerSignals): SignalCheck[] {
  return [
    ...signals.leadCapture,
    ...signals.inventory,
    ...signals.conversion,
    ...signals.aiReadiness,
    ...signals.technical,
  ];
}

function statusOf(signals: DealerSignals, id: string): SignalCheck | undefined {
  return flattenSignals(signals).find((s) => s.id === id);
}

export function fallbackOpportunities(signals: DealerSignals): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const chat = statusOf(signals, "chat");
  const afterHours = statusOf(signals, "afterHours");
  const testDrive = statusOf(signals, "testDriveCta") ?? statusOf(signals, "testDriveFlow");
  const video = statusOf(signals, "videoTour");
  const alt = statusOf(signals, "altText");
  const imagery = statusOf(signals, "vehicleImagery");
  const form = statusOf(signals, "contactForm");

  if (chat?.status === "not_detected" || afterHours?.status === "not_detected") {
    opportunities.push({
      title: "Limited after-hours lead capture",
      category: "Lead Capture",
      severity: "High",
      evidence:
        chat?.evidence ||
        "No obvious conversational or immediate-response mechanism was detected.",
      whyItMatters:
        "Visitors arriving outside business hours may leave without speaking to anyone, so inbound demand never reaches the sales team.",
      recommendedAction:
        "Add an always-on conversational response and qualification layer across chat, and optionally voice or SMS.",
      spyneProduct: "Vini AI",
    });
  }

  if (
    video?.status === "not_detected" ||
    alt?.status === "not_detected" ||
    imagery?.status !== "detected"
  ) {
    opportunities.push({
      title: "Inventory presentation could work harder",
      category: "Inventory",
      severity: "Medium",
      evidence:
        video?.evidence ||
        imagery?.evidence ||
        "Vehicle imagery and merchandising look basic from publicly visible pages.",
      whyItMatters:
        "Shoppers compare listings across dealer sites. Inconsistent or thin visuals make vehicles easier to skip.",
      recommendedAction:
        "Standardize listing photography and add richer visual merchandising such as enhanced images, videos, or 360 experiences.",
      spyneProduct: "Studio AI",
    });
  }

  if (testDrive?.status === "not_detected") {
    opportunities.push({
      title: "Weak test-drive conversion path",
      category: "Conversion",
      severity: "High",
      evidence:
        testDrive?.evidence ||
        "A prominent test-drive or appointment CTA was not clearly detected.",
      whyItMatters:
        "Interested shoppers often need one obvious next step. If booking a drive is buried, they bounce to another rooftop.",
      recommendedAction:
        "Make test-drive and appointment booking prominent on inventory and vehicle pages, then follow up automatically.",
      spyneProduct: "Vini AI",
    });
  } else if (form?.status === "not_detected") {
    opportunities.push({
      title: "Lead capture relies on a few contact paths",
      category: "Lead Capture",
      severity: "Medium",
      evidence: form?.evidence || "Contact form coverage looked limited.",
      whyItMatters:
        "If the only options are a phone number or a buried form, many mobile shoppers will not convert.",
      recommendedAction:
        "Offer a low-friction capture path that can qualify the buyer and book a next step without waiting for a salesperson.",
      spyneProduct: "Vini AI",
    });
  }

  while (opportunities.length < 3) {
    opportunities.push({
      title: "Tighten the vehicle-level next action",
      category: "Conversion",
      severity: "Medium",
      evidence:
        "Vehicle pages and CTAs were reviewed from publicly visible content; the next step for a shopper could be clearer.",
      whyItMatters:
        "Each listing should answer what to do next: check availability, get a payment, or book a visit.",
      recommendedAction:
        "Add a consistent vehicle-level CTA and route those intents into qualification and follow-up.",
      spyneProduct: "Vini AI",
    });
    break;
  }

  return opportunities.slice(0, 3);
}

export async function generateOpportunities(input: {
  url: string;
  websiteSummary: string;
  signals: DealerSignals;
  scores: ScoreBreakdown;
}): Promise<Opportunity[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackOpportunities(input.signals);
  }

  try {
    const client = new OpenAI({ apiKey });
    const signalLines = flattenSignals(input.signals)
      .map((s) => `- ${s.label}: ${s.status}. ${s.evidence}`)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a growth analyst for automotive dealerships. You identify digital buying-journey leaks.

Rules:
- Do NOT calculate scores.
- Distinguish between detected, not detected, likely, and could not verify.
- Never claim something is definitely missing if the status is could_not_verify or not_detected only from a limited crawl. Use cautious language: "was not detected", "no obvious", "could not verify".
- Do not invent ROI, revenue numbers, or unstated Spyne product features.
- Spyne products you may reference: "Vini AI" (conversational lead capture, qualification, appointments, follow-ups across chat/voice/email) or "Studio AI" (vehicle image enhancement, consistent inventory imagery, videos/tours, faster merchandising).
- Return strict JSON: {"opportunities":[{title,category,severity,evidence,whyItMatters,recommendedAction,spyneProduct}]}
- category must be one of: Lead Capture, Inventory, Conversion, AI Readiness
- severity must be High, Medium, or Low
- spyneProduct must be "Vini AI", "Studio AI", or null
- Return exactly 3 opportunities, highest impact first.`,
        },
        {
          role: "user",
          content: `Dealership URL: ${input.url}

Deterministic scores (do not recalculate): ${JSON.stringify(input.scores)}

Detected signals:
${signalLines}

Website extract:
${input.websiteSummary}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackOpportunities(input.signals);

    const parsed = JSON.parse(raw) as { opportunities?: Opportunity[] };
    const items = (parsed.opportunities || []).filter(
      (item) => item.title && item.evidence && item.recommendedAction,
    );

    if (items.length === 0) return fallbackOpportunities(input.signals);
    return items.slice(0, 3).map((item) => ({
      title: item.title,
      category: item.category || "Lead Capture",
      severity: item.severity === "High" || item.severity === "Low" ? item.severity : "Medium",
      evidence: item.evidence,
      whyItMatters: item.whyItMatters || "",
      recommendedAction: item.recommendedAction,
      spyneProduct:
        item.spyneProduct === "Vini AI" || item.spyneProduct === "Studio AI"
          ? item.spyneProduct
          : null,
    }));
  } catch {
    return fallbackOpportunities(input.signals);
  }
}

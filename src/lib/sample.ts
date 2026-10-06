import type { AnalysisResult, DealerSignals } from "./types";

function check(
  id: string,
  label: string,
  status: DealerSignals["leadCapture"][number]["status"],
  evidence: string,
) {
  return { id, label, status, evidence };
}

export const SAMPLE_DEALER_URL = "https://www.riversideford.example";

export function getSampleAnalysis(): AnalysisResult {
  const signals: DealerSignals = {
    leadCapture: [
      check("phone", "Phone number", "detected", "Found a header phone number: (555) 014-2280."),
      check("contactForm", "Contact form", "detected", "A contact form was present on the Contact page."),
      check("financingCta", "Financing CTA", "detected", "A Get Pre-Approved link was found in the main navigation."),
      check("tradeInCta", "Trade-in CTA", "likely", "Trade-in language appeared in footer content, but not as a primary CTA."),
      check("appointmentCta", "Appointment CTA", "likely", "Service scheduling was present; sales appointment booking was less obvious."),
      check("testDriveCta", "Test-drive CTA", "not_detected", "No obvious test-drive CTA was found on homepage or inventory pages."),
      check("chatWidget", "Chat or conversational widget", "not_detected", "No obvious chat widget or conversational assistant was detected."),
      check("visibleContact", "Visible contact options", "detected", "Phone and a contact form were both visible."),
    ],
    inventory: [
      check("inventoryPage", "Inventory discoverability", "detected", "New and used inventory pages were linked in the main navigation."),
      check("vehicleDetail", "Vehicle detail pages", "detected", "Multiple vehicle detail URLs were present in inventory listings."),
      check("vehicleImagery", "Vehicle imagery", "likely", "Listings had photos, but treatment looked inconsistent across vehicles."),
      check("multipleListings", "Multiple vehicle listings", "detected", "Inventory pages showed a grid of vehicle listings."),
      check("altText", "Image alt text quality", "not_detected", "Most inventory images used empty or generic alt text."),
      check("videoTour", "Video / 360 / tour content", "not_detected", "No obvious video, 360, or virtual tour experience was detected."),
    ],
    conversion: [
      check("strongCta", "Clear primary CTAs", "likely", "Navigation CTAs existed, but the primary next step on listings was muted."),
      check("vehicleAction", "Vehicle-level next action", "likely", "View Details was present; check availability / get e-price was not prominent."),
      check("testDriveFlow", "Test-drive flow", "not_detected", "A prominent test-drive path was not detected."),
      check("financeTrade", "Financing or trade-in path", "detected", "Financing pages and a pre-approval form were available."),
      check("contactSales", "Contact sales", "detected", "Contact Us and Call buttons were present in the header."),
    ],
    aiReadiness: [
      check("chat", "Conversational support", "not_detected", "No obvious conversational layer was detected."),
      check("afterHours", "After-hours engagement", "not_detected", "Hours were listed, but no after-hours response mechanism was found."),
      check("automated", "Automated interaction signals", "not_detected", "No chatbot, instant reply, or automated assistant cues were found."),
      check("multiChannel", "Multi-channel contact", "likely", "Phone and form were available; chat and SMS were not detected."),
    ],
    technical: [
      check("https", "HTTPS", "detected", "Homepage was served over HTTPS."),
      check("viewport", "Mobile viewport meta", "detected", "A mobile viewport meta tag was present."),
    ],
  };

  return {
    url: SAMPLE_DEALER_URL,
    analyzedAt: new Date().toISOString(),
    mode: "sample",
    scrapeWarning:
      "Sample dealership used. This is a realistic demo result for Riverside Ford, a mid-size rooftop with solid inventory pages but weak always-on engagement.",
    scores: {
      categories: [
        { key: "leadCapture", label: "Lead Capture", score: 18, max: 30 },
        { key: "inventory", label: "Inventory", score: 21, max: 25 },
        { key: "conversion", label: "Conversion", score: 16, max: 25 },
        { key: "aiReadiness", label: "AI Readiness", score: 8, max: 20 },
      ],
      overall: 63,
      label: "Strong",
      summary: "Strong, with meaningful opportunities",
    },
    signals,
    opportunities: [
      {
        title: "Limited after-hours engagement",
        category: "Lead Capture",
        severity: "High",
        evidence: "No obvious always-on conversational interaction was detected.",
        whyItMatters:
          "Buyers may leave the site without receiving an immediate response, especially nights and weekends.",
        recommendedAction:
          "Add always-on conversational engagement and qualification so inbound interest is captured before it goes cold.",
        spyneProduct: "Vini AI",
      },
      {
        title: "Basic inventory imagery",
        category: "Inventory",
        severity: "Medium",
        evidence:
          "Inventory pages exist and listings have photos, but image treatment looks inconsistent and no video/360/tour content was detected.",
        whyItMatters:
          "Shoppers compare vehicles visually. Uneven merchandising makes it harder to hold attention and trust the listing.",
        recommendedAction:
          "Standardize vehicle photography and add richer listing media so every unit is presented at the same quality bar.",
        spyneProduct: "Studio AI",
      },
      {
        title: "Weak test-drive conversion path",
        category: "Conversion",
        severity: "High",
        evidence: "A prominent test-drive CTA was not detected on homepage or inventory pages.",
        whyItMatters:
          "Interested shoppers often need one obvious next step. If booking a drive is buried, they bounce to another rooftop.",
        recommendedAction:
          "Make test-drive booking prominent on listings and route those intents into follow-up automatically.",
        spyneProduct: "Vini AI",
      },
    ],
    quickWins: [
      "Add a stronger vehicle-level CTA on every listing.",
      "Make test-drive booking more prominent.",
      "Add always-on lead engagement.",
    ],
    spyne: [
      {
        product: "Vini AI",
        tagline: "Capture, qualify and engage buyers 24/7.",
        opportunity: "Opportunity: capture and qualify inbound buyers after hours.",
        relevant: true,
      },
      {
        product: "Studio AI",
        tagline: "Create consistent, high-quality vehicle visuals and publish inventory faster.",
        opportunity: "Opportunity: improve consistency and engagement of vehicle listings.",
        relevant: true,
      },
    ],
    pagesAnalyzed: [
      { url: SAMPLE_DEALER_URL, title: "Riverside Ford | New & Used Cars" },
      { url: `${SAMPLE_DEALER_URL}/inventory`, title: "Inventory | Riverside Ford" },
      { url: `${SAMPLE_DEALER_URL}/finance`, title: "Financing | Riverside Ford" },
      { url: `${SAMPLE_DEALER_URL}/contact`, title: "Contact Us | Riverside Ford" },
    ],
  };
}

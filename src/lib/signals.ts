import type { DealerSignals, DetectionStatus, ScrapedPage, SignalCheck } from "./types";

function check(
  id: string,
  label: string,
  status: DetectionStatus,
  evidence: string,
): SignalCheck {
  return { id, label, status, evidence };
}

function combinedText(pages: ScrapedPage[]): string {
  return pages
    .map(
      (p) =>
        `${p.title} ${p.metaDescription} ${p.headings.join(" ")} ${p.buttons.join(" ")} ${p.bodyText}`,
    )
    .join(" ")
    .toLowerCase();
}

function combinedHtml(pages: ScrapedPage[]): string {
  return pages.map((p) => p.htmlLower).join(" ");
}

function hasAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function countMatches(haystack: string, needles: string[]): number {
  return needles.filter((n) => haystack.includes(n)).length;
}

export function detectSignals(pages: ScrapedPage[]): DealerSignals {
  const text = combinedText(pages);
  const html = combinedHtml(pages);
  const allButtons = pages.flatMap((p) => p.buttons).join(" ").toLowerCase();
  const phones = pages.flatMap((p) => p.phones);
  const emails = pages.flatMap((p) => p.emails);
  const forms = pages.reduce((sum, p) => sum + p.formCount, 0);
  const images = pages.flatMap((p) => p.images);
  const links = pages.flatMap((p) => p.links).map((l) => l.toLowerCase());
  const homepage = pages[0];

  const inventoryLink = links.some((l) =>
    /inventory|used-car|new-car|vehicles|\/cars/.test(l),
  );
  const vdpLink = links.some((l) =>
    /vehicle|inventory\/|\/vin\/|vdp|\/cars\/\d|used-cars\//.test(l),
  );
  const listingCount = links.filter((l) =>
    /inventory|vehicle|vdp|used-car|new-car/.test(l),
  ).length;

  const altFilled = images.filter((img) => img.alt && img.alt.length > 3).length;
  const altQuality =
    images.length === 0
      ? "could_not_verify"
      : altFilled / Math.max(images.length, 1) >= 0.4
        ? "detected"
        : altFilled > 0
          ? "likely"
          : "not_detected";

  const chatDetected = hasAny(html + text, [
    "intercom",
    "drift",
    "tidio",
    "tawk",
    "livechat",
    "live chat",
    "chat widget",
    "zendesk",
    "gorgias",
    "messenger",
    "chat now",
    "chat with us",
    "start a chat",
    "conversational",
    "chatbot",
    "ai assistant",
    "talk to us",
  ]);

  const afterHours = hasAny(text + html, [
    "24/7",
    "24-7",
    "after hours",
    "after-hours",
    "always available",
    "round the clock",
    "nights and weekends",
  ]);

  const videoTour = hasAny(text + html, [
    "360",
    "virtual tour",
    "spin",
    "walkaround",
    "walk-around",
    "video tour",
    "vehicle video",
    "3d tour",
  ]);

  return {
    leadCapture: [
      check(
        "phone",
        "Phone number",
        phones.length > 0 ? "detected" : "not_detected",
        phones.length > 0
          ? `Found visible phone number(s), including ${phones[0]}.`
          : "No obvious phone number was found in the crawled pages.",
      ),
      check(
        "contactForm",
        "Contact form",
        forms > 0 ? "detected" : hasAny(text, ["contact us", "send a message"]) ? "likely" : "not_detected",
        forms > 0
          ? `Detected ${forms} form(s) across crawled pages.`
          : "No contact form was clearly detected.",
      ),
      check(
        "financingCta",
        "Financing CTA",
        hasAny(text + allButtons, ["finance", "financing", "get pre-approved", "pre-approval"])
          ? "detected"
          : "not_detected",
        hasAny(text + allButtons, ["finance", "financing", "pre-approved", "pre-approval"])
          ? "Financing language or CTA was found."
          : "No obvious financing call-to-action was found.",
      ),
      check(
        "tradeInCta",
        "Trade-in CTA",
        hasAny(text + allButtons, ["trade-in", "trade in", "value your trade", "appraisal"])
          ? "detected"
          : "not_detected",
        hasAny(text + allButtons, ["trade-in", "trade in", "appraisal"])
          ? "Trade-in or appraisal CTA was found."
          : "No obvious trade-in CTA was found.",
      ),
      check(
        "appointmentCta",
        "Appointment CTA",
        hasAny(text + allButtons, ["appointment", "schedule", "book a visit", "reserve"])
          ? "detected"
          : "not_detected",
        hasAny(text + allButtons, ["appointment", "schedule", "book a visit"])
          ? "Appointment or scheduling CTA was found."
          : "No obvious appointment booking CTA was found.",
      ),
      check(
        "testDriveCta",
        "Test-drive CTA",
        hasAny(text + allButtons, ["test drive", "test-drive", "testdrive"])
          ? "detected"
          : "not_detected",
        hasAny(text + allButtons, ["test drive", "test-drive"])
          ? "Test-drive CTA was found."
          : "No obvious test-drive CTA was found.",
      ),
      check(
        "chatWidget",
        "Chat or conversational widget",
        chatDetected ? "detected" : "not_detected",
        chatDetected
          ? "Chat or conversational UI indicators were found."
          : "No obvious chat widget or conversational assistant was detected.",
      ),
      check(
        "visibleContact",
        "Visible contact options",
        phones.length > 0 || emails.length > 0 || forms > 0 ? "detected" : "not_detected",
        phones.length || emails.length || forms
          ? "At least one contact path (phone, email, or form) was visible."
          : "Visible contact options were limited or not detected.",
      ),
    ],
    inventory: [
      check(
        "inventoryPage",
        "Inventory discoverability",
        inventoryLink ? "detected" : hasAny(text, ["inventory", "vehicles for sale"]) ? "likely" : "not_detected",
        inventoryLink
          ? "An inventory or vehicles page appears to be linked."
          : "Could not clearly identify an inventory browsing page.",
      ),
      check(
        "vehicleDetail",
        "Vehicle detail pages",
        vdpLink ? "detected" : listingCount > 2 ? "likely" : "not_detected",
        vdpLink
          ? "Links that look like vehicle detail pages were found."
          : "Vehicle detail pages were not clearly detected.",
      ),
      check(
        "vehicleImagery",
        "Vehicle imagery",
        images.length >= 8 ? "detected" : images.length >= 3 ? "likely" : "not_detected",
        images.length
          ? `Found ${images.length} images across crawled pages.`
          : "Very little vehicle imagery was detected on crawled pages.",
      ),
      check(
        "multipleListings",
        "Multiple vehicle listings",
        listingCount >= 6 ? "detected" : listingCount >= 2 ? "likely" : "not_detected",
        listingCount
          ? `Found ${listingCount} links that look inventory-related.`
          : "Multiple vehicle listings were not clearly detected.",
      ),
      check(
        "altText",
        "Image alt text quality",
        altQuality,
        images.length === 0
          ? "Could not evaluate image alt text because few images were found."
          : `${altFilled} of ${images.length} images had meaningful alt text.`,
      ),
      check(
        "videoTour",
        "Video / 360 / tour content",
        videoTour ? "detected" : "not_detected",
        videoTour
          ? "Found language suggesting video, 360, or tour experiences."
          : "No obvious video, 360, or virtual tour experience was detected.",
      ),
    ],
    conversion: [
      check(
        "strongCta",
        "Clear primary CTAs",
        allButtons.length >= 8 ? "detected" : allButtons.length >= 3 ? "likely" : "not_detected",
        allButtons.length
          ? "Multiple clickable CTAs were present."
          : "Primary calls-to-action were limited or unclear.",
      ),
      check(
        "vehicleAction",
        "Vehicle-level next action",
        hasAny(allButtons + text, [
          "check availability",
          "get e-price",
          "get price",
          "view details",
          "confirm availability",
          "hold this",
        ])
          ? "detected"
          : vdpLink
            ? "likely"
            : "not_detected",
        "Looked for vehicle-level actions such as check availability, get price, or view details.",
      ),
      check(
        "testDriveFlow",
        "Test-drive flow",
        hasAny(text + allButtons, ["test drive", "test-drive"]) ? "detected" : "not_detected",
        hasAny(text + allButtons, ["test drive", "test-drive"])
          ? "Test-drive language was present."
          : "A prominent test-drive path was not detected.",
      ),
      check(
        "financeTrade",
        "Financing or trade-in path",
        countMatches(text + allButtons, ["finance", "trade-in", "trade in", "pre-approved"]) >= 1
          ? "detected"
          : "not_detected",
        "Checked for financing and trade-in conversion paths.",
      ),
      check(
        "contactSales",
        "Contact sales",
        hasAny(text + allButtons, ["contact sales", "contact us", "talk to a specialist", "text us", "call us"])
          ? "detected"
          : phones.length > 0
            ? "likely"
            : "not_detected",
        "Looked for a clear contact-sales or talk-to-the-team path.",
      ),
    ],
    aiReadiness: [
      check(
        "chat",
        "Conversational support",
        chatDetected ? "detected" : "not_detected",
        chatDetected
          ? "Conversational or chat support indicators were found."
          : "No obvious conversational layer was detected.",
      ),
      check(
        "afterHours",
        "After-hours engagement",
        afterHours || chatDetected ? (chatDetected ? "likely" : "detected") : "not_detected",
        afterHours
          ? "After-hours or 24/7 language was found."
          : chatDetected
            ? "Chat may support after-hours engagement, but this could not be fully verified."
            : "No after-hours engagement mechanism was detected.",
      ),
      check(
        "automated",
        "Automated interaction signals",
        hasAny(text + html, ["chatbot", "ai assistant", "instant reply", "auto-reply", "automated"])
          ? "detected"
          : chatDetected
            ? "likely"
            : "not_detected",
        "Looked for automated or AI-assisted interaction cues.",
      ),
      check(
        "multiChannel",
        "Multi-channel contact",
        [phones.length > 0, emails.length > 0, forms > 0, chatDetected].filter(Boolean).length >= 3
          ? "detected"
          : [phones.length > 0, emails.length > 0, forms > 0, chatDetected].filter(Boolean).length >= 2
            ? "likely"
            : "not_detected",
        "Checked whether phone, form, email, and chat were all available.",
      ),
    ],
    technical: [
      check(
        "https",
        "HTTPS",
        homepage?.isHttps ? "detected" : "not_detected",
        homepage?.isHttps ? "Homepage was served over HTTPS." : "HTTPS was not detected on the analyzed URL.",
      ),
      check(
        "viewport",
        "Mobile viewport meta",
        homepage?.hasViewportMeta ? "detected" : "not_detected",
        homepage?.hasViewportMeta
          ? "A mobile viewport meta tag was present."
          : "A mobile viewport meta tag was not detected.",
      ),
    ],
  };
}

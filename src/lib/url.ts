export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Please enter a dealership website URL.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("That URL does not look valid. Try something like https://yourdealership.com");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  if (!parsed.hostname.includes(".")) {
    throw new Error("Please enter a full website address, including the domain.");
  }

  parsed.hash = "";
  return parsed.toString();
}

export function isInternalLink(href: string, origin: string): boolean {
  try {
    const url = new URL(href, origin);
    return url.origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

export function toAbsoluteUrl(href: string, base: string): string | null {
  try {
    const url = new URL(href, base);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

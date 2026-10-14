/**
 * Escapes <, >, and / in JSON-LD to neutralize </script> breakouts in all browser parsing modes.
 * Matches the strategy used by React's server renderer and Next.js. Note: > and / are escaped in
 * addition to < to handle legacy quirks-mode parsers and the --> HTML comment terminator.
 */
export function serializeJsonLd(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f");
}

const SAFE_URL_PROTOCOLS = /^(?:https?:\/\/|(?:mailto|tel):|\/(?!\/)|(?:\.\.?\/))/i;

/**
 * Allowlist URL protocols for href/src attributes to block javascript: and protocol-relative
 * injection. Permits absolute (https://, http://, mailto:, tel:), root-relative (/path, blocking
 * //), and relative (./path, ../path). Applied to: canonical, ogImage, favicon, appleTouchIcon,
 * rssFeed.href, languageAlternates[].href, versionAlternates[].href, and all link tag hrefs.
 * Returns an empty string for any URL that does not match the allowlist.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  return SAFE_URL_PROTOCOLS.test(trimmed) ? trimmed : "";
}

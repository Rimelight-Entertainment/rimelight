import type { SecurityOptions } from "./types";

// Hostname (dot-separated labels) with an optional port. Single-label hosts such as "localhost"
// are rejected: `domain` is used to derive production `cdn.<domain>` origins.
const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d{1,5})?$/;

/**
 * Coerces a `domain` into a bare lowercase `host[:port]`, dropping any scheme, surrounding
 * whitespace, path, query, fragment or trailing slash. Never throws, so it is safe to call on the
 * request path.
 */
function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split(/[/?#]/)[0]!
    .replace(/\/+$/, "");
}

/**
 * Build-time gate for the `domain` option. Accepts a bare host, a full URL, or a host with stray
 * whitespace and returns a bare lowercase `host[:port]`. Returns `undefined` when the value is
 * absent or blank, and throws when it cannot be repaired into a valid hostname.
 */
export function resolveSecurityDomain(value: string | undefined): string | undefined {
  const normalized = value === undefined ? "" : normalizeDomain(value);
  if (normalized === "") return undefined;
  if (!DOMAIN_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid security domain ${JSON.stringify(value)}: expected a bare host such as ` +
        `"example.com" (optionally with a port), not a URL or path.`,
    );
  }
  return normalized;
}

/**
 * Builds the Content-Security-Policy header string dynamically for a given request nonce.
 */
export function buildCspHeader(options: SecurityOptions = {}, nonce?: string): string {
  const domain = normalizeDomain(options.domain || "");
  const allowedDomains = options.allowedDomains || [];

  const imgSources = Array.from(
    new Set([
      "'self'",
      "data:",
      ...(domain ? [`https://cdn.${domain}`] : []),
      ...allowedDomains,
      ...(options.imgSrc || []),
    ]),
  );

  const allowTurnstile = options.turnstile === true;

  const connectSources = Array.from(
    new Set([
      "'self'",
      ...(allowTurnstile ? ["https://challenges.cloudflare.com"] : []),
      ...allowedDomains,
      ...(options.connectSrc || []),
    ]),
  );

  const frameSources = Array.from(
    new Set([
      "'self'",
      ...(allowTurnstile ? ["https://challenges.cloudflare.com"] : []),
      ...allowedDomains,
      ...(options.frameSrc || []),
    ]),
  );

  const useStrictDynamic = nonce && options.strictDynamic !== false;

  const scriptSources = Array.from(
    new Set([
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...(useStrictDynamic ? ["'strict-dynamic'", "https:"] : []),
      "'inline-speculation-rules'",
      ...(options.scriptResources || []),
    ]),
  );

  const styleSources = Array.from(new Set(["'self'", ...(options.styleResources || [])]));

  const defaultDirectives: Record<string, string[]> = {
    "default-src": ["'none'"],
    "img-src": imgSources,
    "font-src": ["'self'"],
    "connect-src": connectSources,
    "frame-ancestors": ["'none'"],
    "frame-src": frameSources,
    "script-src": scriptSources,
    "script-src-attr": ["'none'"],
    "style-src": styleSources,
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "manifest-src": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  if (options.trustedTypes) {
    defaultDirectives["require-trusted-types-for"] = ["'script'"];
  }

  // Merge custom directive overrides
  if (options.directives) {
    for (const [key, value] of Object.entries(options.directives)) {
      if (value === false) {
        delete defaultDirectives[key];
      } else if (value === true) {
        defaultDirectives[key] = [];
      } else if (Array.isArray(value)) {
        defaultDirectives[key] = value;
      } else if (typeof value === "string") {
        defaultDirectives[key] = value.split(" ").filter(Boolean);
      }
    }
  }

  return Object.entries(defaultDirectives)
    .map(([directive, values]) => {
      if (!values || values.length === 0) return directive;
      return `${directive} ${values.join(" ")}`;
    })
    .join("; ");
}

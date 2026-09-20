import type { SecurityOptions } from "./types"

/**
 * Builds the Content-Security-Policy header string dynamically for a given request nonce.
 */
export function buildCspHeader(options: SecurityOptions = {}, nonce?: string): string {
  const domain = options.domain || ""

  const imgSources = Array.from(
    new Set([
      "'self'",
      "data:",
      ...(domain ? [`https://cdn.${domain}`] : []),
      ...(options.imgSrc || [])
    ])
  )

  const allowTurnstile = options.turnstile === true

  const connectSources = Array.from(
    new Set([
      "'self'",
      ...(allowTurnstile ? ["https://challenges.cloudflare.com"] : []),
      ...(options.connectSrc || [])
    ])
  )

  const frameSources = Array.from(
    new Set([
      "'self'",
      ...(allowTurnstile ? ["https://challenges.cloudflare.com"] : []),
      ...(options.frameSrc || [])
    ])
  )

  const useStrictDynamic = nonce && options.strictDynamic !== false

  const scriptSources = Array.from(
    new Set([
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...(useStrictDynamic ? ["'strict-dynamic'", "https:"] : []),
      "'inline-speculation-rules'",
      ...(options.scriptResources || [])
    ])
  )

  const styleSources = Array.from(new Set(["'self'", ...(options.styleResources || [])]))

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
    "upgrade-insecure-requests": []
  }

  if (options.trustedTypes) {
    defaultDirectives["require-trusted-types-for"] = ["'script'"]
  }

  // Merge custom directive overrides
  if (options.directives) {
    for (const [key, value] of Object.entries(options.directives)) {
      if (value === false) {
        delete defaultDirectives[key]
      } else if (value === true) {
        defaultDirectives[key] = []
      } else if (Array.isArray(value)) {
        defaultDirectives[key] = value
      } else if (typeof value === "string") {
        defaultDirectives[key] = value.split(" ").filter(Boolean)
      }
    }
  }

  return Object.entries(defaultDirectives)
    .map(([directive, values]) => {
      if (!values || values.length === 0) return directive
      return `${directive} ${values.join(" ")}`
    })
    .join("; ")
}

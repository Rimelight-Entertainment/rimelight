import { setKVBinding } from "./index"
import { env } from "cloudflare:workers"
import { locales, defaultLocale, prefixDefaultLocale } from "virtual:rimelight-i18n-config"
import { currentLocale } from "./runtime"

const SUPPORTED_LOCALES = new Set(locales)
const DEFAULT_LOCALE = defaultLocale

function getPreferredLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const parsed = acceptLanguage
    .split(",")
    .map((lang) => {
      const parts = lang.split(";")
      const code = (parts[0] ?? "").trim().toLowerCase()
      const base = code.split("-")[0] ?? ""
      let q = 1.0
      const qualityPart = parts[1]
      if (qualityPart) {
        const qMatch = qualityPart.match(/q=([0-9.]+)/)
        if (qMatch) {
          q = parseFloat(qMatch[1] ?? "1")
        }
      }
      return { code, base, q }
    })
    .toSorted((a, b) => b.q - a.q)

  for (const item of parsed) {
    if (SUPPORTED_LOCALES.has(item.code)) {
      return item.code
    }
    const base: string = item.base
    if (SUPPORTED_LOCALES.has(base)) {
      return base
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Hono middleware for Rimelight i18n. Handles locale routing, redirection, currentLocale store
 * updates, and Cloudflare KV binding setup.
 */
export function i18n() {
  return async (c: any, next: any) => {
    // 1. Initialize KV if available in worker environment
    try {
      const kv = Reflect.get(env, "TRANSLATIONS_KV") || c.env?.TRANSLATIONS_KV
      if (kv) {
        setKVBinding(kv)
      }
    } catch {
      // Ignore if not running in Cloudflare worker
    }

    // 2. Execute routing & locale detection
    const url = new URL(c.req.url)
    const pathname = url.pathname

    // Only handle GET/HEAD requests
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      const paramLocale = c.req.param("locale")
      const firstSegment = pathname.split("/").find(Boolean)
      const activeLocale =
        (paramLocale && SUPPORTED_LOCALES.has(paramLocale) ? paramLocale : null) ||
        (firstSegment && SUPPORTED_LOCALES.has(firstSegment) ? firstSegment : null) ||
        DEFAULT_LOCALE
      currentLocale.set(activeLocale)
      return next()
    }

    // Skip API routes, internal Astro routes, and static files with extensions
    if (pathname.startsWith("/api") || pathname.startsWith("/_") || pathname.includes(".")) {
      return next()
    }

    const firstSegment = pathname.split("/").find(Boolean)
    const firstIsLocale = firstSegment !== undefined && SUPPORTED_LOCALES.has(firstSegment)

    if (prefixDefaultLocale) {
      // All locales are prefixed (e.g. /en/about, /pt/about)
      const paramLocale = c.req.param("locale")
      const activeLocale =
        (paramLocale && SUPPORTED_LOCALES.has(paramLocale) ? paramLocale : null) ||
        (firstIsLocale ? firstSegment! : null) ||
        DEFAULT_LOCALE

      currentLocale.set(activeLocale)

      // If pathname already has a valid locale prefix, proceed
      if (firstIsLocale) {
        return next()
      }

      // Otherwise redirect to preferred locale
      const acceptLanguage = c.req.header("accept-language") || null
      const locale = getPreferredLocale(acceptLanguage)
      currentLocale.set(locale)
      const targetPath = `/${locale}${pathname}${url.search}`
      return c.redirect(targetPath, 302)
    } else {
      // Only non-default locales are prefixed (e.g. /about, /pt/about)
      if (firstIsLocale) {
        if (firstSegment === DEFAULT_LOCALE) {
          // Strip the redundant default-locale prefix: /en/about → /about
          const rest = pathname.slice(DEFAULT_LOCALE.length + 1) || "/"
          currentLocale.set(DEFAULT_LOCALE)
          return c.redirect(`${rest}${url.search}`, 302)
        }
        // Non-default locale — serve as-is
        currentLocale.set(firstSegment!)
        return next()
      }

      // No locale prefix → default locale, serve as-is
      currentLocale.set(DEFAULT_LOCALE)
      return next()
    }
  }
}

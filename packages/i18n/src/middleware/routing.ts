import { locales, defaultLocale } from "virtual:rimelight-i18n-config"

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

export const i18n = async (context: any, next: any) => {
  const url = new URL(context.request.url)
  const pathname = url.pathname

  // Only handle GET/HEAD requests
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return next()
  }

  // Skip API routes, internal Astro routes, and files with extensions
  if (pathname.startsWith("/api") || pathname.startsWith("/_") || pathname.includes(".")) {
    return next()
  }

  // Check if pathname starts with a supported locale prefix
  const firstSegment = pathname.split("/").find(Boolean)

  if (firstSegment && SUPPORTED_LOCALES.has(firstSegment)) {
    return next()
  }

  // Redirect to the preferred locale
  const acceptLanguage = context.request.headers.get("accept-language")
  const locale = getPreferredLocale(acceptLanguage)
  const targetPath = `/${locale}${pathname}${url.search}`

  return context.redirect(targetPath, 302)
}

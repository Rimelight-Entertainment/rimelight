import { replaceLocaleInPath } from "../i18n/format"

/**
 * Generates absolute URLs for hreflang tags
 */
export function buildAlternateUrl(
  currentOrigin: string,
  currentPath: string,
  currentLang: string,
  targetLang: string
): string {
  // Change the locale in the path (for example, /en/blog -> /es/blog)
  const newPath = replaceLocaleInPath(currentPath, currentLang, targetLang)

  // Collect the absolute URL using current origin
  const url = new URL(newPath, currentOrigin)
  let href = url.toString()

  // Astro is strict about trailing slashes, so let's play it safe.
  if (!href.endsWith("/")) {
    href += "/"
  }

  return href
}

export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}

export function buildCanonicalUrl(path: string, siteOrigin: string): string {
  // Removing trailing slashes or query parameters for a clean canonical url
  const cleanPath = path.split("?")[0]?.replace(/\/$/, "")
  return `${siteOrigin}${cleanPath}`
}

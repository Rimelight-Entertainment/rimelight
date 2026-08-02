import type { SiteConfig } from "./types.js"

/**
 * Build a canonical URL from a page URL and site base. - Strips trailing slash unless the path has
 * query params (where trailing slash is removed too). - Returns undefined-safe: pass Astro.url and
 * Astro.site directly.
 */
export function buildCanonicalUrl(url: string | URL, base: string | URL): string {
  const resolved = new URL(url, base)
  const path = resolved.toString()
  // Keep query params as-is but strip trailing slash; for clean paths also ensure trailing slash
  return path.includes("?") ? path.replace(/\/?$/, "") : path.replace(/\/?$/, "/")
}

/**
 * Build a page title using a site's title template. Falls back to siteName for untitled pages; uses
 * a 404 label for error pages.
 */
export function buildPageTitle(opts: {
  title?: string
  siteName: string
  titleTemplate: string
  is404?: boolean
}): string {
  const { title, siteName, titleTemplate, is404 } = opts
  if (is404) return `404 - Not Found | ${siteName}`
  if (!title) return siteName
  return titleTemplate.replace("%s", title)
}

/**
 * Truncate a description to a maximum character length, appending "…" if trimmed.
 */
export function buildSafeDescription(description: string, maxLength: number): string {
  if (!description) return description
  if (description.length <= maxLength) return description
  return description.slice(0, maxLength - 3) + "..."
}

/**
 * Build the value for the <meta name="robots"> tag. Returns the full directive string including
 * max-image-preview for indexable pages.
 */
export function buildRobotsMetaContent(opts: {
  noindex?: boolean
  is404?: boolean
  override?: string
}): string {
  if (opts.override) return opts.override
  return !opts.noindex && !opts.is404
    ? "index, follow, max-image-preview:large"
    : "noindex, nofollow"
}

/**
 * \n * Build a Schema.org WebSite JSON-LD object.\n * Pass the result to JSON.stringify and emit
 * via <script type="application/ld+json">.\n
 */
export function buildWebSiteSchema(
  config: Pick<SiteConfig, "name" | "url" | "description">,
  site?: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.name,
    "url": site ?? config.url,
    "description": config.description
  }
}

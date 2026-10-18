import type { SeoConfig } from "./types";

/**
 * Build a canonical URL from a page URL and site base. - Strips trailing slash unless the path has
 * query params (where trailing slash is removed too). - Returns undefined-safe.
 */
export function buildCanonicalUrl(url: string | URL, base: string | URL): string {
  const resolved = new URL(url, base);
  const path = resolved.toString();
  // Keep query params as-is but strip trailing slash; for clean paths also ensure trailing slash
  return path.includes("?") ? path.replace(/\/?$/, "") : path.replace(/\/?$/, "/");
}

/**
 * Deep merge two or more metadata or configuration objects. Later objects win; `undefined` values
 * do not overwrite earlier ones.
 */
export function deepMerge<T extends Record<string, any>>(
  base: T,
  ...overrides: (Record<string, any> | undefined)[]
): T {
  let result: Record<string, any> = { ...base };
  for (const override of overrides) {
    if (!override) continue;
    for (const key of Object.keys(override)) {
      const baseVal = result[key];
      const overrideVal = override[key];
      if (
        baseVal &&
        overrideVal &&
        typeof baseVal === "object" &&
        typeof overrideVal === "object" &&
        !Array.isArray(baseVal) &&
        !Array.isArray(overrideVal)
      ) {
        result[key] = deepMerge(baseVal, overrideVal);
      } else if (overrideVal !== undefined) {
        result[key] = overrideVal;
      }
    }
  }
  return result as T;
}

/**
 * Build a page title using a site's title template. Falls back to siteName for untitled pages; uses
 * a 404 label for error pages. Supports absolute title bypass.
 */
export function buildPageTitle(opts: {
  title?: string;
  siteName: string;
  titleTemplate: string;
  is404?: boolean;
  absolute?: boolean;
}): string {
  const { title, siteName, titleTemplate, is404, absolute } = opts;
  if (is404) return `404 - Not Found | ${siteName}`;
  if (!title) return siteName;
  if (absolute) return title;
  return titleTemplate.replace("%s", title);
}

/**
 * Truncate a description to a maximum character length, appending "…" if trimmed.
 */
export function buildSafeDescription(description: string, maxLength: number): string {
  if (!description) return description;
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength - 3) + "...";
}

/**
 * Build the value for the <meta name="robots"> tag. Returns the full directive string including
 * max-image-preview for indexable pages.
 */
export function buildRobotsMetaContent(opts: {
  noindex?: boolean;
  is404?: boolean;
  override?: string;
}): string {
  if (opts.override) return opts.override;
  return !opts.noindex && !opts.is404
    ? "index, follow, max-image-preview:large"
    : "noindex, nofollow";
}

/**
 * Build dynamic Open Graph image URL fallback when no explicit image is provided.
 */
export function buildDefaultOgImageUrl(opts: {
  title?: string | undefined;
  description?: string | undefined;
  siteName?: string | undefined;
}): string {
  const params = new URLSearchParams();
  const title = opts.title || opts.siteName;
  if (title) params.set("title", title);
  if (opts.description) params.set("description", opts.description);
  const qs = params.toString();
  return qs ? `/open-graph/card.svg?${qs}` : "/open-graph/card.svg";
}

/**
 * Build a Schema.org WebSite JSON-LD object. Pass the result to JSON.stringify and emit via <script
 * type="application/ld+json">.
 */
export function buildWebSiteSchema(
  config: Pick<SeoConfig, "name" | "url" | "description">,
  site?: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: site ?? config.url,
    description: config.description,
  };
}

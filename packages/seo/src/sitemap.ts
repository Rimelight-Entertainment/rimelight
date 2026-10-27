import { getDefaultLocale, getLocaleInfo, getLocales, getLocaleUrl } from "@rimelight/i18n";
import type { SeoEntry, SitemapUrl } from "./types";

export interface SitemapBuildOptions {
  /** Absolute origin, e.g. "https://rimelight.com" */
  site: string;
  trailingSlash?: "always" | "never";
  privatePathPrefixes?: string[];
}

/**
 * Build fully-resolved sitemap URLs from entries. Locales, prefixes and hreflang tags come from
 * @rimelight/i18n, so sitemap URLs always match the URLs the site serves.
 */
export function buildSitemapUrls(entries: SeoEntry[], options: SitemapBuildOptions): SitemapUrl[] {
  const site = options.site.replace(/\/$/, "");
  const defaultLocale = getDefaultLocale();
  const urls: SitemapUrl[] = [];
  const privatePrefixes = options.privatePathPrefixes;

  for (const entry of entries) {
    if (privatePrefixes && privatePrefixes.length > 0) {
      const normPath = entry.path.startsWith("/") ? entry.path : `/${entry.path}`;
      const isPrivate = privatePrefixes.some((prefix) => {
        const norm = (prefix.startsWith("/") ? prefix : `/${prefix}`).replace(/\/+$/, "");
        return normPath === norm || normPath.startsWith(`${norm}/`);
      });
      if (isPrivate) continue;
    }

    let path = entry.path;
    if (options.trailingSlash === "always" && !path.endsWith("/")) path += "/";
    else if (options.trailingSlash === "never" && path.length > 1) path = path.replace(/\/$/, "");

    const locales = entry.locales?.length ? entry.locales : getLocales();
    const localized = locales.map((locale) => ({ locale, loc: site + getLocaleUrl(path, locale) }));

    const alternates =
      localized.length > 1
        ? [
            ...localized.map((l) => ({ hreflang: getLocaleInfo(l.locale).tag, href: l.loc })),
            ...localized
              .filter((l) => l.locale === defaultLocale)
              .map((l) => ({ hreflang: "x-default", href: l.loc })),
          ]
        : undefined;

    for (const { loc } of localized) {
      urls.push({
        loc,
        ...(entry.lastmod && { lastmod: entry.lastmod.toISOString() }),
        ...(entry.changefreq && { changefreq: entry.changefreq }),
        ...(entry.priority !== undefined && { priority: entry.priority }),
        ...(alternates && { alternates }),
      });
    }
  }

  return urls;
}

/**
 * Build sitemap XML from resolved URLs
 */
export function buildSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map((url) => {
      let xml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;

      if (url.lastmod) {
        xml += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }

      if (url.changefreq) {
        xml += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }

      if (url.priority !== undefined) {
        xml += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }

      if (url.alternates && url.alternates.length > 0) {
        for (const alt of url.alternates) {
          xml += `\n    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />`;
        }
      }

      xml += "\n  </url>";
      return xml;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements}
</urlset>`;
}

/**
 * Build sitemap index XML from sitemap URLs
 */
export function buildSitemapIndexXml(sitemapUrls: string[]): string {
  const sitemapElements = sitemapUrls
    .map((url) => `  <sitemap>\n    <loc>${escapeXml(url)}</loc>\n  </sitemap>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

/**
 * Chunk sitemap URLs into multiple sitemaps (max 50k URLs per sitemap)
 */
export function chunkSitemapUrls(urls: SitemapUrl[], limit: number = 45000): SitemapUrl[][] {
  const chunks: SitemapUrl[][] = [];
  for (let i = 0; i < urls.length; i += limit) {
    chunks.push(urls.slice(i, i + limit));
  }
  return chunks;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

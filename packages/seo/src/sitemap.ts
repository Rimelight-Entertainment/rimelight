import type { LocaleConfig, SeoEntry, SitemapUrl } from "./types.js";

/**
 * Build fully-resolved sitemap URLs from entries and locale config
 */
export function buildSitemapUrls(entries: SeoEntry[], config: LocaleConfig): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const { site, locales, defaultLocale, prefixDefaultLocale, trailingSlash } = config;

  for (const entry of entries) {
    const entryLocales =
      entry.locales && entry.locales.length > 0 ? entry.locales : Object.keys(locales);

    const entryUrls: SitemapUrl[] = [];

    for (const locale of entryLocales) {
      const isDefault = locale === defaultLocale;
      const localePrefix = !isDefault || prefixDefaultLocale ? `/${locale}` : "";

      let path = entry.path;
      if (trailingSlash === "always" && !path.endsWith("/")) {
        path += "/";
      } else if (trailingSlash === "never" && path.endsWith("/")) {
        path = path.replace(/\/$/, "");
      }

      const loc = `${site}${localePrefix}${path}`;

      const item: SitemapUrl = { loc };
      if (entry.lastmod) {
        item.lastmod = entry.lastmod.toISOString();
      }
      if (entry.changefreq) {
        item.changefreq = entry.changefreq;
      }
      if (entry.priority !== undefined) {
        item.priority = entry.priority;
      }
      entryUrls.push(item);
    }

    // Add alternates if multiple locales
    if (entryUrls.length > 1) {
      const defaultUrl = entryUrls.find(
        (u) => u.loc === `${site}${prefixDefaultLocale ? `/${defaultLocale}` : ""}${entry.path}`,
      );

      for (const url of entryUrls) {
        url.alternates = entryUrls
          .filter((u) => u.loc !== url.loc)
          .map((u) => ({
            hreflang: extractHreflang(u.loc, locales, defaultLocale),
            href: u.loc,
          }));

        // Add x-default pointing to default locale
        // x-default should be on the default URL itself, pointing to itself
        if (defaultUrl && url.loc === defaultUrl.loc) {
          url.alternates.push({
            hreflang: "x-default",
            href: defaultUrl.loc,
          });
        }
      }
    }

    urls.push(...entryUrls);
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
    .map(
      (url) => `  <sitemap>
    <loc>${escapeXml(url)}</loc>
  </sitemap>`,
    )
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
 * Extract hreflang from a URL based on locale config
 */
function extractHreflang(
  url: string,
  locales: Record<string, string>,
  defaultLocale: string,
): string {
  for (const [segment, hreflang] of Object.entries(locales)) {
    if (url.includes(`/${segment}/`) || url.endsWith(`/${segment}`)) {
      return hreflang;
    }
  }
  // Default to the first locale's hreflang if no match
  return locales[defaultLocale] || "en";
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

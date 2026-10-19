import type { MiddlewareHandler } from "hono";
import { config as virtualConfig } from "virtual:rimelight-seo";
import type { SeoConfig } from "./types";
import { buildRobotsTxt } from "./robots";
import { buildSitemapXml, buildSitemapIndexXml, buildSitemapUrls } from "./sitemap";
import { buildRssXml } from "./rss";
import { buildLlmsTxt, buildLlmsFullTxt } from "./llms";
import { buildSecurityTxt } from "./security";
import { buildApiCatalog } from "./catalog";
import { buildWebManifest } from "./manifest";
import { handleOgRequest } from "./og";

export type SeoMiddlewareOptions = SeoConfig;

/**
 * Standard Hono middleware for SEO endpoints (/robots.txt, /sitemap.xml, /site.webmanifest, etc.)
 * Reads configuration from virtual:rimelight-seo with optional runtime overrides.
 *
 * @example
 * ```ts
 * import { seo } from "@rimelight/seo/middleware";
 * app.use(seo());
 * ```
 */
export function seo(options: SeoMiddlewareOptions = {}): MiddlewareHandler {
  const baseConfig =
    typeof virtualConfig === "object" && virtualConfig !== null ? virtualConfig : {};

  const config: SeoConfig = {
    ...baseConfig,
    ...options,
    branding: {
      ...baseConfig.branding,
      ...options.branding,
      colors: {
        ...baseConfig.branding?.colors,
        ...options.branding?.colors,
      },
    },
  };

  return async function seoMiddleware(c, next) {
    const rawUrl = c.req.path;
    const origin = config.url ? config.url.replace(/\/$/, "") : new URL(c.req.url).origin;
    const siteName = config.name || "";
    const siteDescription = config.description || "";

    if (rawUrl === "/robots.txt" && config.robots !== false) {
      const robotsOpts = typeof config.robots === "object" ? config.robots : {};
      const robotsTxt = buildRobotsTxt({
        sitemapUrl: `${origin}/sitemap.xml`,
        ...robotsOpts,
      });
      return c.text(robotsTxt, 200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/sitemap.xml" && config.sitemap !== false) {
      const sitemapOpts = typeof config.sitemap === "object" ? config.sitemap : {};
      let urls: any[] = sitemapOpts.urls || [];
      if (urls.length === 0) {
        const entries = config.entries ? await config.entries() : [];
        const locCfg =
          sitemapOpts.locales ||
          (typeof config.locales === "object" && "site" in config.locales
            ? config.locales
            : {
                site: origin,
                locales:
                  typeof config.locales === "object" && !("site" in config.locales)
                    ? config.locales
                    : { en: "en" },
                defaultLocale: "en",
                prefixDefaultLocale: false,
              });
        if (entries.length > 0 && locCfg) {
          urls = buildSitemapUrls(entries, locCfg as any);
        } else {
          urls = [{ loc: `${origin}/` }];
        }
      }
      const sitemapXml = buildSitemapXml(urls);
      return c.text(sitemapXml, 200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/sitemap-index.xml" && config.sitemap !== false) {
      const sitemapIndexXml = buildSitemapIndexXml([`${origin}/sitemap.xml`]);
      return c.text(sitemapIndexXml, 200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/rss.xml" && config.rss !== false && config.rss) {
      const rssOpts = typeof config.rss === "object" ? config.rss : {};
      const items =
        typeof rssOpts.items === "function" ? await rssOpts.items() : rssOpts.items || [];
      const rssXml = buildRssXml({
        ...rssOpts,
        title: rssOpts.title || siteName,
        description: rssOpts.description || siteDescription,
        site: rssOpts.site || origin,
        items,
      });
      return c.text(rssXml, 200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/llms.txt" && config.llms !== false && config.llms) {
      const llmsOpts = typeof config.llms === "object" ? config.llms : {};
      const llmsTxt = buildLlmsTxt({
        ...llmsOpts,
        site: llmsOpts.site || origin,
        title: llmsOpts.title || siteName,
        description: llmsOpts.description || siteDescription,
        pages: llmsOpts.pages || [],
        sections: llmsOpts.sections || [],
      });
      return c.text(llmsTxt, 200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/llms-full.txt" && config.llmsFull !== false && config.llmsFull) {
      const llmsFullOpts = typeof config.llmsFull === "object" ? config.llmsFull : {};
      const llmsFullTxt = buildLlmsFullTxt({
        ...llmsFullOpts,
        site: llmsFullOpts.site || origin,
        title: llmsFullOpts.title || siteName,
        description: llmsFullOpts.description || siteDescription,
        pages: llmsFullOpts.pages || [],
      });
      return c.text(llmsFullTxt, 200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (
      (rawUrl === "/.well-known/security.txt" || rawUrl === "/security.txt") &&
      config.security !== false
    ) {
      const secOpts = typeof config.security === "object" ? config.security : {};
      const contact = secOpts.contact || (config.email ? `mailto:${config.email}` : undefined);
      if (!contact && !secOpts.canonical && !secOpts.expires) {
        return next();
      }
      const securityTxt = buildSecurityTxt({
        contact: contact || "",
        ...secOpts,
      });
      return c.text(securityTxt, 200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/.well-known/api-catalog" && config.apiCatalog !== false && config.apiCatalog) {
      const apiOpts = typeof config.apiCatalog === "object" ? config.apiCatalog : {};
      const apiCatalog = buildApiCatalog({
        items: apiOpts.items || [],
      });
      return c.json(apiCatalog, 200, {
        "Content-Type": "application/linkset+json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl === "/site.webmanifest" && config.manifest !== false) {
      const manOpts = typeof config.manifest === "object" ? config.manifest : {};
      const manifestBg = manOpts.backgroundColor || config.branding?.colors?.backgroundColor;
      const thColor = manOpts.themeColor || config.branding?.colors?.themeColor;
      const manifest = buildWebManifest({
        name: manOpts.name || siteName,
        shortName: manOpts.shortName || siteName,
        description: manOpts.description || siteDescription,
        startUrl: manOpts.startUrl || "/",
        ...(manifestBg && { backgroundColor: manifestBg }),
        ...(thColor && { themeColor: thColor }),
        ...(manOpts.icons
          ? { icons: manOpts.icons }
          : config.branding?.icons
            ? { icons: config.branding.icons }
            : config.branding?.favicon
              ? {
                  icons: [
                    {
                      src:
                        typeof config.branding.favicon === "string"
                          ? config.branding.favicon.startsWith("<svg")
                            ? "/favicon.svg"
                            : config.branding.favicon
                          : config.branding.favicon.svg ||
                            config.branding.favicon.png ||
                            "/favicon.svg",
                      sizes: "any",
                      type: "image/svg+xml",
                      purpose: "any",
                    },
                  ],
                }
              : {}),
        ...manOpts,
      });
      return c.json(manifest, 200, {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
    }

    if (rawUrl.startsWith("/open-graph/") && config.og !== false) {
      const ogOpts = typeof config.og === "object" ? config.og : {};
      return handleOgRequest(c.req.raw, {
        brand: ogOpts.brand || siteName,
        ...ogOpts,
      });
    }

    if (rawUrl === "/favicon.svg" && config.assets !== false) {
      const bg = config.branding?.colors?.backgroundColor || "#0a0a0a";
      const fg = config.branding?.colors?.themeColor || "#ffffff";
      const initial = (siteName[0] || "A").toUpperCase();
      const svg =
        typeof config.branding?.favicon === "string" && config.branding.favicon.startsWith("<svg")
          ? config.branding.favicon
          : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="128" fill="${bg}" /><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="280" font-weight="700" fill="${fg}">${initial}</text></svg>`;
      return c.text(svg, 200, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      });
    }

    await next();
    if ((c.res?.headers.get("content-type") || "").includes("text/html")) {
      const links = [
        config.sitemap !== false && `<${origin}/sitemap-index.xml>; rel="sitemap"`,
        config.llms && `<${origin}/llms.txt>; rel="llms"`,
        config.apiCatalog && `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
        config.rss && `<${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`,
      ].filter(Boolean);
      if (links.length) c.header("Link", links.join(", "));
    }
  };
}

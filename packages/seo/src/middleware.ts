import type { MiddlewareHandler } from "hono";
import { config as virtualConfig } from "virtual:rimelight-seo";
import type { SeoConfig } from "./types";
import { buildRobotsTxt } from "./robots";
import { buildSitemapXml, buildSitemapIndexXml, buildSitemapUrls } from "./sitemap";
import { buildRssXml } from "./rss";
import { buildLlmsTxt, buildLlmsFullTxt } from "./llms";
import { buildApiCatalog } from "./catalog";
import { buildWebManifest } from "./manifest";
import { handleOgRequest } from "./og";

export type SeoMiddlewareOptions = SeoConfig;

const DEFAULT_PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/admin",
  "/cms",
  "/internal",
  "/api",
  "/dev",
  "/og",
  "/open-graph",
  "/auth",
  "/cdn-cgi",
];

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
    const privatePrefixes = config.privatePathPrefixes ?? DEFAULT_PRIVATE_PATH_PREFIXES;

    if (rawUrl === "/robots.txt" && config.robots !== false) {
      const robotsOpts = typeof config.robots === "object" ? config.robots : {};
      const disallow = robotsOpts.disallow !== undefined ? robotsOpts.disallow : privatePrefixes;
      const robotsTxt = buildRobotsTxt({
        sitemapUrl: `${origin}/sitemap.xml`,
        ...robotsOpts,
        disallow,
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
        urls =
          entries.length > 0
            ? buildSitemapUrls(entries, {
                site: origin,
                ...(sitemapOpts.trailingSlash && { trailingSlash: sitemapOpts.trailingSlash }),
                privatePathPrefixes: privatePrefixes,
              })
            : [];
        if (urls.length === 0) {
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
      const ogComponents = (virtualConfig as any)?.ogComponents || {};
      const layouts: Record<string, any> = { ...ogOpts.layouts };

      if (ogOpts.routes) {
        for (const compPath of Object.values(ogOpts.routes)) {
          const mod = ogComponents[compPath];
          const component = mod?.default || (mod && Object.values(mod)[0]);
          if (component) {
            const match = compPath.match(/\/([^/]+?)(?:OgCard|Og)?\.(?:tsx|ts)$/);
            const layoutKey = match?.[1] ? match[1].toLowerCase() : compPath;
            layouts[layoutKey] = component;
          }
        }
      }

      const res = handleOgRequest(c.req.raw, {
        brand: siteName,
        layouts,
        ...ogOpts,
      });
      if (res) return res;
    }

    if (rawUrl === "/favicon.ico" && config.branding?.favicon) {
      const icoUrl =
        typeof config.branding.favicon === "object" ? config.branding.favicon.ico : undefined;
      if (icoUrl) {
        return c.redirect(icoUrl, 301);
      }
    }

    if (rawUrl === "/favicon.svg" && config.branding) {
      const svg =
        typeof config.branding.favicon === "string" && config.branding.favicon.startsWith("<svg")
          ? config.branding.favicon
          : undefined;
      if (svg) {
        return c.text(svg, 200, {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        });
      }

      const mark = siteName.charAt(0).toUpperCase() || "R";
      const bg = config.branding.colors?.backgroundColor || "#0a0a0a";
      const fg = config.branding.colors?.themeColor || "#ffffff";
      const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${bg}"/><text x="16" y="22" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="${fg}" text-anchor="middle">${mark}</text></svg>`;
      return c.text(defaultSvg, 200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      });
    }

    return next();
  };
}

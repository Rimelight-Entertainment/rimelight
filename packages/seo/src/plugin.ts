import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import type { SeoConfig, SiteConfig } from "./types";
import { buildRobotsTxt } from "./robots";
import { buildSitemapXml, buildSitemapIndexXml, buildSitemapUrls } from "./sitemap";
import { buildRssXml } from "./rss";
import { buildLlmsTxt, buildLlmsFullTxt } from "./llms";
import { buildSecurityTxt } from "./security";
import { buildApiCatalog } from "./catalog";
import { buildWebManifest } from "./manifest";
import { generateIco, generatePng, generateMaskablePng, generateOgCard } from "./assets";

const VIRTUAL_ID = "virtual:rimelight-seo";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const VIRTUAL_SERVER_ID = "virtual:rimelight-seo/server";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/**
 * Validates that a requested file path resolves strictly within the given root directory.
 * Dereferences symlinks via fs.realpathSync to prevent path traversal breakouts.
 */
export function isContained(rootDir: string, requestedPath: string): boolean {
  try {
    const realRoot = fs.realpathSync(path.resolve(rootDir));
    const realPath = fs.realpathSync(path.resolve(rootDir, requestedPath));
    return realPath.startsWith(realRoot + path.sep) || realPath === realRoot;
  } catch {
    return false;
  }
}

function createDefaultIconSvg(
  name = "App",
  background = "#0a0a0a",
  foreground = "#ffffff",
): string {
  const initial = (name.trim()[0] || "A").toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="${background}" />
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="280" font-weight="700" fill="${foreground}">${initial}</text>
</svg>`;
}

/**
 * Consolidated Vite Plugin orchestrating SEO in-memory virtual modules,
 * dev-server asset middleware, and production static asset generation.
 */
export function seo(options: SeoConfig = {}): Plugin {
  let rootDir = process.cwd();

  const siteOpt = options.site || {};
  const authorHandle = options.authorHandle || siteOpt.seo?.authorHandle;
  const ogImage = options.ogImage || siteOpt.ogImage;
  const normalizedSiteConfig: SiteConfig = {
    id: options.id || siteOpt.id || "rimelight",
    name: options.name || siteOpt.name || "Rimelight",
    description: options.description || siteOpt.description || "",
    url: options.url || siteOpt.url || "https://rimelight.com",
    ...(ogImage !== undefined && { ogImage }),
    author: options.author || siteOpt.author || options.name || siteOpt.name || "Rimelight",
    email: options.email || siteOpt.email || "support@rimelight.com",
    branding: {
      logo: {
        alt:
          options.branding?.logo?.alt ||
          siteOpt.branding?.logo?.alt ||
          options.name ||
          siteOpt.name ||
          "Logo",
        ...siteOpt.branding?.logo,
        ...options.branding?.logo,
      },
      colors: {
        themeColor:
          options.branding?.colors?.themeColor || siteOpt.branding?.colors?.themeColor || "#ffffff",
        backgroundColor:
          options.branding?.colors?.backgroundColor ||
          siteOpt.branding?.colors?.backgroundColor ||
          "#0a0a0a",
      },
      ...siteOpt.branding,
      ...options.branding,
    },
    seo: {
      ...siteOpt.seo,
      titleTemplate:
        options.titleTemplate ||
        siteOpt.seo?.titleTemplate ||
        (options.name ? `%s | ${options.name}` : "%s | Rimelight"),
      maxDescriptionLength:
        options.maxDescriptionLength || siteOpt.seo?.maxDescriptionLength || 160,
      ...(authorHandle !== undefined && { authorHandle }),
    },
    ...(siteOpt.openGraph || options.openGraph
      ? { openGraph: { ...siteOpt.openGraph, ...options.openGraph } }
      : {}),
    ...(siteOpt.twitter || options.twitter
      ? { twitter: { ...siteOpt.twitter, ...options.twitter } }
      : {}),
  };

  const seoLocales = options.locales;
  const privatePathPrefixes = options.privatePathPrefixes || [];

  const findFile = (candidates: string[]): string | null => {
    for (const c of candidates) {
      const resolved = path.resolve(rootDir, c);
      if (fs.existsSync(resolved)) return resolved;
    }
    return null;
  };

  const assetOpts = typeof options.assets === "object" ? options.assets : {};
  let masterIconBuffer: Buffer | null = null;
  let masterIconSource: Buffer | string | null = null;
  let isSvg = false;
  const bgColor =
    assetOpts.backgroundColor || normalizedSiteConfig.branding.colors.backgroundColor || "#ffffff";

  function resolveIcons() {
    const candidateIcon =
      assetOpts.icon ||
      (typeof options.branding?.favicon === "object"
        ? options.branding.favicon.svg || options.branding.favicon.png
        : options.branding?.favicon) ||
      options.branding?.appleTouchIcon ||
      options.branding?.icon ||
      options.branding?.logo?.src ||
      (typeof siteOpt.branding?.favicon === "object"
        ? siteOpt.branding.favicon.svg || siteOpt.branding.favicon.png
        : siteOpt.branding?.favicon) ||
      siteOpt.branding?.appleTouchIcon ||
      siteOpt.branding?.icon ||
      siteOpt.branding?.logo?.src;

    if (candidateIcon) {
      if (
        typeof candidateIcon === "string" &&
        (candidateIcon.startsWith("http://") ||
          candidateIcon.startsWith("https://") ||
          candidateIcon.startsWith("data:") ||
          candidateIcon.startsWith("<svg"))
      ) {
        masterIconSource = candidateIcon;
        isSvg =
          candidateIcon.includes("<svg") ||
          candidateIcon.includes(".svg") ||
          candidateIcon.startsWith("data:image/svg");
      } else if (typeof candidateIcon === "string") {
        const resolvedPath = path.resolve(rootDir, candidateIcon);
        if (fs.existsSync(resolvedPath) && isContained(rootDir, resolvedPath)) {
          masterIconBuffer = fs.readFileSync(resolvedPath);
          masterIconSource = masterIconBuffer;
          isSvg = resolvedPath.endsWith(".svg");
        }
      }
    }

    if (!masterIconSource) {
      const masterIconPath = findFile([
        "src/assets/logos/logomark_color.svg",
        "src/assets/logos/logo_color.svg",
        "src/assets/logos/logomark.svg",
        "src/assets/logos/logo.svg",
        "src/assets/icon.svg",
        "src/assets/logo.svg",
        "src/assets/icon.png",
        "public/favicon.svg",
      ]);

      if (masterIconPath && fs.existsSync(masterIconPath)) {
        masterIconBuffer = fs.readFileSync(masterIconPath);
        masterIconSource = masterIconBuffer;
        isSvg = masterIconPath.endsWith(".svg");
      }
    }

    if (!masterIconSource && options.assets !== false) {
      masterIconSource = createDefaultIconSvg(
        normalizedSiteConfig.name,
        bgColor,
        normalizedSiteConfig.branding.colors.themeColor || "#ffffff",
      );
      isSvg = true;
    }
  }

  return {
    name: "rimelight:seo",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return [
          `import { createSeoHead, defineSeoConfig } from "@rimelight/seo/head";`,
          `export const siteConfig = ${JSON.stringify(normalizedSiteConfig)};`,
          `export const SEO_LOCALES = ${JSON.stringify(seoLocales)};`,
          `export const PRIVATE_PATH_PREFIXES = ${JSON.stringify(privatePathPrefixes)};`,
          `export const seoConfig = { SEO_LOCALES: ${JSON.stringify(seoLocales)}, PRIVATE_PATH_PREFIXES: ${JSON.stringify(privatePathPrefixes)} };`,
          `export const createHead = defineSeoConfig(siteConfig);`,
          `export { createHead as createSeoHead, defineSeoConfig };`,
          `export default siteConfig;`,
        ].join("\n");
      }

      if (id === RESOLVED_VIRTUAL_SERVER_ID) {
        resolveIcons();
        const b64 = masterIconBuffer ? masterIconBuffer.toString("base64") : null;
        return [
          `const b64 = ${JSON.stringify(b64)};`,
          `export const masterIconBuffer = b64 ? (typeof Buffer !== "undefined" ? Buffer.from(b64, "base64") : Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))) : null;`,
          `export const isSvg = ${JSON.stringify(isSvg)};`,
          `export const backgroundColor = ${JSON.stringify(bgColor)};`,
          `export const db = null;`,
          `export const corpusPages = [];`,
          `export default { masterIconBuffer, isSvg, backgroundColor, db, corpusPages };`,
        ].join("\n");
      }

      return null;
    },

    configResolved(config) {
      rootDir = config.root || process.cwd();
      resolveIcons();
    },

    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const rawUrl = req.url?.split("?")[0] || "";

        if (rawUrl === "/robots.txt" && options.robots !== false) {
          const robotsOpts = typeof options.robots === "object" ? options.robots : {};
          const siteUrl = normalizedSiteConfig.url || "https://rimelight.com";
          const robotsTxt = buildRobotsTxt({
            sitemapUrl: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
            ...robotsOpts,
          });
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(robotsTxt);
          return;
        }

        if (rawUrl === "/sitemap.xml" && options.sitemap !== false) {
          const sitemapOpts = typeof options.sitemap === "object" ? options.sitemap : {};
          const siteUrl = normalizedSiteConfig.url || "https://rimelight.com";
          let urls: any[] = sitemapOpts.urls || [];
          if (urls.length === 0) {
            const entries = options.entries ? await options.entries() : [];
            const locCfg =
              sitemapOpts.locales ||
              (typeof options.locales === "object" && "site" in options.locales
                ? options.locales
                : {
                    site: siteUrl,
                    locales:
                      typeof options.locales === "object" && !("site" in options.locales)
                        ? options.locales
                        : { en: "en" },
                    defaultLocale: "en",
                    prefixDefaultLocale: false,
                  });
            if (entries.length > 0 && locCfg) {
              urls = buildSitemapUrls(entries, locCfg as any);
            } else {
              urls = [{ loc: `${siteUrl.replace(/\/$/, "")}/` }];
            }
          }
          const sitemapXml = buildSitemapXml(urls);
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(sitemapXml);
          return;
        }

        if (rawUrl === "/sitemap-index.xml" && options.sitemap !== false) {
          const siteUrl = normalizedSiteConfig.url || "https://rimelight.com";
          const sitemapIndexXml = buildSitemapIndexXml([
            `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
          ]);
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(sitemapIndexXml);
          return;
        }

        if (rawUrl === "/rss.xml" && options.rss !== false) {
          const rssOpts = typeof options.rss === "object" ? options.rss : {};
          const items =
            typeof rssOpts.items === "function" ? await rssOpts.items() : rssOpts.items || [];
          const rssXml = buildRssXml({
            ...rssOpts,
            title: rssOpts.title || normalizedSiteConfig.name,
            description: rssOpts.description || normalizedSiteConfig.description,
            site: rssOpts.site || normalizedSiteConfig.url,
            items,
          });
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(rssXml);
          return;
        }

        if (rawUrl === "/llms.txt" && options.llms !== false) {
          const llmsOpts = typeof options.llms === "object" ? options.llms : {};
          const llmsTxt = buildLlmsTxt({
            ...llmsOpts,
            site: llmsOpts.site || normalizedSiteConfig.url,
            title: llmsOpts.title || normalizedSiteConfig.name,
            description: llmsOpts.description || normalizedSiteConfig.description,
            pages: llmsOpts.pages || [],
            sections: llmsOpts.sections || [],
          });
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(llmsTxt);
          return;
        }

        if (rawUrl === "/llms-full.txt" && options.llmsFull !== false) {
          const llmsFullOpts = typeof options.llmsFull === "object" ? options.llmsFull : {};
          const llmsFullTxt = buildLlmsFullTxt({
            ...llmsFullOpts,
            site: llmsFullOpts.site || normalizedSiteConfig.url,
            title: llmsFullOpts.title || normalizedSiteConfig.name,
            description: llmsFullOpts.description || normalizedSiteConfig.description,
            pages: llmsFullOpts.pages || [],
          });
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(llmsFullTxt);
          return;
        }

        if (
          (rawUrl === "/.well-known/security.txt" || rawUrl === "/security.txt") &&
          options.security !== false
        ) {
          const secOpts = typeof options.security === "object" ? options.security : {};
          const securityTxt = buildSecurityTxt({
            contact: secOpts.contact || `mailto:${normalizedSiteConfig.email}`,
            ...secOpts,
          });
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(securityTxt);
          return;
        }

        if (rawUrl === "/.well-known/api-catalog" && options.apiCatalog !== false) {
          const apiOpts = typeof options.apiCatalog === "object" ? options.apiCatalog : {};
          const apiCatalog = buildApiCatalog({
            items: apiOpts.items || [],
          });
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(JSON.stringify(apiCatalog, null, 2));
          return;
        }

        if (rawUrl === "/site.webmanifest" && options.manifest !== false) {
          const manOpts = typeof options.manifest === "object" ? options.manifest : {};
          const manifest = buildWebManifest({
            name: manOpts.name || normalizedSiteConfig.name,
            shortName: manOpts.shortName || normalizedSiteConfig.name,
            description: manOpts.description || normalizedSiteConfig.description,
            startUrl: manOpts.startUrl || "/",
            backgroundColor:
              manOpts.backgroundColor || normalizedSiteConfig.branding.colors.backgroundColor,
            themeColor: manOpts.themeColor || normalizedSiteConfig.branding.colors.themeColor,
            icons: manOpts.icons || [
              { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
              {
                src: "/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
              },
            ],
            ...manOpts,
          });
          res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          res.end(JSON.stringify(manifest, null, 2));
          return;
        }

        if (masterIconSource && options.assets !== false) {
          try {
            if (rawUrl === "/favicon.ico" && assetOpts.faviconIco !== false) {
              const ico = await generateIco(masterIconSource, 32);
              res.setHeader("Content-Type", "image/x-icon");
              res.setHeader("Cache-Control", "no-cache");
              res.end(ico);
              return;
            }
            if (rawUrl === "/apple-touch-icon.png" && assetOpts.appleTouchIcon !== false) {
              const png = await generatePng(masterIconSource, { width: 180, height: 180 });
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "no-cache");
              res.end(png);
              return;
            }
            if (rawUrl === "/icon-192.png" && assetOpts.icon192 !== false) {
              const png = await generatePng(masterIconSource, { width: 192, height: 192 });
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "no-cache");
              res.end(png);
              return;
            }
            if (rawUrl === "/icon-512.png" && assetOpts.icon512 !== false) {
              const png = await generatePng(masterIconSource, { width: 512, height: 512 });
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "no-cache");
              res.end(png);
              return;
            }
            if (rawUrl === "/icon-maskable-512.png" && assetOpts.iconMaskable !== false) {
              const png = await generateMaskablePng(masterIconSource, {
                size: 512,
                background: bgColor,
              });
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "no-cache");
              res.end(png);
              return;
            }
            if (rawUrl === "/favicon.svg" && isSvg) {
              res.setHeader("Content-Type", "image/svg+xml");
              res.setHeader("Cache-Control", "no-cache");
              if (Buffer.isBuffer(masterIconSource)) {
                res.end(masterIconSource);
              } else if (
                typeof masterIconSource === "string" &&
                (masterIconSource.startsWith("http://") || masterIconSource.startsWith("https://"))
              ) {
                const fetched = await fetch(masterIconSource);
                const buf = Buffer.from(await fetched.arrayBuffer());
                res.end(buf);
              } else {
                res.end(Buffer.from(masterIconSource));
              }
              return;
            }
            if (rawUrl === "/og.png" && assetOpts.ogImage !== false) {
              const og = await generateOgCard({
                logoBuffer: masterIconSource,
                background: bgColor,
              });
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "no-cache");
              res.end(og);
              return;
            }
          } catch (err) {
            console.error("[@rimelight/seo] Error generating dynamic asset for", rawUrl, err);
          }
        }

        next();
      });
    },

    async generateBundle() {
      if (options.robots !== false) {
        const robotsOpts = typeof options.robots === "object" ? options.robots : {};
        const siteUrl = normalizedSiteConfig.url || "https://rimelight.com";
        const robotsTxt = buildRobotsTxt({
          sitemapUrl: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
          ...robotsOpts,
        });
        this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt });
      }

      if (options.sitemap !== false) {
        const sitemapOpts = typeof options.sitemap === "object" ? options.sitemap : {};
        const siteUrl = normalizedSiteConfig.url || "https://rimelight.com";
        let urls: any[] = sitemapOpts.urls || [];
        if (urls.length === 0) {
          const entries = options.entries ? await options.entries() : [];
          const locCfg =
            sitemapOpts.locales ||
            (typeof options.locales === "object" && "site" in options.locales
              ? options.locales
              : {
                  site: siteUrl,
                  locales:
                    typeof options.locales === "object" && !("site" in options.locales)
                      ? options.locales
                      : { en: "en" },
                  defaultLocale: "en",
                  prefixDefaultLocale: false,
                });
          if (entries.length > 0 && locCfg) {
            urls = buildSitemapUrls(entries, locCfg as any);
          } else {
            urls = [{ loc: `${siteUrl.replace(/\/$/, "")}/` }];
          }
        }
        const sitemapXml = buildSitemapXml(urls);
        this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml });

        const sitemapIndexXml = buildSitemapIndexXml([`${siteUrl.replace(/\/$/, "")}/sitemap.xml`]);
        this.emitFile({ type: "asset", fileName: "sitemap-index.xml", source: sitemapIndexXml });
      }

      if (options.rss !== false && typeof options.rss === "object") {
        const rssOpts = options.rss;
        const items =
          typeof rssOpts.items === "function" ? await rssOpts.items() : rssOpts.items || [];
        if (items.length > 0) {
          const rssXml = buildRssXml({
            ...rssOpts,
            title: rssOpts.title || normalizedSiteConfig.name,
            description: rssOpts.description || normalizedSiteConfig.description,
            site: rssOpts.site || normalizedSiteConfig.url,
            items,
          });
          this.emitFile({ type: "asset", fileName: "rss.xml", source: rssXml });
        }
      }

      if (options.llms !== false && typeof options.llms === "object") {
        const llmsOpts = options.llms;
        const llmsTxt = buildLlmsTxt({
          ...llmsOpts,
          site: llmsOpts.site || normalizedSiteConfig.url,
          title: llmsOpts.title || normalizedSiteConfig.name,
          description: llmsOpts.description || normalizedSiteConfig.description,
          pages: llmsOpts.pages || [],
          sections: llmsOpts.sections || [],
        });
        this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsTxt });
      }

      if (options.llmsFull !== false && typeof options.llmsFull === "object") {
        const llmsFullOpts = options.llmsFull;
        const llmsFullTxt = buildLlmsFullTxt({
          ...llmsFullOpts,
          site: llmsFullOpts.site || normalizedSiteConfig.url,
          title: llmsFullOpts.title || normalizedSiteConfig.name,
          description: llmsFullOpts.description || normalizedSiteConfig.description,
          pages: llmsFullOpts.pages || [],
        });
        this.emitFile({ type: "asset", fileName: "llms-full.txt", source: llmsFullTxt });
      }

      if (options.security !== false) {
        const secOpts = typeof options.security === "object" ? options.security : {};
        const securityTxt = buildSecurityTxt({
          contact: secOpts.contact || `mailto:${normalizedSiteConfig.email}`,
          ...secOpts,
        });
        this.emitFile({ type: "asset", fileName: ".well-known/security.txt", source: securityTxt });
        if (secOpts.legacyRoute !== false) {
          this.emitFile({ type: "asset", fileName: "security.txt", source: securityTxt });
        }
      }

      if (options.apiCatalog !== false && typeof options.apiCatalog === "object") {
        const apiOpts = options.apiCatalog;
        const apiCatalog = buildApiCatalog({
          items: apiOpts.items || [],
        });
        this.emitFile({
          type: "asset",
          fileName: ".well-known/api-catalog",
          source: JSON.stringify(apiCatalog, null, 2),
        });
      }

      if (options.manifest !== false) {
        const manOpts = typeof options.manifest === "object" ? options.manifest : {};
        const manifest = buildWebManifest({
          name: manOpts.name || normalizedSiteConfig.name,
          shortName: manOpts.shortName || normalizedSiteConfig.name,
          description: manOpts.description || normalizedSiteConfig.description,
          startUrl: manOpts.startUrl || "/",
          backgroundColor:
            manOpts.backgroundColor || normalizedSiteConfig.branding.colors.backgroundColor,
          themeColor: manOpts.themeColor || normalizedSiteConfig.branding.colors.themeColor,
          icons: manOpts.icons || [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          ...manOpts,
        });
        this.emitFile({
          type: "asset",
          fileName: "site.webmanifest",
          source: JSON.stringify(manifest, null, 2),
        });
      }

      if (options.assets !== false && masterIconSource) {
        try {
          if (assetOpts.faviconIco !== false) {
            const ico = await generateIco(masterIconSource, 32);
            this.emitFile({ type: "asset", fileName: "favicon.ico", source: ico });
          }
          if (assetOpts.appleTouchIcon !== false) {
            const png = await generatePng(masterIconSource, { width: 180, height: 180 });
            this.emitFile({ type: "asset", fileName: "apple-touch-icon.png", source: png });
          }
          if (assetOpts.icon192 !== false) {
            const png = await generatePng(masterIconSource, { width: 192, height: 192 });
            this.emitFile({ type: "asset", fileName: "icon-192.png", source: png });
          }
          if (assetOpts.icon512 !== false) {
            const png = await generatePng(masterIconSource, { width: 512, height: 512 });
            this.emitFile({ type: "asset", fileName: "icon-512.png", source: png });
          }
          if (assetOpts.iconMaskable !== false) {
            const png = await generateMaskablePng(masterIconSource, {
              size: 512,
              background: bgColor,
            });
            this.emitFile({ type: "asset", fileName: "icon-maskable-512.png", source: png });
          }
          if (assetOpts.ogImage !== false) {
            const og = await generateOgCard({
              logoBuffer: masterIconSource,
              background: bgColor,
            });
            this.emitFile({ type: "asset", fileName: "og.png", source: og });
          }
          if (isSvg) {
            if (Buffer.isBuffer(masterIconSource)) {
              this.emitFile({ type: "asset", fileName: "favicon.svg", source: masterIconSource });
            } else if (
              typeof masterIconSource === "string" &&
              (masterIconSource.startsWith("http://") || masterIconSource.startsWith("https://"))
            ) {
              const response = await fetch(masterIconSource);
              const buf = Buffer.from(await response.arrayBuffer());
              this.emitFile({ type: "asset", fileName: "favicon.svg", source: buf });
            } else if (typeof masterIconSource === "string") {
              this.emitFile({ type: "asset", fileName: "favicon.svg", source: masterIconSource });
            }
          }
        } catch (err) {
          console.error("[@rimelight/seo] Error emitting bundle assets:", err);
        }
      }
    },
  };
}

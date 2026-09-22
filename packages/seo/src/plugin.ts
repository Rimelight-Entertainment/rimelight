import fs from "node:fs"
import path from "node:path"
import type { RimelightSeoOptions, SiteConfig } from "./types.js"
import { buildRobotsTxt } from "./robots.js"
import { buildSitemapXml, buildSitemapIndexXml, buildSitemapUrls } from "./sitemap.js"
import { buildRssXml } from "./rss.js"
import { buildLlmsTxt, buildLlmsFullTxt } from "./llms.js"
import { buildSecurityTxt } from "./security.js"
import { buildApiCatalog } from "./catalog.js"
import { buildWebManifest } from "./manifest.js"
import { generateIco, generatePng, generateMaskablePng, generateOgCard } from "./assets.js"

export interface RimelightSeoPlugin {
  name: string
  enforce?: "pre" | "post"
  configResolved?: (config: any) => void
  resolveId?: (id: string) => string | null | undefined
  load?: (id: string) => string | null | undefined
  configureServer?: (server: any) => void
  generateBundle?: (this: any) => Promise<void> | void
  [key: string]: any
}

export { type RimelightSeoOptions } from "./types.js"

const VIRTUAL_SEO = "virtual:rimelight/seo"
const RESOLVED_VIRTUAL_SEO = `\0${VIRTUAL_SEO}`

const VIRTUAL_SEO_SERVER = "virtual:rimelight/seo/server"
const RESOLVED_VIRTUAL_SEO_SERVER = `\0${VIRTUAL_SEO_SERVER}`

/**
 * Validates that a requested file path resolves strictly within the given root directory.
 * Dereferences symlinks via fs.realpathSync to prevent path traversal breakouts.
 */
export function isContained(rootDir: string, requestedPath: string): boolean {
  try {
    const realRoot = fs.realpathSync(path.resolve(rootDir))
    const realPath = fs.realpathSync(path.resolve(rootDir, requestedPath))
    return realPath.startsWith(realRoot + path.sep) || realPath === realRoot
  } catch {
    return false
  }
}

/**
 * Single Consolidated Vite Plugin orchestrating SEO virtual modules, dev-server asset middleware,
 * and production static asset generation.
 */
export function rimelightSeo(options: RimelightSeoOptions = {}): RimelightSeoPlugin {
  let rootDir = process.cwd()

  // Resolve configuration according to priority:
  // 1. Explicit top-level fields in RimelightSeoOptions
  // 2. Fields in options.site
  // 3. Package defaults
  const siteOpt = options.site || {}
  const authorHandle = options.authorHandle || siteOpt.seo?.authorHandle
  const ogImage = options.ogImage || siteOpt.ogImage
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
        ...options.branding?.logo
      },
      colors: {
        themeColor:
          options.branding?.colors?.themeColor || siteOpt.branding?.colors?.themeColor || "#ffffff",
        backgroundColor:
          options.branding?.colors?.backgroundColor ||
          siteOpt.branding?.colors?.backgroundColor ||
          "#0a0a0a"
      },
      ...siteOpt.branding,
      ...options.branding
    },
    seo: {
      ...siteOpt.seo,
      titleTemplate:
        options.titleTemplate ||
        siteOpt.seo?.titleTemplate ||
        (options.name ? `%s | ${options.name}` : "%s | Rimelight"),
      maxDescriptionLength:
        options.maxDescriptionLength || siteOpt.seo?.maxDescriptionLength || 160,
      ...(authorHandle !== undefined && { authorHandle })
    },
    ...(siteOpt.openGraph || options.openGraph
      ? { openGraph: { ...siteOpt.openGraph, ...options.openGraph } }
      : {}),
    ...(siteOpt.twitter || options.twitter
      ? { twitter: { ...siteOpt.twitter, ...options.twitter } }
      : {})
  }

  const seoLocales = options.locales
  const privatePathPrefixes = options.privatePathPrefixes || []

  // File discovery helpers
  const findFile = (candidates: string[]): string | null => {
    for (const c of candidates) {
      const resolved = path.resolve(rootDir, c)
      if (fs.existsSync(resolved)) return resolved
    }
    return null
  }

  const assetOpts = typeof options.assets === "object" ? options.assets : {}
  let masterIconBuffer: Buffer | null = null
  let isSvg = false
  const bgColor =
    assetOpts.backgroundColor || normalizedSiteConfig.branding.colors.backgroundColor || "#ffffff"

  return {
    name: "rimelight:seo",
    configResolved(config) {
      rootDir = config.root || process.cwd()

      // Discover master icon
      const explicitIcon = assetOpts.icon ? path.resolve(rootDir, assetOpts.icon) : null
      let masterIconPath: string | null = null

      if (explicitIcon && fs.existsSync(explicitIcon)) {
        if (isContained(rootDir, explicitIcon)) {
          masterIconPath = explicitIcon
        }
      } else {
        masterIconPath = findFile([
          "src/assets/logos/logomark_color.svg",
          "src/assets/logos/logo_color.svg",
          "src/assets/logos/logomark.svg",
          "src/assets/logos/logo.svg",
          "src/assets/icon.svg",
          "src/assets/logo.svg",
          "src/assets/icon.png",
          "public/favicon.svg"
        ])
      }

      if (masterIconPath && fs.existsSync(masterIconPath)) {
        masterIconBuffer = fs.readFileSync(masterIconPath)
        isSvg = masterIconPath.endsWith(".svg")
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_SEO) return RESOLVED_VIRTUAL_SEO
      if (id === VIRTUAL_SEO_SERVER) return RESOLVED_VIRTUAL_SEO_SERVER

      // Backwards-compatible legacy virtual IDs
      if (
        id === "virtual:rimelight-seo-config" ||
        id === "virtual:rimelight-seo/options" ||
        id === "virtual:rimelight-seo/config" ||
        id === "virtual:rimelight-seo/site-config" ||
        id === "virtual:rimelight-seo/db" ||
        id === "virtual:rimelight-seo/corpus" ||
        id === "virtual:rimelight-seo/assets"
      ) {
        return `\0${id}`
      }
      return null
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_SEO || id === "\0virtual:rimelight-seo/site-config") {
        return `import { createSeoHead, defineSeoConfig } from "@rimelight/seo";

export const siteConfig = ${JSON.stringify(normalizedSiteConfig)};
export const SEO_LOCALES = ${JSON.stringify(seoLocales)};
export const PRIVATE_PATH_PREFIXES = ${JSON.stringify(privatePathPrefixes)};
export const seoConfig = {
  SEO_LOCALES: ${JSON.stringify(seoLocales)},
  PRIVATE_PATH_PREFIXES: ${JSON.stringify(privatePathPrefixes)}
};

export const createHead = defineSeoConfig(siteConfig);
export { createHead as createSeoHead, defineSeoConfig };
export default siteConfig;`
      }

      if (id === RESOLVED_VIRTUAL_SEO_SERVER) {
        const dbPath = findFile(["src/db/index.ts", "src/db/index.js", "src/db/index.mjs"])
        const corpusPath = findFile([
          "src/config/llms.corpus.ts",
          "src/config/llms.corpus.js",
          "src/config/llms.corpus.mjs"
        ])
        const b64 = masterIconBuffer ? masterIconBuffer.toString("base64") : null

        return `const b64 = ${JSON.stringify(b64)};
export const masterIconBuffer = b64 ? (typeof Buffer !== "undefined" ? Buffer.from(b64, "base64") : Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))) : null;
export const isSvg = ${JSON.stringify(isSvg)};
export const backgroundColor = ${JSON.stringify(bgColor)};
export const db = ${dbPath ? `await import(${JSON.stringify(dbPath)})` : "null"};
export const corpusPages = ${corpusPath ? `(await import(${JSON.stringify(corpusPath)})).corpusPages || []` : "[]"};`
      }

      // Legacy module support
      if (id === "\0virtual:rimelight-seo-config" || id === "\0virtual:rimelight-seo/config") {
        return `export const SEO_LOCALES = ${JSON.stringify(seoLocales)};
export const PRIVATE_PATH_PREFIXES = ${JSON.stringify(privatePathPrefixes)};
export const seoEntries = async () => [];
export const rssEntries = undefined;
export default { SEO_LOCALES: ${JSON.stringify(seoLocales)}, PRIVATE_PATH_PREFIXES: ${JSON.stringify(privatePathPrefixes)} };`
      }

      if (id === "\0virtual:rimelight-seo/options") {
        return `export default ${JSON.stringify(options)};`
      }

      if (id === "\0virtual:rimelight-seo/assets") {
        const b64 = masterIconBuffer ? masterIconBuffer.toString("base64") : null
        return `const b64 = ${JSON.stringify(b64)};
export const masterIconBuffer = b64 ? (typeof Buffer !== "undefined" ? Buffer.from(b64, "base64") : Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))) : null;
export const isSvg = ${JSON.stringify(isSvg)};
export const backgroundColor = ${JSON.stringify(bgColor)};`
      }

      if (id === "\0virtual:rimelight-seo/db") {
        const dbPath = findFile(["src/db/index.ts", "src/db/index.js", "src/db/index.mjs"])
        if (dbPath) return `export * from ${JSON.stringify(dbPath)};`
        return `export const db = null;\nexport const pages = null;`
      }

      if (id === "\0virtual:rimelight-seo/corpus") {
        const corpusPath = findFile([
          "src/config/llms.corpus.ts",
          "src/config/llms.corpus.js",
          "src/config/llms.corpus.mjs"
        ])
        if (corpusPath) return `export * from ${JSON.stringify(corpusPath)};`
        return `export const corpusPages = [];`
      }

      return null
    },

    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const rawUrl = req.url?.split("?")[0] || ""

        // robots.txt
        if (rawUrl === "/robots.txt" && options.robots !== false) {
          const robotsOpts = typeof options.robots === "object" ? options.robots : {}
          const siteUrl = normalizedSiteConfig.url || "https://rimelight.com"
          const robotsTxt = buildRobotsTxt({
            sitemapUrl: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
            ...robotsOpts
          })
          res.setHeader("Content-Type", "text/plain; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(robotsTxt)
          return
        }

        // sitemap.xml
        if (rawUrl === "/sitemap.xml" && options.sitemap !== false) {
          const sitemapOpts = typeof options.sitemap === "object" ? options.sitemap : {}
          const siteUrl = normalizedSiteConfig.url || "https://rimelight.com"
          let urls: any[] = sitemapOpts.urls || []
          if (urls.length === 0) {
            const entries = options.entries ? await options.entries() : []
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
                    prefixDefaultLocale: false
                  })
            if (entries.length > 0 && locCfg) {
              urls = buildSitemapUrls(entries, locCfg as any)
            } else {
              urls = [{ loc: `${siteUrl.replace(/\/$/, "")}/` }]
            }
          }
          const sitemapXml = buildSitemapXml(urls)
          res.setHeader("Content-Type", "application/xml; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(sitemapXml)
          return
        }

        // sitemap-index.xml
        if (rawUrl === "/sitemap-index.xml" && options.sitemap !== false) {
          const siteUrl = normalizedSiteConfig.url || "https://rimelight.com"
          const sitemapIndexXml = buildSitemapIndexXml([
            `${siteUrl.replace(/\/$/, "")}/sitemap.xml`
          ])
          res.setHeader("Content-Type", "application/xml; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(sitemapIndexXml)
          return
        }

        // rss.xml
        if (rawUrl === "/rss.xml" && options.rss !== false) {
          const rssOpts = typeof options.rss === "object" ? options.rss : {}
          const items =
            typeof rssOpts.items === "function" ? await rssOpts.items() : rssOpts.items || []
          const rssXml = buildRssXml({
            ...rssOpts,
            title: rssOpts.title || normalizedSiteConfig.name,
            description: rssOpts.description || normalizedSiteConfig.description,
            site: rssOpts.site || normalizedSiteConfig.url,
            items
          })
          res.setHeader("Content-Type", "application/xml; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(rssXml)
          return
        }

        // llms.txt
        if (rawUrl === "/llms.txt" && options.llms !== false) {
          const llmsOpts = typeof options.llms === "object" ? options.llms : {}
          const llmsTxt = buildLlmsTxt({
            ...llmsOpts,
            site: llmsOpts.site || normalizedSiteConfig.url,
            title: llmsOpts.title || normalizedSiteConfig.name,
            description: llmsOpts.description || normalizedSiteConfig.description,
            pages: llmsOpts.pages || [],
            sections: llmsOpts.sections || []
          })
          res.setHeader("Content-Type", "text/plain; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(llmsTxt)
          return
        }

        // llms-full.txt
        if (rawUrl === "/llms-full.txt" && options.llmsFull !== false) {
          const llmsFullOpts = typeof options.llmsFull === "object" ? options.llmsFull : {}
          const llmsFullTxt = buildLlmsFullTxt({
            ...llmsFullOpts,
            site: llmsFullOpts.site || normalizedSiteConfig.url,
            title: llmsFullOpts.title || normalizedSiteConfig.name,
            description: llmsFullOpts.description || normalizedSiteConfig.description,
            pages: llmsFullOpts.pages || []
          })
          res.setHeader("Content-Type", "text/plain; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(llmsFullTxt)
          return
        }

        // security.txt
        if (
          (rawUrl === "/.well-known/security.txt" || rawUrl === "/security.txt") &&
          options.security !== false
        ) {
          const secOpts = typeof options.security === "object" ? options.security : {}
          const securityTxt = buildSecurityTxt({
            contact: secOpts.contact || `mailto:${normalizedSiteConfig.email}`,
            ...secOpts
          })
          res.setHeader("Content-Type", "text/plain; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(securityTxt)
          return
        }

        // api-catalog
        if (rawUrl === "/.well-known/api-catalog" && options.apiCatalog !== false) {
          const apiOpts = typeof options.apiCatalog === "object" ? options.apiCatalog : {}
          const apiCatalog = buildApiCatalog({
            items: apiOpts.items || []
          })
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(JSON.stringify(apiCatalog, null, 2))
          return
        }

        // site.webmanifest
        if (rawUrl === "/site.webmanifest" && options.manifest !== false) {
          const manOpts = typeof options.manifest === "object" ? options.manifest : {}
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
                purpose: "maskable"
              }
            ],
            ...manOpts
          })
          res.setHeader("Content-Type", "application/manifest+json; charset=utf-8")
          res.setHeader("Cache-Control", "no-cache")
          res.end(JSON.stringify(manifest, null, 2))
          return
        }

        // Dynamic Icons & Images middleware
        if (masterIconBuffer && options.assets !== false) {
          if (rawUrl === "/favicon.ico" && assetOpts.faviconIco !== false) {
            const ico = await generateIco(masterIconBuffer, 32)
            res.setHeader("Content-Type", "image/x-icon")
            res.setHeader("Cache-Control", "no-cache")
            res.end(ico)
            return
          }
          if (rawUrl === "/apple-touch-icon.png" && assetOpts.appleTouchIcon !== false) {
            const png = await generatePng(masterIconBuffer, { width: 180, height: 180 })
            res.setHeader("Content-Type", "image/png")
            res.setHeader("Cache-Control", "no-cache")
            res.end(png)
            return
          }
          if (rawUrl === "/icon-192.png" && assetOpts.icon192 !== false) {
            const png = await generatePng(masterIconBuffer, { width: 192, height: 192 })
            res.setHeader("Content-Type", "image/png")
            res.setHeader("Cache-Control", "no-cache")
            res.end(png)
            return
          }
          if (rawUrl === "/icon-512.png" && assetOpts.icon512 !== false) {
            const png = await generatePng(masterIconBuffer, { width: 512, height: 512 })
            res.setHeader("Content-Type", "image/png")
            res.setHeader("Cache-Control", "no-cache")
            res.end(png)
            return
          }
          if (rawUrl === "/icon-maskable-512.png" && assetOpts.iconMaskable !== false) {
            const png = await generateMaskablePng(masterIconBuffer, {
              size: 512,
              background: bgColor
            })
            res.setHeader("Content-Type", "image/png")
            res.setHeader("Cache-Control", "no-cache")
            res.end(png)
            return
          }
          if (rawUrl === "/favicon.svg" && isSvg) {
            res.setHeader("Content-Type", "image/svg+xml")
            res.setHeader("Cache-Control", "no-cache")
            res.end(masterIconBuffer)
            return
          }
          if (rawUrl === "/og.png" && assetOpts.ogImage !== false) {
            const og = await generateOgCard({
              logoBuffer: masterIconBuffer,
              background: bgColor
            })
            res.setHeader("Content-Type", "image/png")
            res.setHeader("Cache-Control", "no-cache")
            res.end(og)
            return
          }
        }

        next()
      })
    },

    async generateBundle() {
      // Build-time asset emission
      if (options.robots !== false) {
        const robotsOpts = typeof options.robots === "object" ? options.robots : {}
        const siteUrl = normalizedSiteConfig.url || "https://rimelight.com"
        const robotsTxt = buildRobotsTxt({
          sitemapUrl: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
          ...robotsOpts
        })
        this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt })
      }

      if (options.sitemap !== false) {
        const sitemapOpts = typeof options.sitemap === "object" ? options.sitemap : {}
        const siteUrl = normalizedSiteConfig.url || "https://rimelight.com"
        let urls: any[] = sitemapOpts.urls || []
        if (urls.length === 0) {
          const entries = options.entries ? await options.entries() : []
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
                  prefixDefaultLocale: false
                })
          if (entries.length > 0 && locCfg) {
            urls = buildSitemapUrls(entries, locCfg as any)
          } else {
            urls = [{ loc: `${siteUrl.replace(/\/$/, "")}/` }]
          }
        }
        const sitemapXml = buildSitemapXml(urls)
        this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml })

        const sitemapIndexXml = buildSitemapIndexXml([`${siteUrl.replace(/\/$/, "")}/sitemap.xml`])
        this.emitFile({ type: "asset", fileName: "sitemap-index.xml", source: sitemapIndexXml })
      }

      if (options.rss !== false && typeof options.rss === "object") {
        const rssOpts = options.rss
        const items =
          typeof rssOpts.items === "function" ? await rssOpts.items() : rssOpts.items || []
        if (items.length > 0) {
          const rssXml = buildRssXml({
            ...rssOpts,
            title: rssOpts.title || normalizedSiteConfig.name,
            description: rssOpts.description || normalizedSiteConfig.description,
            site: rssOpts.site || normalizedSiteConfig.url,
            items
          })
          this.emitFile({ type: "asset", fileName: "rss.xml", source: rssXml })
        }
      }

      if (options.llms !== false && typeof options.llms === "object") {
        const llmsOpts = options.llms
        const llmsTxt = buildLlmsTxt({
          ...llmsOpts,
          site: llmsOpts.site || normalizedSiteConfig.url,
          title: llmsOpts.title || normalizedSiteConfig.name,
          description: llmsOpts.description || normalizedSiteConfig.description,
          pages: llmsOpts.pages || [],
          sections: llmsOpts.sections || []
        })
        this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsTxt })
      }

      if (options.llmsFull !== false && typeof options.llmsFull === "object") {
        const llmsFullOpts = options.llmsFull
        const llmsFullTxt = buildLlmsFullTxt({
          ...llmsFullOpts,
          site: llmsFullOpts.site || normalizedSiteConfig.url,
          title: llmsFullOpts.title || normalizedSiteConfig.name,
          description: llmsFullOpts.description || normalizedSiteConfig.description,
          pages: llmsFullOpts.pages || []
        })
        this.emitFile({ type: "asset", fileName: "llms-full.txt", source: llmsFullTxt })
      }

      if (options.security !== false) {
        const secOpts = typeof options.security === "object" ? options.security : {}
        const securityTxt = buildSecurityTxt({
          contact: secOpts.contact || `mailto:${normalizedSiteConfig.email}`,
          ...secOpts
        })
        this.emitFile({ type: "asset", fileName: ".well-known/security.txt", source: securityTxt })
        if (secOpts.legacyRoute !== false) {
          this.emitFile({ type: "asset", fileName: "security.txt", source: securityTxt })
        }
      }

      if (options.apiCatalog !== false && typeof options.apiCatalog === "object") {
        const apiOpts = options.apiCatalog
        const apiCatalog = buildApiCatalog({
          items: apiOpts.items || []
        })
        this.emitFile({
          type: "asset",
          fileName: ".well-known/api-catalog",
          source: JSON.stringify(apiCatalog, null, 2)
        })
      }

      if (options.manifest !== false) {
        const manOpts = typeof options.manifest === "object" ? options.manifest : {}
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
              purpose: "maskable"
            }
          ],
          ...manOpts
        })
        this.emitFile({
          type: "asset",
          fileName: "site.webmanifest",
          source: JSON.stringify(manifest, null, 2)
        })
      }

      // Icon & Image Assets
      if (options.assets !== false && masterIconBuffer) {
        if (assetOpts.faviconIco !== false) {
          const ico = await generateIco(masterIconBuffer, 32)
          this.emitFile({ type: "asset", fileName: "favicon.ico", source: ico })
        }
        if (assetOpts.appleTouchIcon !== false) {
          const png = await generatePng(masterIconBuffer, { width: 180, height: 180 })
          this.emitFile({ type: "asset", fileName: "apple-touch-icon.png", source: png })
        }
        if (assetOpts.icon192 !== false) {
          const png = await generatePng(masterIconBuffer, { width: 192, height: 192 })
          this.emitFile({ type: "asset", fileName: "icon-192.png", source: png })
        }
        if (assetOpts.icon512 !== false) {
          const png = await generatePng(masterIconBuffer, { width: 512, height: 512 })
          this.emitFile({ type: "asset", fileName: "icon-512.png", source: png })
        }
        if (assetOpts.iconMaskable !== false) {
          const png = await generateMaskablePng(masterIconBuffer, {
            size: 512,
            background: bgColor
          })
          this.emitFile({ type: "asset", fileName: "icon-maskable-512.png", source: png })
        }
        if (assetOpts.ogImage !== false) {
          const og = await generateOgCard({
            logoBuffer: masterIconBuffer,
            background: bgColor
          })
          this.emitFile({ type: "asset", fileName: "og.png", source: og })
        }
        if (isSvg) {
          this.emitFile({ type: "asset", fileName: "favicon.svg", source: masterIconBuffer })
        }
      }
    }
  }
}

export default rimelightSeo

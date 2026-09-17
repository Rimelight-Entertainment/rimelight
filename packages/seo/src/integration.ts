import type { AstroIntegration } from "astro"
import path from "node:path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import type { RimelightSeoOptions } from "./types.js"
import { generateIco, generatePng, generateMaskablePng, generateOgCard } from "./assets.js"

export { type RimelightSeoOptions } from "./types.js"

export function rimelightSeo(options: RimelightSeoOptions = {}): AstroIntegration {
  return {
    name: "@rimelight/seo",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig, config }) => {
        const rootDir = fileURLToPath(config.root)

        // Resolve site files
        const findFile = (candidates: string[]): string | null => {
          for (const c of candidates) {
            const resolved = path.resolve(rootDir, c)
            if (fs.existsSync(resolved)) return resolved
          }
          return null
        }

        const siteOpt = options.site || {}
        const normalizedSiteConfig = {
          id: siteOpt.id || options.id || "",
          name: siteOpt.name || options.name || "",
          description: siteOpt.description || options.description || "",
          url: siteOpt.url || options.url || "",
          ogImage: siteOpt.ogImage || options.ogImage || undefined,
          author: siteOpt.author || options.author || siteOpt.name || options.name || "",
          email: siteOpt.email || options.email || "",
          branding: {
            logo: {
              alt:
                siteOpt.branding?.logo?.alt ||
                options.branding?.logo?.alt ||
                siteOpt.name ||
                options.name ||
                ""
            },
            colors: {
              themeColor:
                siteOpt.branding?.colors?.themeColor ||
                options.branding?.colors?.themeColor ||
                "#ffffff",
              backgroundColor:
                siteOpt.branding?.colors?.backgroundColor ||
                options.branding?.colors?.backgroundColor ||
                "#ffffff"
            },
            ...siteOpt.branding,
            ...options.branding
          },
          seo: {
            titleTemplate:
              siteOpt.seo?.titleTemplate ||
              options.titleTemplate ||
              (options.name ? `%s | ${options.name}` : "%s"),
            maxDescriptionLength:
              siteOpt.seo?.maxDescriptionLength || options.maxDescriptionLength || 160,
            authorHandle: siteOpt.seo?.authorHandle || options.authorHandle || undefined,
            ...siteOpt.seo
          },
          ...(siteOpt.openGraph || options.openGraph
            ? { openGraph: siteOpt.openGraph || options.openGraph }
            : {}),
          ...(siteOpt.twitter || options.twitter
            ? { twitter: siteOpt.twitter || options.twitter }
            : {})
        }

        const seoLocales = options.locales
        const privatePathPrefixes = options.privatePathPrefixes || []

        const dbPath = findFile(["src/db/index.ts", "src/db/index.js", "src/db/index.mjs"])

        const corpusPath = findFile([
          "src/config/llms.corpus.ts",
          "src/config/llms.corpus.js",
          "src/config/llms.corpus.mjs"
        ])

        // Master Icon Discovery for dynamic public asset generation
        const assetOpts = typeof options.assets === "object" ? options.assets : {}
        const explicitIcon = assetOpts.icon ? path.resolve(rootDir, assetOpts.icon) : null
        const masterIconPath =
          explicitIcon && fs.existsSync(explicitIcon)
            ? explicitIcon
            : findFile([
                "src/assets/logos/logomark_color.svg",
                "src/assets/logos/logo_color.svg",
                "src/assets/logos/logomark.svg",
                "src/assets/logos/logo.svg",
                "src/assets/icon.svg",
                "src/assets/logo.svg",
                "src/assets/icon.png",
                "public/favicon.svg"
              ])

        let masterIconBuffer: Buffer | null = null
        let isSvg = false
        if (masterIconPath && fs.existsSync(masterIconPath)) {
          masterIconBuffer = fs.readFileSync(masterIconPath)
          isSvg = masterIconPath.endsWith(".svg")
        }

        const bgColor = assetOpts.backgroundColor || "#ffffff"

        // Inject standard routes
        if (options.robots !== false) {
          const pattern =
            typeof options.robots === "object" && options.robots.path
              ? options.robots.path
              : "/robots.txt"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/robots.txt.ts"
          })
        }

        if (options.sitemap !== false) {
          const pattern =
            typeof options.sitemap === "object" && options.sitemap.path
              ? options.sitemap.path
              : "/sitemap.xml"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/sitemap.xml.ts"
          })
        }

        if (options.rss !== false) {
          const pattern =
            typeof options.rss === "object" && options.rss.path ? options.rss.path : "/rss.xml"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/rss.xml.ts"
          })
        }

        if (options.llms !== false) {
          const pattern =
            typeof options.llms === "object" && options.llms.path ? options.llms.path : "/llms.txt"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/llms.txt.ts"
          })
        }

        if (options.llmsFull !== false) {
          const pattern =
            typeof options.llmsFull === "object" && options.llmsFull.path
              ? options.llmsFull.path
              : "/llms-full.txt"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/llms-full.txt.ts"
          })
        }

        if (options.security !== false) {
          const pattern =
            typeof options.security === "object" && options.security.path
              ? options.security.path
              : "/.well-known/security.txt"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/security.txt.ts"
          })

          const legacyRoute =
            typeof options.security === "object" ? options.security.legacyRoute !== false : true
          if (legacyRoute && pattern === "/.well-known/security.txt") {
            injectRoute({
              pattern: "/security.txt",
              entrypoint: "@rimelight/seo/routes/security.txt.ts"
            })
          }
        }

        if (options.apiCatalog !== false) {
          const pattern =
            typeof options.apiCatalog === "object" && options.apiCatalog.path
              ? options.apiCatalog.path
              : "/.well-known/api-catalog"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/api-catalog.ts"
          })
        }

        if (options.manifest !== false) {
          const pattern =
            typeof options.manifest === "object" && options.manifest.path
              ? options.manifest.path
              : "/site.webmanifest"
          injectRoute({
            pattern,
            entrypoint: "@rimelight/seo/routes/site.webmanifest.ts"
          })
        }

        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-rimelight-seo-assets",
                configureServer(server) {
                  if (!masterIconBuffer) return
                  server.middlewares.use(async (req, res, next) => {
                    const url = req.url?.split("?")[0]
                    if (url === "/favicon.ico" && assetOpts.faviconIco !== false) {
                      const ico = await generateIco(masterIconBuffer, 32)
                      res.setHeader("Content-Type", "image/x-icon")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(ico)
                      return
                    }
                    if (url === "/apple-touch-icon.png" && assetOpts.appleTouchIcon !== false) {
                      const png = await generatePng(masterIconBuffer, { width: 180, height: 180 })
                      res.setHeader("Content-Type", "image/png")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(png)
                      return
                    }
                    if (url === "/icon-192.png" && assetOpts.icon192 !== false) {
                      const png = await generatePng(masterIconBuffer, { width: 192, height: 192 })
                      res.setHeader("Content-Type", "image/png")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(png)
                      return
                    }
                    if (url === "/icon-512.png" && assetOpts.icon512 !== false) {
                      const png = await generatePng(masterIconBuffer, { width: 512, height: 512 })
                      res.setHeader("Content-Type", "image/png")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(png)
                      return
                    }
                    if (url === "/icon-maskable-512.png" && assetOpts.iconMaskable !== false) {
                      const png = await generateMaskablePng(masterIconBuffer, {
                        size: 512,
                        background: bgColor
                      })
                      res.setHeader("Content-Type", "image/png")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(png)
                      return
                    }
                    if (url === "/favicon.svg" && isSvg) {
                      res.setHeader("Content-Type", "image/svg+xml")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(masterIconBuffer)
                      return
                    }
                    if (url === "/og.png" && assetOpts.ogImage !== false) {
                      const og = await generateOgCard({
                        logoBuffer: masterIconBuffer,
                        background: bgColor
                      })
                      res.setHeader("Content-Type", "image/png")
                      res.setHeader("Cache-Control", "no-cache")
                      res.end(og)
                      return
                    }
                    next()
                  })
                },
                async generateBundle() {
                  if (options.assets === false || !masterIconBuffer) return

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
                    this.emitFile({
                      type: "asset",
                      fileName: "icon-maskable-512.png",
                      source: png
                    })
                  }
                  if (assetOpts.ogImage !== false) {
                    const og = await generateOgCard({
                      logoBuffer: masterIconBuffer,
                      background: bgColor
                    })
                    this.emitFile({
                      type: "asset",
                      fileName: "og.png",
                      source: og
                    })
                  }
                  if (isSvg) {
                    this.emitFile({
                      type: "asset",
                      fileName: "favicon.svg",
                      source: masterIconBuffer
                    })
                  }
                }
              },
              {
                name: "vite-plugin-rimelight-seo",
                resolveId(id) {
                  if (
                    id === "virtual:rimelight-seo-config" ||
                    id === "virtual:rimelight-seo/options"
                  ) {
                    return "\0virtual:rimelight-seo/options"
                  }
                  if (id === "virtual:rimelight/seo") {
                    return "\0virtual:rimelight/seo"
                  }
                  if (id === "virtual:rimelight-seo/config") {
                    return "\0virtual:rimelight-seo/config"
                  }
                  if (id === "virtual:rimelight-seo/site-config") {
                    return "\0virtual:rimelight-seo/site-config"
                  }
                  if (id === "virtual:rimelight-seo/db") {
                    return "\0virtual:rimelight-seo/db"
                  }
                  if (id === "virtual:rimelight-seo/corpus") {
                    return "\0virtual:rimelight-seo/corpus"
                  }
                  return null
                },
                load(id) {
                  if (id === "\0virtual:rimelight-seo/options") {
                    return `export default ${JSON.stringify(options)};`
                  }
                  if (id === "\0virtual:rimelight/seo") {
                    return `export const siteConfig = ${JSON.stringify(normalizedSiteConfig)};
export const SEO_LOCALES = ${JSON.stringify(seoLocales)};
export const PRIVATE_PATH_PREFIXES = ${JSON.stringify(privatePathPrefixes)};
export const seoConfig = {
  SEO_LOCALES: ${JSON.stringify(seoLocales)},
  PRIVATE_PATH_PREFIXES: ${JSON.stringify(privatePathPrefixes)}
};
export default siteConfig;`
                  }
                  if (id === "\0virtual:rimelight-seo/config") {
                    return `export const SEO_LOCALES = ${JSON.stringify(seoLocales)};
export const PRIVATE_PATH_PREFIXES = ${JSON.stringify(privatePathPrefixes)};
export const seoEntries = async () => [];
export const rssEntries = undefined;
export default { SEO_LOCALES: ${JSON.stringify(seoLocales)}, PRIVATE_PATH_PREFIXES: ${JSON.stringify(privatePathPrefixes)} };`
                  }
                  if (id === "\0virtual:rimelight-seo/site-config") {
                    return `export const siteConfig = ${JSON.stringify(normalizedSiteConfig)};
export default siteConfig;`
                  }
                  if (id === "\0virtual:rimelight-seo/db") {
                    if (dbPath) {
                      return `export * from ${JSON.stringify(dbPath)};`
                    }
                    return `export const db = null;
export const pages = null;`
                  }
                  if (id === "\0virtual:rimelight-seo/corpus") {
                    if (corpusPath) {
                      return `export * from ${JSON.stringify(corpusPath)};`
                    }
                    return `export const corpusPages = [];`
                  }
                  return null
                }
              }
            ]
          }
        })
      }
    }
  }
}

export default rimelightSeo

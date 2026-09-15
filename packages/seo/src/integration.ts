import type { AstroIntegration } from "astro"
import path from "node:path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import type { RimelightSeoOptions } from "./types.js"

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

        const seoConfigPath = findFile([
          "src/config/seo.config.ts",
          "src/config/seo.config.js",
          "src/config/seo.config.mjs"
        ])

        const siteConfigPath = findFile([
          "src/config/site.config.ts",
          "src/config/site.config.js",
          "src/config/site.config.mjs"
        ])

        const dbPath = findFile(["src/db/index.ts", "src/db/index.js", "src/db/index.mjs"])

        const corpusPath = findFile([
          "src/config/llms.corpus.ts",
          "src/config/llms.corpus.js",
          "src/config/llms.corpus.mjs"
        ])

        // Inject routes
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
                name: "vite-plugin-rimelight-seo",
                resolveId(id) {
                  if (
                    id === "virtual:rimelight-seo-config" ||
                    id === "virtual:rimelight-seo/options"
                  ) {
                    return "\0virtual:rimelight-seo/options"
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
                  if (id === "\0virtual:rimelight-seo/config") {
                    if (seoConfigPath) {
                      return `import * as customConfig from ${JSON.stringify(seoConfigPath)};
export const SEO_LOCALES = customConfig.SEO_LOCALES;
export const PRIVATE_PATH_PREFIXES = customConfig.PRIVATE_PATH_PREFIXES || [];
export const seoEntries = customConfig.seoEntries;
export const rssEntries = customConfig.rssEntries;
export default customConfig;`
                    }
                    return `export const SEO_LOCALES = undefined;
export const PRIVATE_PATH_PREFIXES = [];
export const seoEntries = async () => [];
export const rssEntries = undefined;`
                  }
                  if (id === "\0virtual:rimelight-seo/site-config") {
                    if (siteConfigPath) {
                      return `export * from ${JSON.stringify(siteConfigPath)};`
                    }
                    return `export const siteConfig = { name: "Site", description: "", url: "" };`
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

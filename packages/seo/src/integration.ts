import type { AstroIntegration } from "astro"
import type { RobotsOptions, SitemapUrl, LlmsTxtOptions } from "./types.js"

export interface RimelightSeoOptions {
  /**
   * Sitemap configuration or false to disable automatic /sitemap.xml
   */
  sitemap?:
    | boolean
    | {
        urls?: SitemapUrl[]
        [key: string]: any
      }
  /**
   * Robots.txt configuration or false to disable automatic /robots.txt
   */
  robots?: boolean | RobotsOptions
  /**
   * LLMs.txt configuration or false to disable automatic /llms.txt
   */
  llms?: boolean | LlmsTxtOptions
}

export function rimelightSeo(options: RimelightSeoOptions = {}): AstroIntegration {
  return {
    name: "@rimelight/seo",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig }) => {
        if (options.robots !== false) {
          injectRoute({
            pattern: "/robots.txt",
            entrypoint: "@rimelight/seo/routes/robots.txt.ts"
          })
        }

        if (options.sitemap !== false) {
          injectRoute({
            pattern: "/sitemap.xml",
            entrypoint: "@rimelight/seo/routes/sitemap.xml.ts"
          })
        }

        if (options.llms !== false) {
          injectRoute({
            pattern: "/llms.txt",
            entrypoint: "@rimelight/seo/routes/llms.txt.ts"
          })
        }

        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-rimelight-seo",
                resolveId(id) {
                  if (id === "virtual:rimelight-seo-config") {
                    return "\0virtual:rimelight-seo-config"
                  }
                  return null
                },
                load(id) {
                  if (id === "\0virtual:rimelight-seo-config") {
                    return `export default ${JSON.stringify(options)};`
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

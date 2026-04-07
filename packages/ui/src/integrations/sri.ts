import type { AstroIntegration } from "astro"
import { createHash } from "node:crypto"

interface SRIConfig {
  security?: {
    csp?: {
      scriptDirective?: {
        resources?: string[]
      }
    }
  }
}

function assertSRIConfig(obj: unknown): asserts obj is SRIConfig {
  if (!obj || typeof obj !== "object") throw new Error("Expected config")
}

/**
 * Astro SRI Integration Fetches external scripts at build-time and generates hashes for the SSR
 * middleware.
 */
export function sri(): AstroIntegration {
  const sriManifest: Record<string, string> = {}

  return {
    name: "sri",
    hooks: {
      "astro:config:setup": async ({ updateConfig, config, logger }) => {
        logger.info("Initializing SRI Discovery...")

        // 1. Identify External Scripts from CSP config
        // We look into the custom 'security' block in astro.config.mjs
        assertSRIConfig(config)

        const security = config.security
        const externalUrls: string[] = []

        if (security?.csp?.scriptDirective?.resources) {
          for (const resource of security.csp.scriptDirective.resources) {
            if (resource.startsWith("https://")) {
              externalUrls.push(resource)
            }
          }
        }

        // 2. Fetch and Hash External Scripts
        await Promise.all(
          externalUrls.map(async (url) => {
            try {
              logger.info(`Fetching ${url} for SRI hashing...`)
              const response = await fetch(url)
              if (!response.ok) throw new Error(`HTTP ${response.status}`)

              const buffer = await response.arrayBuffer()
              const hash = createHash("sha384").update(Buffer.from(buffer)).digest("base64")

              sriManifest[url] = `sha384-${hash}`
              logger.info(`Successfully hashed ${url}`)
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err)
              logger.error(`Failed to fetch SRI for ${url}: ${message}`)
            }
          })
        )

        // 3. Provide hashes to the runtime via Vite's virtual module
        const virtualModuleId = "virtual:sri-manifest"
        const resolvedVirtualModuleId = "\0" + virtualModuleId

        updateConfig({
          vite: {
            plugins: [
              {
                name: "vite-plugin-sri-manifest",
                resolveId(id: string) {
                  if (id === virtualModuleId) return resolvedVirtualModuleId
                  return null
                },
                load(id: string) {
                  if (id === resolvedVirtualModuleId) {
                    return `export const manifest = ${JSON.stringify(sriManifest)};`
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

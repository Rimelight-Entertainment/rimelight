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
    name: "@rimelight/security",
    hooks: {
      "astro:config:setup": async ({ updateConfig, config, command, logger }) => {
        const isDev = command === "dev"

        if (isDev) {
          logger.info("Skipping SRI discovery in development mode.")
        } else {
          // 1. Identify External Scripts from CSP config
          // We look into the custom 'security' block in astro.config.mjs
          assertSRIConfig(config)

          const security = config.security
          const externalUrls: string[] = []

          if (security?.csp?.scriptDirective?.resources) {
            for (const resource of security.csp.scriptDirective.resources) {
              if (resource.startsWith("https://")) {
                try {
                  const parsed = new URL(resource)
                  // Skip wildcard domains
                  if (parsed.hostname.includes("*")) continue

                  // Skip root domains or directories (no actual script/style file)
                  const path = parsed.pathname
                  if (path === "/" || path === "" || path.endsWith("/")) continue

                  externalUrls.push(resource)
                } catch {
                  // Skip invalid URLs
                }
              }
            }
          }

          if (externalUrls.length > 0) {
            // 2. Fetch and Hash External Scripts
            const results = await Promise.all(
              externalUrls.map(async (url) => {
                try {
                  const response = await fetch(url)
                  if (!response.ok) throw new Error(`HTTP ${response.status}`)

                  const buffer = await response.arrayBuffer()
                  const hash = createHash("sha384").update(Buffer.from(buffer)).digest("base64")

                  sriManifest[url] = `sha384-${hash}`
                  return { url, success: true }
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : String(err)
                  return { url, success: false, error: message }
                }
              })
            )

            const succeeded = results.filter((r) => r.success).map((r) => r.url)
            const failed = results.filter((r) => !r.success)

            if (failed.length === 0) {
              logger.info(
                `SRI Discovery: successfully hashed ${succeeded.length} external resource(s).\n` +
                  `      Succeeded:\n` +
                  succeeded.map((url) => `      - ${url}`).join("\n")
              )
            } else {
              const succeededBlock =
                succeeded.length > 0
                  ? `      Succeeded:\n` + succeeded.map((url) => `      - ${url}`).join("\n")
                  : ""
              const failedBlock =
                `      Failed:\n` + failed.map((f) => `      - ${f.url} (${f.error})`).join("\n")

              const parts = [
                `SRI Discovery: hashed ${succeeded.length}/${results.length} external resource(s).`,
                succeededBlock,
                failedBlock
              ].filter(Boolean)

              logger.warn(parts.join("\n\n"))
            }
          } else {
            logger.info("SRI Discovery: no external resources found to hash.")
          }
        }

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

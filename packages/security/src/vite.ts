import { createHash } from "node:crypto"

export interface RimelightSecurityPlugin {
  name: string
  enforce?: "pre" | "post"
  resolveId?: (id: string) => string | null | undefined
  load?: (id: string) => string | null | undefined
  buildStart?: () => Promise<void> | void
  generateBundle?: (options: any, bundle: Record<string, any>) => Promise<void> | void
  [key: string]: any
}

export interface SecurityPluginOptions {
  /**
   * Additional external script/style URLs to fetch and hash for SRI at build time.
   */
  resources?: string[]
}

const DEFAULT_RESOURCES = [
  "https://betterlytics.io/analytics.js"
]

function hashContent(buffer: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = createHash("sha384").update(buffer as any).digest("base64")
  return `sha384-${hash}`
}

/**
 * Pure Vite Security & SRI Plugin.
 * 1. Fetches and hashes external 3rd-party scripts/styles at build time.
 * 2. Emits SRI hashes for locally bundled JS/CSS chunks (Nuxt-security style).
 * 3. Exposes virtual:sri-manifest with a unified URL -> hash mapping.
 */
export function security(options: SecurityPluginOptions = {}): RimelightSecurityPlugin {
  const sriManifest: Record<string, string> = {}
  const externalUrls = Array.from(new Set([...DEFAULT_RESOURCES, ...(options.resources || [])]))

  const virtualModuleId = "virtual:sri-manifest"
  const resolvedVirtualModuleId = "\0" + virtualModuleId

  return {
    name: "vite-plugin-rimelight-security",
    enforce: "post",

    async buildStart() {
      // 1. Fetch & Hash External Resources (3rd-party SRI)
      if (process.env.NODE_ENV === "development") return

      await Promise.all(
        externalUrls.map(async (url) => {
          if (!url.startsWith("https://")) return
          try {
            const parsed = new URL(url)
            if (parsed.hostname.includes("*")) return
            const pathname = parsed.pathname
            if (pathname === "/" || pathname === "" || pathname.endsWith("/")) return

            const response = await fetch(url)
            if (!response.ok) return
            const buffer = await response.arrayBuffer()
            sriManifest[url] = hashContent(buffer)
          } catch {
            // Silently ignore unreachable external resources during build
          }
        })
      )
    },

    generateBundle(_outputOptions, bundle) {
      // 2. Hash Emitted Bundle Chunks & Assets (1st-party SRI)
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!fileName.endsWith(".js") && !fileName.endsWith(".css")) continue

        let content: string | Uint8Array | undefined
        if (chunk.type === "chunk") {
          content = chunk.code
        } else if (chunk.type === "asset") {
          content = chunk.source
        }

        if (content) {
          const hash = hashContent(content)
          // Store both absolute leading slash path and relative file name
          sriManifest[`/${fileName.replace(/^\/+/, "")}`] = hash
          sriManifest[fileName] = hash
        }
      }
    },

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
}

export { security as sri }

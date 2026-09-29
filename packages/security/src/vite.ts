import { createHash } from "node:crypto"
import type { Plugin } from "vite-plus"

import type { SecurityOptions } from "./types"

export type RimelightSecurityPlugin = Plugin

export interface SecurityPluginOptions extends SecurityOptions {
  /**
   * Additional external script/style URLs to fetch and hash for SRI at build time.
   */
  resources?: string[]
}

function hashContent(buffer: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = createHash("sha384")
    .update(buffer as any)
    .digest("base64")
  return `sha384-${hash}`
}

/**
 * Pure Vite Security & SRI Plugin. 1. Accepts framework-agnostic security options (domain, imgSrc,
 * etc.) and exposes virtual:rimelight-security-config. 2. Fetches and hashes external 3rd-party
 * scripts/styles at build time. 3. Emits SRI hashes for locally bundled JS/CSS chunks
 * (Nuxt-security style). 4. Exposes virtual:sri-manifest with a unified URL -> hash mapping.
 */
export function security(options: SecurityPluginOptions = {}): RimelightSecurityPlugin {
  const sriManifest: Record<string, string> = {}
  const externalUrls = Array.from(new Set(options.resources || []))

  const sriVirtualId = "virtual:sri-manifest"
  const resolvedSriVirtualId = "\0" + sriVirtualId

  const configVirtualId = "virtual:rimelight-security-config"
  const resolvedConfigVirtualId = "\0" + configVirtualId

  return {
    name: "vite-plugin-rimelight-security",
    enforce: "post",

    async buildStart() {
      // 1. Fetch & Hash External Resources (3rd-party SRI)
      if (process.env["NODE_ENV"] === "development") return

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
      if (id === sriVirtualId) return resolvedSriVirtualId
      if (id === configVirtualId) return resolvedConfigVirtualId
      return null
    },

    load(id: string) {
      if (id === resolvedSriVirtualId) {
        return `export const manifest = ${JSON.stringify(sriManifest)};`
      }
      if (id === resolvedConfigVirtualId) {
        return `export const config = ${JSON.stringify(options)};`
      }
      return null
    }
  }
}

export { security as sri }

import { createHash } from "node:crypto";
import type { Plugin } from "vite-plus";

import type { SecurityPluginOptions } from "./types";
import { resolveSecurityDomain } from "./csp";

export type RimelightSecurityPlugin = Plugin;
export type { SecurityPluginOptions } from "./types";

function hashContent(buffer: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = createHash("sha384")
    .update(buffer as any)
    .digest("base64");
  return `sha384-${hash}`;
}

/**
 * Serializes a configuration object into executable JavaScript source code.
 * Preserves functions, regular expressions, primitives, arrays, and plain objects.
 *
 * NOTE: Callbacks/functions are serialized by source into the SSR/client bundle,
 * so they must not close over scope defined in vite.config.ts.
 */
export function serializeConfig(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "bigint") return `${value.toString()}n`;

  if (value instanceof RegExp) {
    return `new RegExp(${JSON.stringify(value.source)}, ${JSON.stringify(value.flags)})`;
  }

  if (typeof value === "function") {
    const fnStr = value.toString().trim();
    if (fnStr.includes("[native code]")) {
      throw new Error(`Cannot serialize native function: ${value.name || "anonymous"}`);
    }
    // Convert method shorthand if needed (e.g. `foo(a, b) { ... }` or `async foo(a, b) { ... }`)
    if (/^async\s+[a-zA-Z0-9_$]+\s*\(/.test(fnStr)) {
      return fnStr.replace(/^async\s+/, "async function ");
    } else if (/^[a-zA-Z0-9_$]+\s*\(/.test(fnStr) && !fnStr.startsWith("function")) {
      return "function " + fnStr;
    }
    return fnStr;
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeConfig(item)).join(", ")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${JSON.stringify(k)}: ${serializeConfig(v)}`);
    return `{\n${entries.join(",\n")}\n}`;
  }

  return JSON.stringify(value);
}

/**
 * Pure Vite Security & SRI Plugin. 1. Accepts framework-agnostic security options (domain, imgSrc,
 * ratelimit, construction, etc.) and exposes virtual:rimelight-security-config. 2. Fetches and
 * hashes external 3rd-party scripts/styles at build time. 3. Emits SRI hashes for locally bundled
 * JS/CSS chunks (Nuxt-security style). 4. Exposes virtual:sri-manifest with a unified URL -> hash
 * mapping.
 *
 * NOTE: Functions passed in options are serialized by source into the virtual module, so they must
 * not close over variables in the vite.config.ts module scope.
 */
export function security(options: SecurityPluginOptions = {}): RimelightSecurityPlugin {
  // Fail fast at build/dev time on a malformed domain rather than silently emitting a dead CSP source.
  resolveSecurityDomain(options.domain);

  const sriManifest: Record<string, string> = {};
  const externalUrls = Array.from(new Set(options.resources || []));

  const sriVirtualId = "virtual:sri-manifest";
  const resolvedSriVirtualId = "\0" + sriVirtualId;

  const configVirtualId = "virtual:rimelight-security-config";
  const resolvedConfigVirtualId = "\0" + configVirtualId;

  return {
    name: "vite-plugin-rimelight-security",
    enforce: "post",

    async buildStart() {
      // 1. Fetch & Hash External Resources (3rd-party SRI)
      if (process.env["NODE_ENV"] === "development") return;

      await Promise.all(
        externalUrls.map(async (url) => {
          if (!url.startsWith("https://")) return;
          try {
            const parsed = new URL(url);
            if (parsed.hostname.includes("*")) return;
            const pathname = parsed.pathname;
            if (pathname === "/" || pathname === "" || pathname.endsWith("/")) return;

            const response = await fetch(url);
            if (!response.ok) return;
            const buffer = await response.arrayBuffer();
            sriManifest[url] = hashContent(buffer);
          } catch {
            // Silently ignore unreachable external resources during build
          }
        }),
      );
    },

    generateBundle(_outputOptions, bundle) {
      // 2. Hash Emitted Bundle Chunks & Assets (1st-party SRI)
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!fileName.endsWith(".js") && !fileName.endsWith(".css")) continue;

        let content: string | Uint8Array | undefined;
        if (chunk.type === "chunk") {
          content = chunk.code;
        } else if (chunk.type === "asset") {
          content = chunk.source;
        }

        if (content) {
          const hash = hashContent(content);
          // Store both absolute leading slash path and relative file name
          sriManifest[`/${fileName.replace(/^\/+/, "")}`] = hash;
          sriManifest[fileName] = hash;
        }
      }
    },

    resolveId(id: string) {
      if (id === sriVirtualId) return resolvedSriVirtualId;
      if (id === configVirtualId) return resolvedConfigVirtualId;
      return null;
    },

    load(id: string) {
      if (id === resolvedSriVirtualId) {
        return `export const manifest = ${JSON.stringify(sriManifest)};`;
      }
      if (id === resolvedConfigVirtualId) {
        return `export const config = ${serializeConfig(options)};`;
      }
      return null;
    },
  };
}

export { security as sri };

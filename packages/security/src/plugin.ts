import type { Plugin } from "vite-plus";
import type { SecurityConfig } from "./types";
import { createHash } from "node:crypto";
import { resolveSecurityDomain } from "./domain";

const ID = "virtual:rimelight-security";
const RESOLVED_ID = `\0${ID}`;

function hashContent(buffer: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = createHash("sha384")
    .update(buffer as any)
    .digest("base64");
  return `sha384-${hash}`;
}

export function security(options: SecurityConfig = {}): Plugin {
  resolveSecurityDomain(options.domain);

  const sriManifest: Record<string, string> = {};
  const externalUrls = Array.from(new Set(options.resources || []));

  return {
    name: "rimelight:security",

    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),

    load: (id) => {
      if (id === RESOLVED_ID) {
        const cfg = { ...options, manifest: { ...sriManifest, ...options.manifest } };
        return `export const config = ${JSON.stringify(cfg)};`;
      }
      return undefined;
    },

    async buildStart() {
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
          } catch {}
        }),
      );
    },

    generateBundle(_outputOptions, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!fileName.endsWith(".js") && !fileName.endsWith(".css")) continue;

        const content = chunk.type === "chunk" ? chunk.code : chunk.source;
        if (content) {
          const hash = hashContent(content);
          sriManifest[`/${fileName.replace(/^\/+/, "")}`] = hash;
          sriManifest[fileName] = hash;
        }
      }

      this.emitFile?.({
        type: "asset",
        fileName: "sri.json",
        source: JSON.stringify(sriManifest, null, 2),
      });
    },
  };
}

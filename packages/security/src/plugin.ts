import { createHash } from "node:crypto";
import type { Plugin } from "vite-plus";
import {
  defineRimelightArtifactPlugin,
  emitRimelightArtifact,
  serializeData,
} from "@rimelight/config";

import type { SecurityPluginOptions } from "./types";
import { resolveSecurityDomain } from "./csp";

export type RimelightSecurityPluginOptions = SecurityPluginOptions;
export { serializeData as serializeConfig };

function hashContent(buffer: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = createHash("sha384")
    .update(buffer as any)
    .digest("base64");
  return `sha384-${hash}`;
}

export function security(options: RimelightSecurityPluginOptions = {}): Plugin {
  resolveSecurityDomain(options.domain);

  const sriManifest: Record<string, string> = {};
  const externalUrls = Array.from(new Set(options.resources || []));
  let pluginRoot = process.cwd();

  const basePlugin = defineRimelightArtifactPlugin({
    name: "rimelight:security",
    pkgName: "security",
    emit({ root }) {
      pluginRoot = root;
      return {
        "config.js": `export const config = ${serializeData(options)};\nexport const manifest = ${JSON.stringify(sriManifest)};\nexport default { config, manifest };`,
        "config.d.ts": `export declare const config: any;\nexport declare const manifest: Record<string, string>;\ndeclare const _default: { config: any; manifest: Record<string, string> };\nexport default _default;`,
      };
    },
  });

  return {
    ...basePlugin,
    enforce: "post",

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
          } catch {
            // Silently ignore unreachable external resources during build
          }
        }),
      );
    },

    generateBundle(_outputOptions, bundle) {
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
          sriManifest[`/${fileName.replace(/^\/+/, "")}`] = hash;
          sriManifest[fileName] = hash;
        }
      }

      emitRimelightArtifact(pluginRoot, "security", {
        "config.js": `export const config = ${serializeData(options)};\nexport const manifest = ${JSON.stringify(sriManifest)};\nexport default { config, manifest };`,
        "sri.json": JSON.stringify(sriManifest, null, 2),
      });
    },
  };
}

export { security as sri };

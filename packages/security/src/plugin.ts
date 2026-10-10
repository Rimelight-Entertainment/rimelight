import { createHash } from "node:crypto";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin, serializeData } from "@rimelight/config";
import { resolveSecurityDomain } from "./runtime";

export interface RimelightSecurityPluginOptions {
  domain?: string;
  allowedDomains?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  scriptResources?: string[];
  styleResources?: string[];
  resources?: string[];
  turnstile?:
    | boolean
    | {
        field?: string;
        secretKey?: string;
        failOpen?: boolean;
        endpoint?: string;
      };
  trustedTypes?: boolean;
  crossOriginEmbedderPolicy?:
    | "require-corp"
    | "credentialless"
    | "unsafe-none"
    | (string & {})
    | false;
  crossOriginOpenerPolicy?:
    | "same-origin"
    | "same-origin-allow-popups"
    | "noopener-allow-popups"
    | "unsafe-none"
    | (string & {})
    | false;
  crossOriginResourcePolicy?: "same-origin" | "same-site" | "cross-origin" | (string & {}) | false;
  directives?: Record<string, string[] | string | boolean>;
  strictDynamic?: boolean;
  enforceTls?: boolean;
  stripHeaders?: string[] | false;
  headers?: Record<string, string>;
  manifest?: Record<string, string>;
  ratelimit?:
    | false
    | {
        bindingName?: string;
        limiter?: (
          c: any,
        ) => { limit(options: { key: string }): Promise<{ success: boolean }> } | undefined;
        routes?: (string | RegExp)[] | ((c: any) => boolean);
        keyGenerator?: (c: any) => string | Promise<string>;
        retryAfter?: number;
        fallback?: "pass" | "block";
        onRateLimited?: (c: any, retryAfter: number) => Response | Promise<Response>;
      };
  construction?:
    | false
    | {
        modeEnvKey?: string;
        passphraseEnvKey?: string;
        passphrase?: string;
        cookieName?: string;
        cookieMaxAge?: number;
        locales?: string[];
        getLocale?: (path: string) => string;
        constructionPath?: string;
        apiPath?: string | false;
        renderFallback?: boolean;
        whitelist?: (string | RegExp)[] | ((path: string) => boolean);
        isAuthorized?: (c: any) => boolean | Promise<boolean>;
        onUnauthorized?: (
          c: any,
          meta: { locale: string; path: string; redirectUrl: string },
        ) => Response | Promise<Response>;
      };
  devOnly?: boolean;
}

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

  return {
    ...defineRimelightArtifactPlugin({
      pkgName: "security",
      emit: () => ({
        files: {
          "config.js": `export const config = ${serializeData(options)};\nexport const manifest = ${JSON.stringify(sriManifest)};\nexport default { config, manifest };\n`,
          "config.d.ts": `export declare const config: any;\nexport declare const manifest: Record<string, string>;\nexport default { config, manifest };\n`,
          "sri.json": JSON.stringify(sriManifest, null, 2),
        },
      }),
    }),
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

export { security as sri };

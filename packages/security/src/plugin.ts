import { createHash } from "node:crypto";
import type { Plugin } from "vite-plus";
import type { Context } from "hono";
import { resolveSecurityDomain } from "./domain";

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
          c: Context,
        ) => { limit(options: { key: string }): Promise<{ success: boolean }> } | undefined;
        routes?: (string | RegExp)[] | ((c: Context) => boolean);
        keyGenerator?: (c: Context) => string | Promise<string>;
        retryAfter?: number;
        fallback?: "pass" | "block";
        onRateLimited?: (c: Context, retryAfter: number) => Response | Promise<Response>;
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
        isAuthorized?: (c: Context) => boolean | Promise<boolean>;
        onUnauthorized?: (
          c: Context,
          meta: { locale: string; path: string; redirectUrl: string },
        ) => Response | Promise<Response>;
      };
  devOnly?: boolean;
}

const VIRTUAL_ID = "virtual:rimelight-security";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

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
    name: "rimelight:security",
    enforce: "post",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return [
          `export const config = ${JSON.stringify(options)};`,
          `export const manifest = ${JSON.stringify(sriManifest)};`,
          `export default { config, manifest };`,
        ].join("\n");
      }
      return null;
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

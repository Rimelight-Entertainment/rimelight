import type { Context } from "hono";

export interface SecurityConfig {
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
        cookieName?: string;
        cookieMaxAge?: number;
        constructionPath?: string;
        renderFallback?: boolean;
        whitelist?: (string | RegExp)[] | ((path: string) => boolean);
        isAuthorized?: (c: Context) => boolean | Promise<boolean>;
      };
  devOnly?: boolean;
}

import type { Context } from "hono";

export interface SecurityConfig {
  domain?: string;
  allowedDomains?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  scriptResources?: string[];
  styleResources?: string[];
  turnstile?:
    | boolean
    | {
        field?: string;
        secretKey?: string;
        failOpen?: boolean;
        endpoint?: string;
        routes?: (string | RegExp)[] | ((c: Context) => boolean);
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
        /** Extra per-route limits. Only string fields, so they survive the build-time JSON config. */
        rules?: RateLimitRule[];
      };
  construction?:
    | false
    | {
        cookieName?: string;
        cookieMaxAge?: number;
        constructionPath?: string;
        renderFallback?: boolean;
        whitelist?: (string | RegExp)[] | ((c: Context) => boolean);
        isAuthorized?: (c: Context) => boolean | Promise<boolean>;
      };
  devOnly?: boolean;
  /**
   * RFC 9116 security.txt, served at `/.well-known/security.txt` and `/security.txt`.
   * Not served unless configured.
   */
  securityTxt?: false | SecurityTxtOptions;
}

export interface RateLimitRule {
  /** Namespaces the limiter key, so rules sharing a binding never collide. */
  name: string;
  /** Path prefixes, e.g. "/api/auth/login". */
  routes: string[];
  /** HTTP methods to match. Matches every method when omitted. */
  methods?: string[];
  bindingName: string;
  retryAfter?: number;
}

export interface SecurityTxtOptions {
  /**
   * Contact URI or list of contact URIs (e.g. "mailto:security@example.com") - REQUIRED by RFC 9116
   */
  contact: string | string[];
  /**
   * Expiration date/time (ISO 8601 string or Date) - REQUIRED by RFC 9116
   */
  expires?: Date | string;
  /**
   * URI to PGP/GPG public key
   */
  encryption?: string | string[];
  /**
   * URI to security acknowledgments / hall of fame
   */
  acknowledgments?: string | string[];
  /**
   * Comma-separated list of preferred languages (e.g. "en, pt")
   */
  preferredLanguages?: string;
  /**
   * Canonical URI of the security.txt file
   */
  canonical?: string;
  /**
   * URI to security policy
   */
  policy?: string;
  /**
   * URI to security hiring page
   */
  hiring?: string;
  /**
   * URI to Common Security Advisory Framework (CSAF) provider
   */
  csaf?: string;
}

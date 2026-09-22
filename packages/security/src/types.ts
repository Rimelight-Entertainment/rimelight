export interface SecurityOptions {
  /**
   * The base domain name for this project (e.g. "idantity.me") used to autoconfigure standard
   * allowed domains and img-src CDN targets.
   */
  domain?: string | undefined

  /**
   * Additional Allowed Domains for origin checking or cross-domain rules
   */
  allowedDomains?: string[] | undefined

  /**
   * Additional sources to allow for img-src directive
   */
  imgSrc?: string[] | undefined

  /**
   * Additional sources to allow for connect-src directive
   */
  connectSrc?: string[] | undefined

  /**
   * Additional sources to allow for frame-src directive
   */
  frameSrc?: string[] | undefined

  /**
   * Additional script resources / origins (e.g. "https://betterlytics.io")
   */
  scriptResources?: string[] | undefined

  /**
   * Additional style resources / origins
   */
  styleResources?: string[] | undefined

  /**
   * Enables Cloudflare Turnstile CSP allowances (challenges.cloudflare.com in script-src,
   * frame-src, connect-src).
   */
  turnstile?: boolean | undefined

  /**
   * Enables the 'require-trusted-types-for' directive
   */
  trustedTypes?: boolean | undefined

  /**
   * Cross-Origin-Embedder-Policy header value. Allowed values: "require-corp", "credentialless",
   * "unsafe-none" or false to disable. Defaults to "credentialless".
   */
  crossOriginEmbedderPolicy?:
    | "require-corp"
    | "credentialless"
    | "unsafe-none"
    | (string & {})
    | false
    | undefined

  /**
   * Cross-Origin-Opener-Policy header value. Allowed values: "same-origin",
   * "same-origin-allow-popups", "noopener-allow-popups", "unsafe-none" or false to disable.
   * Defaults to "same-origin".
   */
  crossOriginOpenerPolicy?:
    | "same-origin"
    | "same-origin-allow-popups"
    | "noopener-allow-popups"
    | "unsafe-none"
    | (string & {})
    | false
    | undefined

  /**
   * Cross-Origin-Resource-Policy header value. Allowed values: "same-origin", "same-site",
   * "cross-origin" or false to disable. Defaults to "same-origin".
   */
  crossOriginResourcePolicy?:
    | "same-origin"
    | "same-site"
    | "cross-origin"
    | (string & {})
    | false
    | undefined

  /**
   * Granular CSP directive overrides. Values are arrays of directive tokens, e.g.: {
   * "frame-ancestors": ["'self'"] }
   */
  directives?: Record<string, string[] | string | boolean> | undefined

  /**
   * Enables 'strict-dynamic' in script-src when a request nonce is present. Defaults to true.
   */
  strictDynamic?: boolean | undefined

  /**
   * Enforces TLS 1.2+ minimum at the edge when request.cf metadata is present. Defaults to true.
   */
  enforceTls?: boolean | undefined

  /**
   * Headers to strip from the outgoing response (e.g. Server, X-Powered-By). Set to false to
   * disable stripping. Defaults to ["x-powered-by", "server", "x-aspnet-version",
   * "public-key-pins"].
   */
  stripHeaders?: string[] | false | undefined

  /**
   * Custom headers to set on every response or overrides
   */
  headers?: Record<string, string> | undefined

  /**
   * SRI manifest mapping URLs or chunk paths to integrity hashes (e.g. from Vite plugin).
   */
  manifest?: Record<string, string> | undefined
}

export interface ConstructionOptions {
  /**
   * Environment variable key for construction mode flag ("true" | "false"). Defaults to
   * "CONSTRUCTION_MODE".
   */
  modeEnvKey?: string

  /**
   * Environment variable key for the passphrase secret. Defaults to "CONSTRUCTION_PASSPHRASE".
   */
  passphraseEnvKey?: string

  /**
   * Explicit passphrase override (if not reading from env).
   */
  passphrase?: string

  /**
   * Cookie name used for guest authorization token. Defaults to "rimelight-construction-guest".
   */
  cookieName?: string

  /**
   * Cookie max age in seconds when "remember me" is enabled. Defaults to 7 days (604,800 seconds).
   */
  cookieMaxAge?: number

  /**
   * List of supported locales or custom resolver.
   */
  locales?: string[]

  /**
   * Custom locale extractor from request path.
   */
  getLocale?: (path: string) => string

  /**
   * Custom path for the construction page. Defaults to "/construction".
   */
  constructionPath?: string

  /**
   * API endpoint to automatically handle guest sign-in. Set to `false` to disable automatic API
   * interception. Defaults to "/api/construction-guest".
   */
  apiPath?: string | false

  /**
   * If true, serves a built-in zero-dependency fallback HTML maintenance page (with HTTP 503)
   * instead of redirecting when unauthorized. Defaults to false (redirects to constructionPath).
   */
  renderFallback?: boolean

  /**
   * Additional routes / prefixes to whitelist and skip gating.
   */
  whitelist?: (string | RegExp)[] | ((path: string) => boolean)

  /**
   * Custom authorization predicate. If returns true, request is allowed through. Defaults to
   * checking `await isConstructionGuest(c, options)`.
   */
  isAuthorized?: (c: any) => boolean | Promise<boolean>

  /**
   * Custom handler when unauthorized. Defaults to redirecting to
   * `/${locale}/construction?redirect=${encodeURIComponent(path)}`.
   */
  onUnauthorized?: (
    c: any,
    meta: { locale: string; path: string; redirectUrl: string }
  ) => Response | Promise<Response>
}

export interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export interface RateLimitOptions {
  /**
   * Name of the Cloudflare Rate Limiter binding on `c.env` / `env`.
   *
   * @default "MY_RATE_LIMITER"
   */
  bindingName?: string

  /**
   * Direct rate limiter instance or binding resolver.
   */
  limiter?: (c: any) => RateLimiterBinding | undefined

  /**
   * Routes / path prefixes or a custom predicate to check if the request should be rate limited.
   * Can be an array of strings/RegExp or a matcher function `(c: any) => boolean`.
   *
   * @default ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"]
   */
  routes?: (string | RegExp)[] | ((c: any) => boolean)

  /**
   * Function to extract the rate limit key from the context (e.g., client IP, user ID, API key).
   *
   * @default c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "unknown"
   */
  keyGenerator?: (c: any) => string | Promise<string>

  /**
   * Retry-After header value in seconds.
   *
   * @default 60
   */
  retryAfter?: number

  /**
   * Behavior when no rate limiter binding exists (e.g., in local development without mock binding).
   *
   * - "pass": Fail open (call `next()`)
   * - "block": Fail closed (return 429/500)
   *
   * @default "pass"
   */
  fallback?: "pass" | "block"

  /**
   * Custom handler when the rate limit is exceeded.
   */
  onRateLimited?: (c: any, retryAfter: number) => Response | Promise<Response>
}

export type { ConstructionFallbackOptions } from "./construction/fallback"

export interface SecurityOptions {
  /**
   * The base domain name for this project (e.g. "idantity.me") used to autoconfigure standard
   * allowed domains and img-src CDN targets.
   */
  domain?: string

  /**
   * Additional Allowed Domains for origin checking or cross-domain rules
   */
  allowedDomains?: string[]

  /**
   * Additional sources to allow for img-src directive
   */
  imgSrc?: string[]

  /**
   * Additional sources to allow for connect-src directive
   */
  connectSrc?: string[]

  /**
   * Additional sources to allow for frame-src directive
   */
  frameSrc?: string[]

  /**
   * Additional script resources / origins (e.g. "https://betterlytics.io")
   */
  scriptResources?: string[]

  /**
   * Additional style resources / origins
   */
  styleResources?: string[]

  /**
   * Enables the 'require-trusted-types-for' directive
   */
  trustedTypes?: boolean

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

  /**
   * Cross-Origin-Resource-Policy header value. Allowed values: "same-origin", "same-site",
   * "cross-origin" or false to disable. Defaults to "same-origin".
   */
  crossOriginResourcePolicy?: "same-origin" | "same-site" | "cross-origin" | (string & {}) | false

  /**
   * Granular CSP directive overrides. Values are arrays of directive tokens, e.g.: {
   * "frame-ancestors": ["'self'"] }
   */
  directives?: Record<string, string[] | string | boolean>

  /**
   * Custom headers to set on every response or overrides
   */
  headers?: Record<string, string>
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
   * Additional routes / prefixes to whitelist and skip gating.
   */
  whitelist?: (string | RegExp)[] | ((path: string) => boolean)

  /**
   * Custom authorization predicate. If returns true, request is allowed through. Defaults to
   * checking `c.get("session") || await isConstructionGuest(c, options)`.
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

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

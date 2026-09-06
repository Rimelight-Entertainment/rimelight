export interface SecurityOptions {
  /**
   * The base domain name for this project (e.g. "idantity.me") used to autoconfigure
   * standard allowed domains and img-src CDN targets.
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
   * Granular CSP directive overrides. Values are arrays of directive tokens, e.g.:
   * { "frame-ancestors": ["'self'"] }
   */
  directives?: Record<string, string[] | string | boolean>

  /**
   * Custom headers to set on every response or overrides
   */
  headers?: Record<string, string>
}

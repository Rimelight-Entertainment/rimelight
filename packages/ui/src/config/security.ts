import type { AstroUserConfig } from "astro"

export type AstroSecurityConfig = NonNullable<AstroUserConfig["security"]>
export type AstroCspConfig = Exclude<NonNullable<AstroSecurityConfig["csp"]>, boolean>

export interface SecurityConfigOptions {
  /**
   * The base domain name for this project (e.g., "starter.rimelight.com") used to autoconfigure
   * standard allowedDomains and img-src CDN targets.
   */
  domain: string
  /**
   * Additional Allowed Domains (appended to the default wildcard subdomains of `domain`)
   */
  allowedDomains?: AstroSecurityConfig["allowedDomains"]
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
   * Additional script resources
   */
  scriptResources?: string[]
  /**
   * Additional style resources
   */
  styleResources?: string[]
  /**
   * Direct overrides for any security config fields
   */
  overrides?: Partial<Omit<AstroSecurityConfig, "csp">> & {
    csp?: Partial<AstroCspConfig>
  }
}

/**
 * Generates a standard, strictly configured Security/CSP object for Astro configurations with
 * support for easy customization and additions per project.
 *
 * @example
 * ```ts
 * // Default returned shape:
 * {
 *   checkOrigin: true,
 *   allowedDomains: [
 *     {
 *       hostname: "**.domain.com",
 *       protocol: "https"
 *     }
 *   ],
 *   csp: {
 *     algorithm: "SHA-384",
 *     directives: [
 *       "default-src 'none'",
 *       "img-src 'self' data: https://cdn.domain.com https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",
 *       "font-src 'self'",
 *       "connect-src 'self' https://cloudflareinsights.com",
 *       "frame-ancestors 'none'",
 *       "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
 *       "upgrade-insecure-requests",
 *       "base-uri 'self'",
 *       "form-action 'self'"
 *     ],
 *     scriptDirective: {
 *       resources: [
 *         "'self'",
 *         "https://static.cloudflareinsights.com",
 *         "https://betterlytics.io/analytics.js",
 *         "'inline-speculation-rules'"
 *       ]
 *     },
 *     styleDirective: {
 *       resources: [
 *         "'self'",
 *         "'sha256-SKuaOGnks7NAUq37nvw1PfGEE0lOAs5ERbiYRbGFIbw='"
 *       ]
 *     }
 *   }
 * }
 * ```
 */
export function defineSecurity(options: SecurityConfigOptions): AstroSecurityConfig {
  const { domain, overrides } = options
  const domainWithWildcard = `**.${domain}`

  // 1. Build default allowed domains
  const allowedDomains = [
    {
      hostname: domainWithWildcard,
      protocol: "https" as const
    },
    ...(options.allowedDomains || [])
  ]

  // 2. Build CSP directives
  const imgSources = Array.from(
    new Set([
      "'self'",
      "data:",
      `https://cdn.${domain}`,
      "https://i3.ytimg.com",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      ...(options.imgSrc || [])
    ])
  )

  const connectSources = Array.from(
    new Set(["'self'", "https://cloudflareinsights.com", ...(options.connectSrc || [])])
  )

  const frameSources = Array.from(
    new Set([
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      ...(options.frameSrc || [])
    ])
  )

  const baseDirectives: AstroCspConfig["directives"] = [
    "default-src 'none'",
    `img-src ${imgSources.join(" ")}`,
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "frame-ancestors 'none'",
    `frame-src ${frameSources.join(" ")}`,
    "upgrade-insecure-requests",
    "base-uri 'self'",
    "form-action 'self'"
  ]

  // 3. Build script & style directives
  const scriptResources = Array.from(
    new Set([
      "'self'",
      "https://static.cloudflareinsights.com",
      "https://betterlytics.io/analytics.js",
      "'inline-speculation-rules'",
      "'sha256-ZuMSxilKU+4KIM8LWna4lqBEKzd6WaiAjz6gamhm7zM='",
      ...(options.scriptResources || [])
    ])
  )

  const styleResources = Array.from(
    new Set([
      "'self'",
      "'sha256-SKuaOGnks7NAUq37nvw1PfGEE0lOAs5ERbiYRbGFIbw='",
      ...(options.styleResources || [])
    ])
  )

  // 4. Build base SecurityConfig
  const securityConfig: AstroSecurityConfig = {
    checkOrigin: true,
    allowedDomains,
    csp: {
      algorithm: "SHA-384",
      directives: baseDirectives,
      scriptDirective: {
        resources: scriptResources
      },
      styleDirective: {
        resources: styleResources
      }
    }
  }

  // 5. Merge overrides
  if (overrides) {
    const { csp, ...restOverrides } = overrides
    Object.assign(securityConfig, restOverrides)
    if (csp && typeof securityConfig.csp === "object" && securityConfig.csp !== null) {
      const currentCsp = securityConfig.csp
      const mergedCsp: AstroCspConfig = {
        ...currentCsp,
        ...csp
      }

      if (csp.scriptDirective || currentCsp.scriptDirective) {
        mergedCsp.scriptDirective = {
          ...currentCsp.scriptDirective,
          ...csp.scriptDirective,
          resources: Array.from(
            new Set([
              ...(currentCsp.scriptDirective?.resources || []),
              ...(csp.scriptDirective?.resources || [])
            ])
          )
        }
      }

      if (csp.styleDirective || currentCsp.styleDirective) {
        mergedCsp.styleDirective = {
          ...currentCsp.styleDirective,
          ...csp.styleDirective,
          resources: Array.from(
            new Set([
              ...(currentCsp.styleDirective?.resources || []),
              ...(csp.styleDirective?.resources || [])
            ])
          )
        }
      }

      securityConfig.csp = mergedCsp
    }
  }

  return securityConfig
}

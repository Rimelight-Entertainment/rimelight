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
   * Enables the 'require-trusted-types-for' directive
   */
  trustedTypes?: boolean
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
 *   ;```ts
 *   // Default returned shape:
 *   {
 *   checkOrigin: true,
 *   allowedDomains: [
 *   {
 *   hostname: "**.domain.com",
 *   protocol: "https"
 *   }
 *   ],
 *   csp: {
 *   algorithm: "SHA-384",
 *   directives: [
 *   "default-src 'none'",
 *   "img-src 'self' data: https://cdn.domain.com https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",
 *   "font-src 'self'",
 *   "connect-src 'self' https://cloudflareinsights.com",
 *   "frame-ancestors 'none'",
 *   "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
 *   "upgrade-insecure-requests",
 *   "base-uri 'self'",
 *   "form-action 'self'"
 *   ],
 *   scriptDirective: {
 *   resources: [
 *   "'self'",
 *   "https://static.cloudflareinsights.com",
 *   "https://betterlytics.io/analytics.js",
 *   "'inline-speculation-rules'"
 *   ]
 *   },
 *   styleDirective: {
 *   resources: [
 *   "'self'",
 *   "'sha256-SKuaOGnks7NAUq37nvw1PfGEE0lOAs5ERbiYRbGFIbw='"
 *   ]
 *   }
 *   }
 *   }
 *   ```
 */
type DirectiveItem = { resource: string; kind?: "element" | "attribute" }
type DirectiveInput = string[] | DirectiveItem[] | { resources?: string[] } | null | undefined

const normalizeDirective = (input: DirectiveInput): DirectiveItem[] => {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === "string") {
        return { resource: item, kind: "element" }
      }
      return item
    })
  }
  if (typeof input === "object" && "resources" in input && Array.isArray(input.resources)) {
    return input.resources.map((res) => ({ resource: res, kind: "element" }))
  }
  return []
}

function mergeDirective(current: any, incoming: any): any {
  if (!current && !incoming) return undefined

  const currentNormalized = normalizeDirective(current)
  const incomingNormalized = normalizeDirective(incoming)

  const mergedMap = new Map<string, DirectiveItem>()
  for (const item of [...currentNormalized, ...incomingNormalized]) {
    const key = `${item.resource}::${item.kind || "element"}`
    mergedMap.set(key, item)
  }

  const mergedList = Array.from(mergedMap.values())

  const currentWasArray = Array.isArray(current)
  const incomingWasArray = Array.isArray(incoming)

  if (
    !currentWasArray &&
    !incomingWasArray &&
    current &&
    typeof current === "object" &&
    incoming &&
    typeof incoming === "object" &&
    !("length" in current) &&
    !("length" in incoming)
  ) {
    return {
      resources: mergedList.map((item) => item.resource)
    }
  }

  return mergedList
}

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
    "form-action 'self'",
    "object-src 'none'",
    "manifest-src 'self'",
    ...(options.trustedTypes ? ["require-trusted-types-for 'script'" as const] : [])
  ]

  // 3. Build script & style directives
  const scriptResources = Array.from(
    new Set([
      "'self'",
      "https://static.cloudflareinsights.com",
      "https://betterlytics.io/analytics.js",
      "'inline-speculation-rules'",
      // Astro ClientRouter (View Transitions)
      "'sha256-ZuMSxilKU+4KIM8LWna4lqBEKzd6WaiAjz6gamhm7zM='",
      ...(options.scriptResources || [])
    ])
  )

  const styleResources = Array.from(
    new Set([
      "'self'",
      // Astro ClientRouter (View Transitions)
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
        mergedCsp.scriptDirective = mergeDirective(currentCsp.scriptDirective, csp.scriptDirective)
      }

      if (csp.styleDirective || currentCsp.styleDirective) {
        mergedCsp.styleDirective = mergeDirective(currentCsp.styleDirective, csp.styleDirective)
      }

      securityConfig.csp = mergedCsp
    }
  }

  return securityConfig
}

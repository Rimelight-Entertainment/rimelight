export interface RimelightSolidSecurityOptions {
  domain?: string | undefined
  imgSrc?: string[] | undefined
  connectSrc?: string[] | undefined
  [key: string]: any
}

export interface RimelightSolidOptions {
  domain?: string | undefined
  site?: string | undefined
  imageDomains?: string[] | undefined
  security?: boolean | RimelightSolidSecurityOptions | undefined
  [key: string]: any
}

export interface RimelightSolidConfig {
  domain?: string | undefined
  site?: string | undefined
  imageDomains: string[]
  securityOptions?: RimelightSolidSecurityOptions | undefined
}

function toHttpsOrigin(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `https://${value}`
}

export function resolveImageDomains(options: RimelightSolidOptions = {}): string[] {
  const { domain, imageDomains } = options
  if (imageDomains) return imageDomains
  if (domain) return [domain, `cdn.${domain}`, "cdn.rimelight.com"]
  return []
}

export function resolveSecurityOptions(
  options: RimelightSolidOptions = {},
  imageDomains: string[] = resolveImageDomains(options)
): RimelightSolidSecurityOptions | undefined {
  const { domain, security = true } = options

  // Opt-out, not opt-in. An app that declares a domain always gets CSP defaults derived from it
  // (domain + image domains), so callers can never end up with a `domain`-less CSP that blocks
  // the project's own CDN. Pass `security: false` to disable entirely.
  if (security === false) return undefined
  if (!domain && imageDomains.length === 0) return undefined

  const secOpts: RimelightSolidSecurityOptions = typeof security === "object" ? security : {}
  const { domain: overrideDomain, imgSrc: overrideImgSrc, ...rest } = secOpts
  const resolvedDomain = overrideDomain || domain
  const defaultImgSrc = imageDomains.map(toHttpsOrigin)
  const imgSrc = Array.from(
    new Set(overrideImgSrc ? [...defaultImgSrc, ...overrideImgSrc] : defaultImgSrc)
  )
  return {
    ...(resolvedDomain ? { domain: resolvedDomain } : {}),
    imgSrc,
    ...rest
  }
}

export function rimelightSolidConfig(options: RimelightSolidOptions = {}): RimelightSolidConfig {
  const { domain, site = domain ? `https://${domain}` : undefined } = options
  const imageDomains = resolveImageDomains(options)
  const securityOptions = resolveSecurityOptions(options, imageDomains)
  return {
    ...(domain ? { domain } : {}),
    ...(site ? { site } : {}),
    imageDomains,
    ...(securityOptions ? { securityOptions } : {})
  }
}

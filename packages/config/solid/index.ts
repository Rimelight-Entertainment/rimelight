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
  const { domain, security } = options
  if (!security) return undefined
  const secOpts: RimelightSolidSecurityOptions = typeof security === "object" ? security : {}
  const { domain: overrideDomain, imgSrc: overrideImgSrc, ...rest } = secOpts
  const resolvedDomain = overrideDomain || domain
  const defaultImgSrc = imageDomains.map(toHttpsOrigin)
  const imgSrc = overrideImgSrc
    ? Array.from(new Set([...defaultImgSrc, ...overrideImgSrc]))
    : defaultImgSrc
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

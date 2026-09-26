function toHttpsOrigin(value) {
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `https://${value}`
}

export function resolveImageDomains(options = {}) {
  const { domain, imageDomains } = options
  if (imageDomains) return imageDomains
  if (domain) return [domain, `cdn.${domain}`, "cdn.rimelight.com"]
  return []
}

export function resolveSecurityOptions(options = {}, imageDomains = resolveImageDomains(options)) {
  const { domain, security } = options
  if (!security) return undefined
  const secOpts = typeof security === "object" ? security : {}
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

export function rimelightSolidConfig(options = {}) {
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

export interface CachePurgeOptions {
  slug: string
  locales: string[]
  domain?: string
  basePath?: string
  isEnterpriseCloudflare?: boolean
}

export async function invalidatePageCache(options: CachePurgeOptions): Promise<boolean> {
  const { slug, locales, domain = "rimelight.com", basePath = "", isEnterpriseCloudflare } = options
  const zoneId = process.env["CLOUDFLARE_ZONE_ID"]
  const apiToken = process.env["CLOUDFLARE_API_TOKEN"]

  if (!zoneId || !apiToken) {
    return false
  }

  const cleanPath = basePath ? `/${basePath.replace(/^\/+|\/+$/g, "")}` : ""

  const body = isEnterpriseCloudflare
    ? { tags: [`page-${domain}-${slug}`] }
    : { files: locales.map((lang) => `https://${domain}/${lang}${cleanPath}/${slug}`) }

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    return res.ok
  } catch {
    return false
  }
}

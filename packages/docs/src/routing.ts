export interface DocEntry {
  id: string
  [key: string]: any
}

export function getDocsVersions(entries: DocEntry[], locale: string): string[] {
  const versions = new Set<string>()
  for (const entry of entries) {
    const id = entry.id.replace(/\\/g, "/")
    const parts = id.split("/")
    if (parts[1] === locale && parts[0]?.startsWith("v")) {
      versions.add(parts[0])
    }
  }
  return Array.from(versions).toSorted((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" })
  })
}

export function parseDocsSlug(slug: string | undefined, versions: string[]) {
  if (versions.length === 0) {
    return {
      activeVersion: "",
      contentPath: slug || "index",
      includeVersionInUrl: false
    }
  }

  const defaultVersion = versions[0]
  const isMultiVersion = versions.length > 1

  if (!slug) {
    return {
      activeVersion: defaultVersion,
      contentPath: "index",
      includeVersionInUrl: isMultiVersion
    }
  }

  const parts = slug.split("/")
  const firstPart = parts[0]

  if (firstPart && versions.includes(firstPart)) {
    return {
      activeVersion: firstPart,
      contentPath: parts.slice(1).join("/") || "index",
      includeVersionInUrl: isMultiVersion
    }
  }

  return {
    activeVersion: defaultVersion,
    contentPath: slug || "index",
    includeVersionInUrl: isMultiVersion
  }
}

export function formatDocsUrl(
  href: string,
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean
): string {
  let url = href.replace("{locale}", locale)
  if (activeVersion && includeVersionInUrl) {
    if (url.includes(`/${activeVersion}/`) || url.endsWith(`/${activeVersion}`)) {
      return url
    }
    const docsPattern = new RegExp(`(/${locale}/docs)(/|$)`)
    const companyDocsPattern = new RegExp(`(/${locale}/company/docs)(/|$)`)

    if (companyDocsPattern.test(url)) {
      url = url.replace(companyDocsPattern, `$1/${activeVersion}$2`)
    } else if (docsPattern.test(url)) {
      url = url.replace(docsPattern, `$1/${activeVersion}$2`)
    }

    url = url.replace(/\/{2,}/g, "/")
  }
  return url
}

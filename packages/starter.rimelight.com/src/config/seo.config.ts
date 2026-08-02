import type { SeoEntry, LocaleConfig } from "@rimelight/seo"
import { getCollection } from "astro:content"
import docsConfig from "./docs.config"

/**
 * SEO locale configuration
 */
export const SEO_LOCALES: LocaleConfig = {
  site: "https://starter.rimelight.com",
  locales: {
    en: "en-US",
    pt: "pt-BR"
  },
  defaultLocale: "en",
  trailingSlash: "never"
}

/**
 * Static marketing/company paths (not in content collections)
 */
const STATIC_PATHS = ["/", "/about", "/contact", "/branding", "/construction"]

/**
 * Private path prefixes to exclude from sitemap
 */
export const PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/admin",
  "/internal",
  "/api",
  "/dev",
  "/og",
  "/open-graph",
  "/auth"
]

/**
 * Extract all doc paths from docs config
 */
function extractDocPaths(): string[] {
  const paths: string[] = []

  function processSidebar(items: any[]) {
    for (const item of items) {
      if (item.href) {
        // Convert /{locale}/docs/path to /docs/path
        const path = item.href.replace("/{locale}", "")
        paths.push(path)
      }
      if (item.items) {
        processSidebar(item.items)
      }
    }
  }

  const sidebarItems = Array.isArray(docsConfig.sidebar)
    ? docsConfig.sidebar
    : docsConfig.sidebar.scopes
  processSidebar(sidebarItems)
  return paths
}

/**
 * Gather all SEO entries for the site
 */
export async function seoEntries(): Promise<SeoEntry[]> {
  const entries: SeoEntry[] = []

  // Static paths
  for (const path of STATIC_PATHS) {
    entries.push({ path })
  }

  // Doc paths from registry
  const docPaths = extractDocPaths()
  for (const path of docPaths) {
    entries.push({ path })
  }

  // Blog entries
  const blog = await getCollection("blog")
  for (const post of blog) {
    const path = `/blog/${post.id}`
    entries.push({
      path,
      lastmod: post.data.updatedDate ?? post.data.pubDate,
      changefreq: "weekly"
    })
  }

  // Legal entries
  const legal = await getCollection("legal")
  for (const page of legal) {
    const path = `/legal/${page.id}`
    entries.push({
      path,
      lastmod: page.data.updatedDate ?? page.data.pubDate,
      changefreq: "monthly"
    })
  }

  // Docs entries from content collection
  const docs = await getCollection("docs")
  for (const doc of docs) {
    const path = `/docs/${doc.id}`
    entries.push({
      path,
      changefreq: "weekly"
    })
  }

  // Filter out private paths
  return entries.filter(
    (entry) => !PRIVATE_PATH_PREFIXES.some((prefix) => entry.path.startsWith(prefix))
  )
}

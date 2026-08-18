import type { SeoEntry, LocaleConfig } from "@rimelight/seo"
import { getCollection } from "astro:content"
import docsConfig from "./docs.config"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { and, isNull, sql } from "drizzle-orm"

/**
 * SEO locale configuration
 */
export const SEO_LOCALES: LocaleConfig = {
  site: "https://rimelight.com",
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
const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/branding",
  "/construction",
  "/company",
  "/company/about",
  "/company/branding",
  "/company/careers",
  "/company/careers/culture",
  "/company/contact",
  "/company/docs",
  "/company/legal",
  "/company/studio/partnerships",
  "/events/lightcon",
  "/forums/grand-tale",
  "/forums/rimelight",
  "/store",
  "/store/digital",
  "/store/orders",
  "/store/deals/new",
  "/store/deals/sales",
  "/store/deals/bundles",
  "/franchises/grand-tale",
  "/franchises/grand-tale/about",
  "/franchises/grand-tale/download",
  "/franchises/grand-tale/forums",
  "/franchises/grand-tale/guides",
  "/franchises/grand-tale/guides/calculators",
  "/franchises/grand-tale/guides/build-planners",
  "/franchises/grand-tale/leaderboards",
  "/franchises/grand-tale/news",
  "/franchises/grand-tale/support",
  "/franchises/grand-tale/wiki",
  "/franchises/grand-tale/wiki/getting-started",
  "/franchises/grand-tale/wiki/contribution-guide"
]

/**
 * Store category paths
 */
const STORE_CATEGORY_PATHS = [
  "/store/accessories/jewelry",
  "/store/accessories/keychains",
  "/store/apparel/bottles-mugs",
  "/store/art/books",
  "/store/art/games",
  "/store/clothing/bottoms",
  "/store/clothing/headwear",
  "/store/clothing/tops",
  "/store/collectibles/figurines",
  "/store/merch/pins",
  "/store/merch/plushies",
  "/store/merch/posters"
]

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
        // Convert /{locale}/company/docs/path to /company/docs/path
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
  for (const path of [...STATIC_PATHS, ...STORE_CATEGORY_PATHS]) {
    entries.push({ path })
  }

  // Doc paths from registry
  const docPaths = extractDocPaths()
  for (const path of docPaths) {
    entries.push({ path })
  }

  // Blog entries from CMS
  const blogPages = await db
    .select({ slug: pages.slug, postedAt: pages.postedAt, updatedAt: pages.updatedAt })
    .from(pages)
    .where(and(sql`${pages.type} = ${"blog"}`, isNull(pages.deletedAt)))

  for (const post of blogPages) {
    const path = `/company/blog/${post.slug}`
    const lastmod = post.updatedAt ?? post.postedAt
    entries.push({
      path,
      ...(lastmod ? { lastmod } : {}),
      changefreq: "weekly"
    })
  }

  // Legal entries from CMS
  const legalPages = await db
    .select({ slug: pages.slug, postedAt: pages.postedAt, updatedAt: pages.updatedAt })
    .from(pages)
    .where(and(sql`${pages.type} = ${"legal"}`, isNull(pages.deletedAt)))

  for (const page of legalPages) {
    const path = `/company/legal/${page.slug}`
    const lastmod = page.updatedAt ?? page.postedAt
    entries.push({
      path,
      ...(lastmod ? { lastmod } : {}),
      changefreq: "monthly"
    })
  }

  // Docs entries from content collection (staying as content collections for now)
  const docs = await getCollection("docs")
  for (const doc of docs) {
    const path = `/company/docs/${doc.id}`
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

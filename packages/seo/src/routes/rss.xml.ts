import type { APIRoute } from "astro"
import { buildRssXml } from "../rss.js"
import * as seoConfig from "virtual:rimelight-seo/config"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import * as dbMod from "virtual:rimelight-seo/db"
import seoOptions from "virtual:rimelight-seo/options"
import type { RssItem, RssCollectionConfig } from "../types.js"

export const GET: APIRoute = async ({ site, url }) => {
  const rssOpts = typeof seoOptions?.rss === "object" ? seoOptions.rss : {}
  const siteConfig = siteConfigMod.siteConfig || {}
  const siteUrl = site ? site.toString() : rssOpts.site || siteConfig.url || url.origin

  let items: RssItem[] = []

  if (Array.isArray(rssOpts.items)) {
    items = rssOpts.items
  } else if (typeof rssOpts.items === "function") {
    items = await rssOpts.items()
  } else if (typeof (seoConfig as any).rssEntries === "function") {
    items = await (seoConfig as any).rssEntries()
  } else {
    const defaultCollections: (string | RssCollectionConfig)[] = [
      "blog",
      "posts",
      "news",
      "articles"
    ]
    const rawCollections =
      rssOpts.collections && rssOpts.collections.length > 0
        ? rssOpts.collections
        : defaultCollections

    const normalizedCollections: Array<{ name: string; pathPrefix: string }> = rawCollections.map(
      (c: string | RssCollectionConfig) => {
        if (typeof c === "string") {
          return { name: c, pathPrefix: `/${c.replace(/^\/+|\/+$/g, "")}` }
        }
        return {
          name: c.name,
          pathPrefix: c.pathPrefix
            ? `/${c.pathPrefix.replace(/^\/+|\/+$/g, "")}`
            : `/${c.name.replace(/^\/+|\/+$/g, "")}`
        }
      }
    )

    if (dbMod.db) {
      try {
        const { pages } = await import("#db/schema").catch(() => ({ pages: null }))
        const { and, isNull } = await import("drizzle-orm")
        if (pages) {
          const collectionNames = normalizedCollections.map((c) => c.name)
          const prefixMap = new Map(normalizedCollections.map((c) => [c.name, c.pathPrefix]))

          const dbPages = await dbMod.db
            .select()
            .from(pages)
            .where(and(isNull(pages.deletedAt)))
            .catch(() => [])

          const matchingPages = dbPages.filter((p: any) => collectionNames.includes(p.type))
          for (const p of matchingPages) {
            const prefix = prefixMap.get(p.type) || `/${p.type}`
            const title =
              typeof p.title === "string"
                ? p.title
                : p.title?.en || (p.title && Object.values(p.title)[0]) || p.slug
            const description =
              typeof p.description === "string"
                ? p.description
                : p.description?.en || (p.description && Object.values(p.description)[0]) || ""
            items.push({
              title,
              description,
              link: `${prefix}/${p.slug}`,
              pubDate: p.postedAt || p.createdAt || new Date()
            })
          }
        }
      } catch {
        // DB lookup fallback
      }
    }

    if (items.length === 0) {
      try {
        const { getCollection } = await import("astro:content")
        for (const coll of normalizedCollections) {
          try {
            const collEntries = await (getCollection as any)(coll.name)
            if (Array.isArray(collEntries)) {
              for (const post of collEntries) {
                items.push({
                  title: post.data?.title || post.id,
                  pubDate: post.data?.pubDate || post.data?.date || new Date(),
                  description: post.data?.description || post.data?.summary,
                  link: `${coll.pathPrefix}/${post.id}/`
                })
              }
            }
          } catch {
            // Collection not defined in content config, continue
          }
        }
      } catch {
        // No astro:content available
      }
    }
  }

  const feedTitle = rssOpts.title || siteConfig.name || "RSS Feed"
  const feedDesc = rssOpts.description || siteConfig.description || ""

  const xml = buildRssXml({
    title: feedTitle,
    description: feedDesc,
    site: siteUrl,
    language: rssOpts.language || "en-US",
    items
  })

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  })
}

import type { APIRoute } from "astro"
import { buildRssXml } from "../rss.js"
import * as seoConfig from "virtual:rimelight-seo/config"
import * as siteConfigMod from "virtual:rimelight-seo/site-config"
import * as dbMod from "virtual:rimelight-seo/db"
import seoOptions from "virtual:rimelight-seo/options"
import type { RssItem } from "../types.js"

export const GET: APIRoute = async ({ site, url }) => {
  const rssOpts = typeof seoOptions?.rss === "object" ? seoOptions.rss : {}
  const siteConfig = siteConfigMod.siteConfig || {}
  const siteUrl = site ? site.toString() : (rssOpts.site || siteConfig.url || url.origin)

  let items: RssItem[] = []

  if (Array.isArray(rssOpts.items)) {
    items = rssOpts.items
  } else if (typeof (seoConfig as any).rssEntries === "function") {
    items = await (seoConfig as any).rssEntries()
  } else if (dbMod.db) {
    try {
      const { pages } = await import("#db/schema").catch(() => ({ pages: null }))
      const { and, isNull, sql } = await import("drizzle-orm")
      if (pages) {
        const blogPages = await dbMod.db
          .select()
          .from(pages)
          .where(and(sql`${pages.type} = 'blog'`, isNull(pages.deletedAt)))
          .catch(() => [])

        items = blogPages.map((p: any) => {
          const title =
            typeof p.title === "string"
              ? p.title
              : p.title?.en || (p.title && Object.values(p.title)[0]) || p.slug
          const description =
            typeof p.description === "string"
              ? p.description
              : p.description?.en || (p.description && Object.values(p.description)[0]) || ""
          return {
            title,
            description,
            link: `/blog/${p.slug}`,
            pubDate: p.postedAt || p.createdAt || new Date()
          }
        })
      }
    } catch {
      // Fallback
    }
  }

  if (items.length === 0) {
    try {
      const { getCollection } = await import("astro:content")
      const blog = await getCollection("blog")
      if (Array.isArray(blog)) {
        items = blog.map((post: any) => ({
          title: post.data?.title || post.id,
          pubDate: post.data?.pubDate || new Date(),
          description: post.data?.description,
          link: `/blog/${post.id}/`
        }))
      }
    } catch {
      // No collections found
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

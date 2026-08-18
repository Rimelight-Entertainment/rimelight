import rss from "@astrojs/rss"
import { siteConfig } from "@/config/site.config"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, and, isNull, desc } from "drizzle-orm"

export async function GET(context) {
  const blogPages = await db
    .select()
    .from(pages)
    .where(and(eq(pages.type, "blog"), isNull(pages.deletedAt)))
    .orderBy(desc(pages.postedAt))

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom"
    },
    customData: `<atom:link href="${new URL("/rss.xml", context.site)}" rel="self" type="application/rss+xml" />`,
    items: blogPages.map((post) => {
      const content =
        typeof post.content === "string" ? JSON.parse(post.content) : post.content || {}
      const title =
        typeof post.title === "object" && post.title !== null
          ? post.title.en || Object.values(post.title)[0] || ""
          : String(post.title || "")
      const description = content.properties?.description || ""
      return {
        title,
        pubDate: post.postedAt || post.createdAt,
        description,
        link: `/blog/${post.slug}/`
      }
    })
  })
}

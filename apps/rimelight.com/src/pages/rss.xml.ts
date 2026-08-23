import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getCmsCollection, getSiteSettings } from "@rimelight/cms"
import { db } from "@/db"

export const GET: APIRoute = async (context) => {
  const settings = await getSiteSettings(db)
  const siteUrl = context.site?.toString() || settings.url || context.url.origin

  const { entries: posts } = await getCmsCollection(db, {
    type: "blog",
    limit: 50
  })

  const response = await rss({
    title: settings.name,
    description: settings.description,
    site: siteUrl,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom"
    },
    customData: `
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${new URL("/rss.xml", siteUrl)}" rel="self" type="application/rss+xml" />
    `,
    items: posts.map((entry) => ({
      title: entry.data.resolvedTitle,
      pubDate: entry.data.postedAt || entry.data.createdAt,
      description: entry.data.resolvedDescription || entry.data.excerpt,
      link: `/company/blog/${entry.data.slug}/`
    }))
  })

  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600")
  return response
}

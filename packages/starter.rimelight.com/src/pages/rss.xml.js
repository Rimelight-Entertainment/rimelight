import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { siteConfig } from "@/config/site.config"

export async function GET(context) {
  const blog = await getCollection("blog")
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom"
    },
    customData: `<atom:link href="${new URL("/rss.xml", context.site)}" rel="self" type="application/rss+xml" />`,
    items: blog
      .filter((post) => post.id.startsWith("en/"))
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/en/blog/${post.id.replace("en/", "")}/`
      }))
  })
}

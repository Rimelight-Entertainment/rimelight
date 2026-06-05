import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { siteConfig } from "@/site.config"

export async function GET(context) {
  const blog = await getCollection("blog")
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site,
    items: blog
      .filter((post) => post.id.startsWith("en/"))
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/en/company/blog/${post.id.replace("en/", "")}/`
      }))
  })
}

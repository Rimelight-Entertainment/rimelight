import { describe, expect, it } from "vitest"
import { buildRssXml } from "./rss.js"

describe("buildRssXml", () => {
  it("should generate valid RSS XML with channel and items", () => {
    const xml = buildRssXml({
      title: "My Site",
      description: "My site description",
      site: "https://example.com",
      items: [
        {
          title: "Post 1 & More",
          link: "/blog/post-1",
          pubDate: new Date("2026-01-01T00:00:00Z"),
          description: "Hello & welcome"
        }
      ]
    })

    expect(xml).toContain("<rss version=\"2.0\"")
    expect(xml).toContain("<title>My Site</title>")
    expect(xml).toContain("<description>My site description</description>")
    expect(xml).toContain("<link>https://example.com</link>")
    expect(xml).toContain("<title>Post 1 &amp; More</title>")
    expect(xml).toContain("<link>https://example.com/blog/post-1</link>")
    expect(xml).toContain("<description>Hello &amp; welcome</description>")
  })
})

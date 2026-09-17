import { describe, expect, it } from "vite-plus/test"
import { buildSitemapXml } from "../src/sitemap"
import { buildRssXml, escapeXml } from "../src/rss"

describe("@rimelight/seo - XML Escaping and Injection Hardening", () => {
  it("escapes special characters in URLs and sitemap entries to prevent XML injection", () => {
    const sitemap = buildSitemapXml([
      {
        loc: "https://rimelight.com/search?q=test<script>alert(1)</script>&type=doc",
        lastmod: "2026-09-01T00:00:00.000Z",
        changefreq: "daily",
        priority: 0.8
      }
    ])

    expect(sitemap).not.toContain("<script>")
    expect(sitemap).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(sitemap).toContain("&amp;type=doc")
  })

  it("escapes special characters in RSS title, description, and link tags", () => {
    const rss = buildRssXml({
      title: "Rimelight News & Updates <Injection>",
      site: "https://rimelight.com",
      description: "Latest announcements <&>",
      items: [
        {
          title: "Post with <bold> tag & ampersand",
          link: "https://rimelight.com/posts/1?param=1&other=2",
          description: "Dangerous CDATA content",
          pubDate: "2026-09-01T00:00:00.000Z"
        }
      ]
    })

    expect(rss).toContain("Rimelight News &amp; Updates &lt;Injection&gt;")
    expect(rss).toContain("&lt;bold&gt; tag &amp; ampersand")
  })

  it("escapeXml handles all 5 essential XML entities", () => {
    expect(escapeXml("< > & \" '")).toBe("&lt; &gt; &amp; &quot; &apos;")
  })
})

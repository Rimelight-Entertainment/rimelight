import { describe, expect, it } from "vite-plus/test"
import { buildArticleSchema, buildBreadcrumbSchema } from "./schema.js"

describe("seo-schema", () => {
  it("builds TechArticle JSON-LD schema", () => {
    const schema = buildArticleSchema({
      type: "TechArticle",
      title: "Building on Cloudflare Workers",
      description: "A complete guide to edge rendering",
      url: "https://rimelight.com/blog/cloudflare-workers",
      datePublished: new Date("2026-08-01T12:00:00Z"),
      authorName: "Idan",
      image: "https://rimelight.com/og/article.png"
    })

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("TechArticle")
    expect(schema.headline).toBe("Building on Cloudflare Workers")
    expect(schema.author).toEqual({ "@type": "Person", "name": "Idan" })
    expect(schema.datePublished).toBe("2026-08-01T12:00:00.000Z")
  })

  it("builds BreadcrumbList JSON-LD schema", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Home", url: "https://rimelight.com" },
      { name: "Docs", url: "https://rimelight.com/en/docs" },
      { name: "Installation", url: "https://rimelight.com/en/docs/installation" }
    ])

    expect(schema["@type"]).toBe("BreadcrumbList")
    expect(schema.itemListElement).toHaveLength(3)
    expect(schema.itemListElement[0]).toEqual({
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rimelight.com"
    })
    expect(schema.itemListElement[2]).toEqual({
      "@type": "ListItem",
      "position": 3,
      "name": "Installation",
      "item": "https://rimelight.com/en/docs/installation"
    })
  })
})

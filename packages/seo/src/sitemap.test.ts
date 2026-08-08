import { describe, it, expect } from "vite-plus/test"
import {
  buildSitemapUrls,
  buildSitemapXml,
  buildSitemapIndexXml,
  chunkSitemapUrls
} from "./sitemap.js"
import type { LocaleConfig, SeoEntry } from "./types.js"

describe("buildSitemapUrls", () => {
  const config: LocaleConfig = {
    site: "https://example.com",
    locales: { en: "en-US", pt: "pt-BR" },
    defaultLocale: "en"
  }

  it("builds URLs for a single entry in multiple locales", () => {
    const entries: SeoEntry[] = [{ path: "/about" }]
    const urls = buildSitemapUrls(entries, config)

    expect(urls).toHaveLength(2)
    expect(urls[0]!.loc).toBe("https://example.com/about")
    expect(urls[1]!.loc).toBe("https://example.com/pt/about")
  })

  it("includes alternates for multi-locale entries", () => {
    const entries: SeoEntry[] = [{ path: "/about" }]
    const urls = buildSitemapUrls(entries, config)

    // Default locale URL should have x-default alternate
    const defaultUrl = urls.find((u) => u.loc === "https://example.com/about")
    expect(defaultUrl?.alternates).toHaveLength(2)
    expect(defaultUrl?.alternates?.[0]!.hreflang).toBe("pt-BR")
    expect(defaultUrl?.alternates?.[0]!.href).toBe("https://example.com/pt/about")
    expect(defaultUrl?.alternates?.[1]!.hreflang).toBe("x-default")
    expect(defaultUrl?.alternates?.[1]!.href).toBe("https://example.com/about")

    // Non-default locale URL should have only the other locale as alternate
    const ptUrl = urls.find((u) => u.loc === "https://example.com/pt/about")
    expect(ptUrl?.alternates).toHaveLength(1)
    expect(ptUrl?.alternates?.[0]!.hreflang).toBe("en-US")
    expect(ptUrl?.alternates?.[0]!.href).toBe("https://example.com/about")
  })

  it("handles prefixDefaultLocale option", () => {
    const configWithPrefix: LocaleConfig = {
      ...config,
      prefixDefaultLocale: true
    }
    const entries: SeoEntry[] = [{ path: "/about" }]
    const urls = buildSitemapUrls(entries, configWithPrefix)

    expect(urls[0]!.loc).toBe("https://example.com/en/about")
    expect(urls[1]!.loc).toBe("https://example.com/pt/about")
  })

  it("handles trailingSlash option", () => {
    const configWithSlash: LocaleConfig = {
      ...config,
      trailingSlash: "always"
    }
    const entries: SeoEntry[] = [{ path: "/about" }]
    const urls = buildSitemapUrls(entries, configWithSlash)

    expect(urls[0]!.loc).toBe("https://example.com/about/")
    expect(urls[1]!.loc).toBe("https://example.com/pt/about/")
  })

  it("includes lastmod when provided", () => {
    const date = new Date("2024-01-01")
    const entries: SeoEntry[] = [{ path: "/about", lastmod: date }]
    const urls = buildSitemapUrls(entries, config)

    expect(urls[0]!.lastmod).toBe(date.toISOString())
  })

  it("includes changefreq and priority when provided", () => {
    const entries: SeoEntry[] = [{ path: "/about", changefreq: "weekly", priority: 0.8 }]
    const urls = buildSitemapUrls(entries, config)

    expect(urls[0]!.changefreq).toBe("weekly")
    expect(urls[0]!.priority).toBe(0.8)
  })

  it("restricts to specified locales", () => {
    const entries: SeoEntry[] = [{ path: "/about", locales: ["en"] }]
    const urls = buildSitemapUrls(entries, config)

    expect(urls).toHaveLength(1)
    expect(urls[0]!.loc).toBe("https://example.com/about")
  })
})

describe("buildSitemapXml", () => {
  it("generates valid XML for URLs", () => {
    const urls = [
      {
        loc: "https://example.com/about",
        lastmod: "2024-01-01T00:00:00.000Z",
        changefreq: "weekly" as const,
        priority: 0.8
      }
    ]

    const xml = buildSitemapXml(urls)

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain("<urlset")
    expect(xml).toContain("https://example.com/about")
    expect(xml).toContain("<lastmod>2024-01-01T00:00:00.000Z</lastmod>")
    expect(xml).toContain("<changefreq>weekly</changefreq>")
    expect(xml).toContain("<priority>0.8</priority>")
  })

  it("includes alternates in XML", () => {
    const urls = [
      {
        loc: "https://example.com/about",
        alternates: [
          { hreflang: "pt-BR", href: "https://example.com/pt/about" },
          { hreflang: "x-default", href: "https://example.com/about" }
        ]
      }
    ]

    const xml = buildSitemapXml(urls)

    expect(xml).toContain("xhtml:link")
    expect(xml).toContain('hreflang="pt-BR"')
    expect(xml).toContain('hreflang="x-default"')
  })

  it("escapes XML special characters", () => {
    const urls = [
      {
        loc: "https://example.com/about?query=test&amp;other=value"
      }
    ]

    const xml = buildSitemapXml(urls)

    expect(xml).toContain("&amp;")
  })
})

describe("buildSitemapIndexXml", () => {
  it("generates valid sitemap index XML", () => {
    const sitemaps = ["https://example.com/sitemap-0.xml", "https://example.com/sitemap-1.xml"]

    const xml = buildSitemapIndexXml(sitemaps)

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain("<sitemapindex")
    expect(xml).toContain("https://example.com/sitemap-0.xml")
    expect(xml).toContain("https://example.com/sitemap-1.xml")
  })
})

describe("chunkSitemapUrls", () => {
  it("chunks URLs at default limit", () => {
    const urls = Array.from({ length: 50000 }, (_, i) => ({
      loc: `https://example.com/page-${i}`
    }))

    const chunks = chunkSitemapUrls(urls)

    expect(chunks).toHaveLength(2)
    expect(chunks[0]).toHaveLength(45000)
    expect(chunks[1]).toHaveLength(5000)
  })

  it("handles custom limit", () => {
    const urls = Array.from({ length: 100 }, (_, i) => ({
      loc: `https://example.com/page-${i}`
    }))

    const chunks = chunkSitemapUrls(urls, 25)

    expect(chunks).toHaveLength(4)
    expect(chunks[0]).toHaveLength(25)
  })

  it("returns single chunk for small arrays", () => {
    const urls = [{ loc: "https://example.com/page-1" }, { loc: "https://example.com/page-2" }]

    const chunks = chunkSitemapUrls(urls)

    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toHaveLength(2)
  })
})

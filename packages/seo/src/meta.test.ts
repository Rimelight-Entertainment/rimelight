import { describe, it, expect } from "vite-plus/test"
import {
  buildCanonicalUrl,
  buildPageTitle,
  buildSafeDescription,
  buildRobotsMetaContent,
  buildWebSiteSchema
} from "./meta.js"

const BASE = "https://example.com"

describe("buildCanonicalUrl", () => {
  it("adds trailing slash to clean paths", () => {
    expect(buildCanonicalUrl("/about", BASE)).toBe("https://example.com/about/")
  })

  it("strips trailing slash from query-param paths", () => {
    expect(buildCanonicalUrl("/search?q=hello", BASE)).toBe("https://example.com/search?q=hello")
  })

  it("handles root path", () => {
    expect(buildCanonicalUrl("/", BASE)).toBe("https://example.com/")
  })

  it("resolves relative paths against base", () => {
    expect(buildCanonicalUrl(new URL("https://example.com/docs"), BASE)).toBe(
      "https://example.com/docs/"
    )
  })
})

describe("buildPageTitle", () => {
  const opts = { siteName: "My Site", titleTemplate: "%s | My Site" }

  it("applies title template", () => {
    expect(buildPageTitle({ ...opts, title: "About" })).toBe("About | My Site")
  })

  it("returns siteName when no title", () => {
    expect(buildPageTitle(opts)).toBe("My Site")
  })

  it("returns 404 label for error pages", () => {
    expect(buildPageTitle({ ...opts, is404: true })).toBe("404 - Not Found | My Site")
  })

  it("404 overrides title if both provided", () => {
    expect(buildPageTitle({ ...opts, title: "Oops", is404: true })).toBe(
      "404 - Not Found | My Site"
    )
  })
})

describe("buildSafeDescription", () => {
  it("returns description unchanged when within limit", () => {
    expect(buildSafeDescription("Short desc", 160)).toBe("Short desc")
  })

  it("truncates and appends ellipsis when over limit", () => {
    const long = "a".repeat(200)
    const result = buildSafeDescription(long, 160)
    expect(result).toHaveLength(160)
    expect(result.endsWith("...")).toBe(true)
  })

  it("handles empty string", () => {
    expect(buildSafeDescription("", 160)).toBe("")
  })

  it("truncates at exact boundary", () => {
    const text = "a".repeat(160)
    expect(buildSafeDescription(text, 160)).toBe(text)
    expect(buildSafeDescription(text + "b", 160)).toHaveLength(160)
  })
})

describe("buildRobotsMetaContent", () => {
  it("returns indexable string by default", () => {
    expect(buildRobotsMetaContent({})).toBe("index, follow, max-image-preview:large")
  })

  it("returns noindex for noindex=true", () => {
    expect(buildRobotsMetaContent({ noindex: true })).toBe("noindex, nofollow")
  })

  it("returns noindex for is404=true", () => {
    expect(buildRobotsMetaContent({ is404: true })).toBe("noindex, nofollow")
  })

  it("respects override", () => {
    expect(buildRobotsMetaContent({ override: "noarchive" })).toBe("noarchive")
  })
})

describe("buildWebSiteSchema", () => {
  const config = { name: "My Site", url: "https://example.com", description: "A test site" }

  it("builds schema.org WebSite object", () => {
    const schema = buildWebSiteSchema(config)
    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("WebSite")
    expect(schema.name).toBe("My Site")
    expect(schema.url).toBe("https://example.com")
  })

  it("prefers site param over config.url", () => {
    const schema = buildWebSiteSchema(config, "https://override.com")
    expect(schema.url).toBe("https://override.com")
  })
})

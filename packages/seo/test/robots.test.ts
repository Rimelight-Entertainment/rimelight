import { describe, it, expect } from "vite-plus/test"
import { buildRobotsTxt } from "../src/robots.js"
import type { RobotsOptions } from "../src/types.js"

describe("buildRobotsTxt", () => {
  it("generates basic robots.txt with sitemap", () => {
    const options: RobotsOptions = {
      sitemapUrl: "https://example.com/sitemap.xml"
    }

    const robots = buildRobotsTxt(options)

    expect(robots).toContain("User-agent: *")
    expect(robots).toContain("Sitemap: https://example.com/sitemap.xml")
  })

  it("includes disallow rules", () => {
    const options: RobotsOptions = {
      sitemapUrl: "https://example.com/sitemap.xml",
      disallow: ["/admin/", "/dashboard/"]
    }

    const robots = buildRobotsTxt(options)

    expect(robots).toContain("Disallow: /admin/")
    expect(robots).toContain("Disallow: /dashboard/")
  })

  it("includes allow rules", () => {
    const options: RobotsOptions = {
      sitemapUrl: "https://example.com/sitemap.xml",
      allow: ["/api/public/"]
    }

    const robots = buildRobotsTxt(options)

    expect(robots).toContain("Allow: /api/public/")
  })

  it("includes user-agent specific rules", () => {
    const options: RobotsOptions = {
      sitemapUrl: "https://example.com/sitemap.xml",
      userAgentRules: [
        {
          userAgent: "GPTBot",
          disallow: ["/admin/"]
        }
      ]
    }

    const robots = buildRobotsTxt(options)

    expect(robots).toContain("User-agent: GPTBot")
    expect(robots).toContain("Disallow: /admin/")
  })

  it("orders user-agent specific rules before wildcard", () => {
    const options: RobotsOptions = {
      sitemapUrl: "https://example.com/sitemap.xml",
      userAgentRules: [
        {
          userAgent: "GPTBot",
          disallow: ["/admin/"]
        }
      ]
    }

    const robots = buildRobotsTxt(options)

    const gptBotIndex = robots.indexOf("User-agent: GPTBot")
    const wildcardIndex = robots.indexOf("User-agent: *")

    expect(gptBotIndex).toBeLessThan(wildcardIndex)
  })
})

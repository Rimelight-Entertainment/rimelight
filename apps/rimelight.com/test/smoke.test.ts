import { describe, expect, it } from "vite-plus/test"
import { siteConfig } from "virtual:rimelight/seo"
import { languages } from "virtual:rimelight/i18n"

describe("rimelight.com site configuration", () => {
  it("defines the canonical site id and url", () => {
    expect(siteConfig.id).toBe("rimelight.com")
    expect(siteConfig.url).toBe("https://rimelight.com")
  })

  it("defines supported locales", () => {
    expect(languages).toContain("en")
    expect(languages).toContain("pt")
  })
})

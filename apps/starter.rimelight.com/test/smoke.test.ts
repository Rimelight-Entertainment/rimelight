import { describe, expect, it } from "vite-plus/test"
import { siteConfig } from "virtual:rimelight/seo"
import { languages } from "virtual:rimelight/i18n"

describe("starter.rimelight.com site configuration", () => {
  it("defines the canonical site id and url", () => {
    expect(siteConfig.id).toBe("starter")
    expect(siteConfig.url).toBe("https://starter.rimelight.com")
  })

  it("defines supported locales", () => {
    expect(languages).toContain("en")
    expect(languages).toContain("pt")
  })
})

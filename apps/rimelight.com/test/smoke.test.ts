import { describe, expect, it } from "vite-plus/test"
import { siteConfig } from "../src/config/site.config"
import { languages } from "../src/config/i18n.config"

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

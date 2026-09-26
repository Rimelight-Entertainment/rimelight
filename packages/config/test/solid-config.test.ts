import { describe, it, expect } from "vite-plus/test"
import { resolveImageDomains, resolveSecurityOptions, rimelightSolidConfig } from "../solid/index"

describe("@rimelight/config solid presets", () => {
  describe("resolveImageDomains", () => {
    it("should derive domain, cdn, and shared cdn defaults", () => {
      expect(resolveImageDomains({ domain: "example.com" })).toEqual([
        "example.com",
        "cdn.example.com",
        "cdn.rimelight.com"
      ])
    })

    it("should pass through explicit imageDomains", () => {
      expect(resolveImageDomains({ imageDomains: ["images.example.com"] })).toEqual([
        "images.example.com"
      ])
    })

    it("should return empty list without domain", () => {
      expect(resolveImageDomains()).toEqual([])
    })
  })

  describe("resolveSecurityOptions", () => {
    it("should return undefined when security is not enabled", () => {
      expect(resolveSecurityOptions({ domain: "example.com" })).toBeUndefined()
      expect(resolveSecurityOptions({ domain: "example.com", security: false })).toBeUndefined()
    })

    it("should derive domain and https imgSrc from image domains", () => {
      const result = resolveSecurityOptions({ domain: "example.com", security: true })
      expect(result?.domain).toBe("example.com")
      expect(result?.imgSrc).toEqual([
        "https://example.com",
        "https://cdn.example.com",
        "https://cdn.rimelight.com"
      ])
    })

    it("should merge custom imgSrc with derived defaults", () => {
      const result = resolveSecurityOptions({
        domain: "example.com",
        security: { imgSrc: ["https://images.example.com"] }
      })
      expect(result?.domain).toBe("example.com")
      expect(result?.imgSrc).toEqual([
        "https://example.com",
        "https://cdn.example.com",
        "https://cdn.rimelight.com",
        "https://images.example.com"
      ])
    })

    it("should prefer explicit security domain override", () => {
      const result = resolveSecurityOptions({
        domain: "example.com",
        security: { domain: "other.com" }
      })
      expect(result?.domain).toBe("other.com")
    })
  })

  describe("rimelightSolidConfig", () => {
    it("should derive site, image domains, and security options from domain", () => {
      const config = rimelightSolidConfig({ domain: "example.com", security: true })
      expect(config.site).toBe("https://example.com")
      expect(config.imageDomains).toContain("cdn.example.com")
      expect(config.securityOptions?.domain).toBe("example.com")
      expect(config.securityOptions?.imgSrc).toContain("https://cdn.example.com")
    })

    it("should omit security options when security is not enabled", () => {
      const config = rimelightSolidConfig({ domain: "example.com" })
      expect(config.site).toBe("https://example.com")
      expect(config.securityOptions).toBeUndefined()
    })
  })
})

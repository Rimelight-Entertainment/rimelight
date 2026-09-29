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
    it("should derive options by default when a domain is present", () => {
      const result = resolveSecurityOptions({ domain: "example.com" })
      expect(result?.domain).toBe("example.com")
      expect(result?.imgSrc).toEqual([
        "https://example.com",
        "https://cdn.example.com",
        "https://cdn.rimelight.com"
      ])
    })

    it("should return undefined only when explicitly disabled", () => {
      expect(resolveSecurityOptions({ domain: "example.com", security: false })).toBeUndefined()
      expect(resolveSecurityOptions()).toBeUndefined()
    })

    it("should never emit a domain-less CSP for a domain-scoped app", () => {
      const result = resolveSecurityOptions({ domain: "rimelight.com" })
      expect(result?.domain).toBe("rimelight.com")
      expect(result?.imgSrc).toContain("https://cdn.rimelight.com")
      expect(new Set(result?.imgSrc).size).toBe(result?.imgSrc?.length)
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

    it("should provide usable security options with only a domain, no opt-in required", () => {
      const config = rimelightSolidConfig({ domain: "rimelight.com" })
      expect(config.site).toBe("https://rimelight.com")
      expect(config.securityOptions?.domain).toBe("rimelight.com")
      expect(config.securityOptions?.imgSrc).toContain("https://cdn.rimelight.com")
    })

    it("should omit security options only when explicitly disabled", () => {
      const config = rimelightSolidConfig({ domain: "example.com", security: false })
      expect(config.site).toBe("https://example.com")
      expect(config.securityOptions).toBeUndefined()
    })
  })
})

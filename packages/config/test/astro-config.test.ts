import { describe, it, expect, vi } from "vite-plus/test"
import {
  cacheRulesPreset,
  fontsPreset,
  imagePreset,
  cloudflarePreset,
  rimelightAstroConfig
} from "../astro/index"

describe("@rimelight/config astro presets", () => {
  describe("cacheRulesPreset", () => {
    it("should return default cache rules", () => {
      const config = cacheRulesPreset()
      expect(config.routeRules["/api/[...path]"]).toEqual({ swr: 600 })
      expect(config.routeRules["/[...path]"]).toEqual({ maxAge: 300 })
    })

    it("should allow custom cache rules and times", () => {
      const config = cacheRulesPreset({
        apiSwrSeconds: 120,
        pageMaxAgeSeconds: 60,
        customRules: { "/static/[...path]": { maxAge: 86400 } }
      })
      expect(config.routeRules["/api/[...path]"]).toEqual({ swr: 120 })
      expect(config.routeRules["/[...path]"]).toEqual({ maxAge: 60 })
      expect(config.routeRules["/static/[...path]"]).toEqual({ maxAge: 86400 })
    })
  })

  describe("fontsPreset", () => {
    it("should return standard default fonts with sans, serif, and mono", () => {
      const result = fontsPreset()
      expect(result.fonts).toHaveLength(3)
      expect(result.fonts[0].name).toBe("Noto Sans")
      expect(result.fonts[1].name).toBe("Noto Serif")
      expect(result.fonts[2].name).toBe("JetBrains Mono")
    })

    it("should accept custom font configuration and attach provider", () => {
      const customFonts = [
        { name: "Inter", cssVariable: "--font-inter", fallbacks: ["sans-serif"] }
      ]
      const result = fontsPreset({ fonts: customFonts })
      expect(result.fonts[0]).toMatchObject({
        name: "Inter",
        cssVariable: "--font-inter",
        fallbacks: ["sans-serif"]
      })
      expect(result.fonts[0].provider).toBeDefined()
    })
  })

  describe("imagePreset", () => {
    it("should return default image options", () => {
      const result = imagePreset()
      expect(result.image).toEqual({
        domains: [],
        layout: "constrained",
        responsiveStyles: true
      })
    })

    it("should configure custom domains and layout", () => {
      const result = imagePreset({
        domains: ["images.example.com"],
        layout: "full-width",
        responsiveStyles: false
      })
      expect(result.image.domains).toContain("images.example.com")
      expect(result.image.layout).toBe("full-width")
      expect(result.image.responsiveStyles).toBe(false)
    })
  })

  describe("cloudflarePreset", () => {
    it("should return server output and cloudflare defaults", () => {
      const result = cloudflarePreset({
        adapter: "mock-adapter",
        cacheProvider: "mock-cache",
        session: true
      })
      expect(result.output).toBe("server")
      expect(result.session).toBe(true)
      expect(result.adapter).toBe("mock-adapter")
      expect(result.cache.provider).toBe("mock-cache")
    })
  })

  describe("rimelightAstroConfig", () => {
    it("should generate comprehensive astro configuration with defaults", () => {
      const config = rimelightAstroConfig({
        domain: "example.com"
      })

      expect(config.site).toBe("https://example.com")
      expect(config.prefetch).toEqual({ prefetchAll: true })
      expect(config.output).toBe("server")
      expect(config.markdown.syntaxHighlight).toBe("prism")
      expect(config.image.domains).toContain("example.com")
      expect(config.image.domains).toContain("cdn.example.com")
      expect(config.image.domains).toContain("cdn.rimelight.com")
      expect(config.routeRules["/api/[...path]"]).toEqual({ swr: 600 })
    })

    it("should attach rimelight integration when flags are enabled", () => {
      const config = rimelightAstroConfig({
        domain: "example.com",
        seo: true,
        security: true,
        ui: true,
        i18n: true
      })

      expect(config.integrations).toHaveLength(1)
      expect(config.integrations[0].name).toBe("rimelight-auto-plugins")
      expect(typeof config.integrations[0].hooks["astro:config:setup"]).toBe("function")
    })

    it("should execute integration setup hook properly", async () => {
      const config = rimelightAstroConfig({
        domain: "example.com",
        seo: true,
        security: true
      })

      const updateConfig = vi.fn()
      await config.integrations[0].hooks["astro:config:setup"]({ updateConfig })

      expect(updateConfig).toHaveBeenCalled()
      const callArgs = updateConfig.mock.calls?.[0]?.[0]
      expect(callArgs).toHaveProperty("integrations")
      expect(callArgs).toHaveProperty("vite")
    })
  })
})

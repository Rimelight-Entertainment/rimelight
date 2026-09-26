import { describe, it, expect } from "vite-plus/test"
import { seo, isContained } from "../src/plugin.js"
import path from "node:path"

describe("isContained path containment", () => {
  const root = process.cwd()

  it("returns true for paths inside root", () => {
    expect(isContained(root, path.join(root, "package.json"))).toBe(true)
    expect(isContained(root, "./package.json")).toBe(true)
  })

  it("returns false for path traversal attempts", () => {
    expect(isContained(root, "../../../../../../../etc/passwd")).toBe(false)
    expect(isContained(root, "../..")).toBe(false)
  })
})

describe("seo Vite Plugin", () => {
  it("resolves virtual modules correctly", () => {
    const plugin = seo({
      name: "Test Site",
      url: "https://test.rimelight.com"
    })

    const resolvedSeo = (plugin.resolveId as any)("virtual:rimelight/seo")
    expect(resolvedSeo).toBe("\0virtual:rimelight/seo")

    const resolvedServer = (plugin.resolveId as any)("virtual:rimelight/seo/server")
    expect(resolvedServer).toBe("\0virtual:rimelight/seo/server")
  })

  it("loads virtual:rimelight/seo with normalized config and pre-bound createHead", () => {
    const plugin = seo({
      name: "Plugin Test Site",
      url: "https://plugintest.com"
    })

    const loaded = (plugin.load as any)("\0virtual:rimelight/seo")
    expect(loaded).toContain('"name":"Plugin Test Site"')
    expect(loaded).toContain('"url":"https://plugintest.com"')
    expect(loaded).toContain("export const createHead = defineSeoConfig(siteConfig)")
    expect(loaded).toContain("export { createHead as createSeoHead, defineSeoConfig }")
  })

  it("emits static assets during generateBundle", async () => {
    const emitted: any[] = []
    const plugin = seo({
      name: "Bundle Site",
      url: "https://bundle.com",
      robots: true,
      sitemap: true,
      security: true
    })

    const mockContext = {
      emitFile(file: any) {
        emitted.push(file)
      }
    }

    await (plugin.generateBundle as any).call(mockContext)

    const fileNames = emitted.map((e) => e.fileName)
    expect(fileNames).toContain("robots.txt")
    expect(fileNames).toContain("sitemap.xml")
    expect(fileNames).toContain("sitemap-index.xml")
    expect(fileNames).toContain(".well-known/security.txt")
    expect(fileNames).toContain("site.webmanifest")
  })

  it("emits icon assets when branding favicon SVG is provided", async () => {
    const emitted: any[] = []
    const plugin = seo({
      name: "Icon Site",
      url: "https://icon.com",
      branding: {
        favicon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00f"/></svg>`
        }
      }
    })

    ;(plugin.configResolved as any)({ root: process.cwd() })

    const mockContext = {
      emitFile(file: any) {
        emitted.push(file)
      }
    }

    await (plugin.generateBundle as any).call(mockContext)

    const fileNames = emitted.map((e) => e.fileName)
    expect(fileNames).toContain("icon-192.png")
    expect(fileNames).toContain("icon-512.png")
    expect(fileNames).toContain("icon-maskable-512.png")
    expect(fileNames).toContain("favicon.ico")
    expect(fileNames).toContain("apple-touch-icon.png")
    expect(fileNames).toContain("favicon.svg")
  })
})

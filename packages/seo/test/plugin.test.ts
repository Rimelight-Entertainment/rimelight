import { describe, it, expect } from "vite-plus/test"
import { rimelightSeo, isContained } from "../src/plugin.js"
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

describe("rimelightSeo Vite Plugin", () => {
  it("resolves virtual modules correctly", () => {
    const plugin = rimelightSeo({
      name: "Test Site",
      url: "https://test.rimelight.com"
    })

    const resolvedSeo = (plugin.resolveId as any)("virtual:rimelight/seo")
    expect(resolvedSeo).toBe("\0virtual:rimelight/seo")

    const resolvedServer = (plugin.resolveId as any)("virtual:rimelight/seo/server")
    expect(resolvedServer).toBe("\0virtual:rimelight/seo/server")
  })

  it("loads virtual:rimelight/seo with normalized config and pre-bound createHead", () => {
    const plugin = rimelightSeo({
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
    const plugin = rimelightSeo({
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
})

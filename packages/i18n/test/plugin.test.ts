import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vite-plus/test"
import { i18n } from "../src/plugin"

describe("@rimelight/i18n Vite plugin", () => {
  it("creates virtual modules for config and runtime", () => {
    const plugins = i18n({
      locales: ["en", "pt", "es"],
      defaultLocale: "en",
      prefixDefaultLocale: false,
      translations: {
        en: { nav: { home: "Home" } },
        pt: { nav: { home: "Início" } }
      }
    })

    expect(plugins.length).toBeGreaterThan(0)
    const configPlugin = plugins[0]!

    // Resolve IDs
    expect(configPlugin.resolveId!("virtual:rimelight-i18n-config")).toBe(
      "\0virtual:rimelight-i18n-config"
    )
    expect(configPlugin.resolveId!("virtual:rimelight/i18n")).toBe("\0virtual:rimelight/i18n")
    expect(configPlugin.resolveId!("other-module")).toBeNull()

    // Load virtual content
    const loaded = configPlugin.load!("\0virtual:rimelight-i18n-config") as string
    expect(loaded).toContain(`["en","pt","es"]`)
    expect(loaded).toContain(`export const defaultLocale = "en";`)
    expect(loaded).toContain(`export const prefixDefaultLocale = false;`)
    expect(loaded).toContain(`"Início"`)
  })

  it("handles default options when none are passed", () => {
    const plugins = i18n()
    const configPlugin = plugins[0]!
    const loaded = configPlugin.load!("\0virtual:rimelight-i18n-config") as string

    expect(loaded).toContain(`export const defaultLocale = "en";`)
    expect(loaded).toContain(`export const prefixDefaultLocale = true;`)
  })

  it("generates translations seed file on closeBundle", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-seed-"))
    process.env["WRANGLER_OUT_DIR"] = tmpDir

    try {
      const plugins = i18n({
        locales: ["en", "pt"],
        defaultLocale: "en",
        translations: {
          en: { nav: { home: "Home" } },
          pt: { nav: { home: "Início" } }
        }
      })

      const configPlugin = plugins[0]!
      await configPlugin.closeBundle!()

      const seedPath = path.join(tmpDir, "_translations-seed.json")
      expect(fs.existsSync(seedPath)).toBe(true)

      const seedContent = JSON.parse(fs.readFileSync(seedPath, "utf-8"))
      expect(seedContent.keys).toContainEqual({
        key: "locale:en:nav",
        value: JSON.stringify({ home: "Home" })
      })
      expect(seedContent.keys).toContainEqual({
        key: "locale:pt:nav",
        value: JSON.stringify({ home: "Início" })
      })
    } finally {
      delete process.env["WRANGLER_OUT_DIR"]
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})

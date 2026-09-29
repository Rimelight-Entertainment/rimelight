import { describe, it, expect } from "vite-plus/test"
import path from "node:path"
import fs from "node:fs"
import { rimelightConfig, rimelightPackConfig, findSourceEntries } from "../vite-plus/base"

describe("@rimelight/config vite-plus helpers", () => {
  describe("rimelightConfig", () => {
    it("should return base configuration for lint, formatting, and test", () => {
      const config = rimelightConfig()
      expect(config.fmt?.semi).toBe(false)
      expect(config.fmt?.trailingComma).toBe("none")
      expect(config.lint?.options?.typeCheck).toBe(true)
      expect(config.test?.environment).toBe("node")
    })
  })

  describe("rimelightPackConfig", () => {
    it("should merge pack options with base config", () => {
      const pack = rimelightPackConfig({
        entry: ["src/index.ts", "src/extra.ts"]
      })
      expect(pack.pack.entry).toEqual(["src/index.ts", "src/extra.ts"])
      expect(pack.pack.dts).toBe(true)
      expect(pack.fmt.semi).toBe(false)
    })
  })

  describe("package integrity utils", () => {
    it("should find source entries in given base directory", () => {
      const baseDir = path.resolve(import.meta.dirname, "../vite-plus")
      const entries = findSourceEntries(baseDir)
      expect(entries.some((e) => e.endsWith("base.ts"))).toBe(true)
    })

    it("should return empty array if baseDir does not exist", () => {
      const entries = findSourceEntries("non-existent-directory")
      expect(entries).toEqual([])
    })

    it("should not ship exports or files entries that do not exist on disk", () => {
      const pkgDir = path.resolve(import.meta.dirname, "..")
      const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"))

      const targets: string[] = []
      for (const value of Object.values<unknown>(pkg.exports ?? {})) {
        if (typeof value === "string") {
          targets.push(value)
        } else if (value && typeof value === "object") {
          for (const entry of Object.values<unknown>(value as Record<string, unknown>)) {
            if (typeof entry === "string") targets.push(entry)
          }
        }
      }
      const files: string[] = pkg.files ?? []
      targets.push(...files)

      expect(targets.length).toBeGreaterThan(0)

      // A `files` entry that is absent entirely is build output that has not been
      // generated yet, so its export targets are not expected on a clean checkout.
      const pending = new Set(files.filter((entry) => !fs.existsSync(path.join(pkgDir, entry))))

      const missing = targets
        .filter((t) => t.startsWith("./"))
        .map((t) => t.replace(/^\.\//, ""))
        .filter((rel) => ![...pending].some((entry) => rel.startsWith(`${entry}/`)))
        .filter((rel) => !fs.existsSync(path.join(pkgDir, rel)))
      expect(missing).toEqual([])
    })
  })
})

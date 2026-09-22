import { describe, it, expect } from "vite-plus/test"
import path from "node:path"
import { rimelightDrizzleConfig } from "../drizzle/index"
import { rimelightConfig, rimelightPackConfig, findSourceEntries } from "../vite-plus/base"

describe("@rimelight/config drizzle and vite-plus helpers", () => {
  describe("rimelightDrizzleConfig", () => {
    it("should generate drizzle config with sensible defaults", () => {
      const config = rimelightDrizzleConfig()
      expect(config.out).toBe("./drizzle")
      expect(config.schema).toBe("./src/db/schema/index.ts")
      expect(config.dialect).toBe("sqlite")
    })

    it("should accept custom overrides", () => {
      const config = rimelightDrizzleConfig({
        out: "./custom-migrations",
        schema: "./src/schema.ts",
        dialect: "postgresql"
      })
      expect(config.out).toBe("./custom-migrations")
      expect(config.schema).toBe("./src/schema.ts")
      expect(config.dialect).toBe("postgresql")
    })
  })

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
      const baseDir = path.resolve(import.meta.dirname, "../astro")
      const entries = findSourceEntries(baseDir)
      expect(entries.some((e) => e.endsWith("index.ts"))).toBe(true)
    })

    it("should return empty array if baseDir does not exist", () => {
      const entries = findSourceEntries("non-existent-directory")
      expect(entries).toEqual([])
    })
  })
})

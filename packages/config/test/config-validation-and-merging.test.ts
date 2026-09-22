import { describe, expect, it } from "vite-plus/test"
import { rimelightAstroConfig } from "../astro/index"
import { rimelightConfig } from "../vite-plus/base"

describe("@rimelight/config - Config Validation and Merging", () => {
  it("merges custom Astro config options while preserving core integrations", () => {
    const config = rimelightAstroConfig({
      domain: "custom.rimelight.com",
      output: "server"
    })

    expect(config.site).toBe("https://custom.rimelight.com")
    expect(config.output).toBe("server")
    expect(Array.isArray(config.integrations)).toBe(true)
  })

  it("produces valid Vite+ base configuration", () => {
    const base = rimelightConfig()
    expect(base).toBeDefined()
    expect(base.lint?.options?.typeCheck).toBe(true)
    expect(base.fmt?.semi).toBe(false)
    expect(base.test?.environment).toBe("node")
  })
})

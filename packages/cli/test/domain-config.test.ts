import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test"
import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { updateDomainConfigs } from "../src/index"

describe("@rimelight/cli domain configuration updates", () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rimelight-cli-test-"))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it("should update astro.config.ts and wrangler.jsonc with custom domain", async () => {
    const astroPath = path.join(tmpDir, "astro.config.ts")
    const wranglerPath = path.join(tmpDir, "wrangler.jsonc")

    await fs.writeFile(
      astroPath,
      'import { rimelightAstroConfig } from "@rimelight/config/astro"\nexport default rimelightAstroConfig({ site: "https://starter.rimelight.com" })',
      "utf-8"
    )

    await fs.writeFile(
      wranglerPath,
      JSON.stringify({ name: "starter-template", routes: [] }, null, 2),
      "utf-8"
    )

    await updateDomainConfigs(tmpDir, "my-app.com", "my-app")

    const astroContent = await fs.readFile(astroPath, "utf-8")
    const wranglerContent = await fs.readFile(wranglerPath, "utf-8")
    const parsedWrangler = JSON.parse(wranglerContent)

    expect(astroContent).toContain('site: "https://my-app.com"')
    expect(parsedWrangler.name).toBe("my-app-dot-com")
    expect(parsedWrangler.routes).toEqual([
      { pattern: "my-app.com", custom_domain: true },
      { pattern: "www.my-app.com", custom_domain: true }
    ])
  })

  it("should format project name into wrangler.jsonc when no domain is provided", async () => {
    const wranglerPath = path.join(tmpDir, "wrangler.jsonc")

    await fs.writeFile(
      wranglerPath,
      JSON.stringify({ name: "starter-template", routes: [{ pattern: "old.com" }] }, null, 2),
      "utf-8"
    )

    await updateDomainConfigs(tmpDir, "", "My Super App")

    const parsedWrangler = JSON.parse(await fs.readFile(wranglerPath, "utf-8"))
    expect(parsedWrangler.name).toBe("my-super-app")
    // Should preserve existing routes if domain is empty
    expect(parsedWrangler.routes).toEqual([{ pattern: "old.com" }])
  })
})

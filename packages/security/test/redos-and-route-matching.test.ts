import { describe, expect, it } from "vite-plus/test"
import { construction, isConstructionGuest } from "../src/middleware/construction"

describe("@rimelight/security - ReDoS and Route Matching Robustness", () => {
  it("safely and quickly evaluates regex and string route rules against hostile inputs", async () => {
    const middleware = construction()
    const evilPath = "/assets/" + "a".repeat(2500) + "!!!!.exe"

    let redirected = false
    const ctx = {
      req: {
        path: evilPath,
        method: "GET",
        raw: { headers: new Headers() },
        url: "http://localhost" + evilPath
      },
      env: {
        CONSTRUCTION_MODE: "true",
        CONSTRUCTION_PASSPHRASE: "secret"
      },
      redirect: () => {
        redirected = true
        return { status: 302 }
      },
      json: () => {}
    }

    const startTime = Date.now()
    await middleware(ctx, async () => {})
    const elapsedMs = Date.now() - startTime

    expect(elapsedMs).toBeLessThan(100)
    expect(redirected).toBe(true)
  })

  it("evaluates guest cookie verification correctly", async () => {
    const mockContext = {
      req: { raw: { headers: new Headers() } },
      env: { CONSTRUCTION_PASSPHRASE: "pass" }
    }
    const isGuest = await isConstructionGuest(mockContext)
    expect(isGuest).toBe(false)
  })
})

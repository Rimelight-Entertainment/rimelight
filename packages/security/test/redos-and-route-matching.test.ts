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
    const result = await middleware(ctx, async () => "next-called")
    const elapsedMs = Date.now() - startTime

    expect(elapsedMs).toBeLessThan(100)
    // /assets/ is whitelisted, so the request is forwarded to the host untouched. It is never
    // answered with a redirect to the HTML construction page.
    expect(redirected).toBe(false)
    expect(result).toBe("next-called")
  })

  it("does not leak regex backtracking when a whitelisted prefix is followed by hostile input", async () => {
    const middleware = construction()
    const evilPath = "/" + "a".repeat(4000) + "/x.png"

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
      redirect: () => ({ status: 302 }),
      json: () => {}
    }

    const startTime = Date.now()
    const res = (await middleware(ctx, async () => {})) as Response
    expect(Date.now() - startTime).toBeLessThan(100)
    expect(res.status).toBe(404)
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

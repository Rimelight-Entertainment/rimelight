import { describe, it, expect, vi } from "vitest"
import {
  construction,
  isConstructionGuest,
  signInConstructionGuest,
  CONSTRUCTION_GUEST_COOKIE
} from "../src/middleware/construction"

describe("@rimelight/security construction middleware", () => {
  const passphrase = "secret-passphrase-999"

  const createMockContext = (
    options: {
      path?: string
      method?: string
      cookie?: string
      mode?: boolean | string
      passphraseVal?: string
      body?: any
    } = {}
  ) => {
    let redirected: string | null = null
    let jsonResp: any = null
    const reqHeaders = new Headers()
    if (options.cookie) {
      reqHeaders.set("cookie", `${CONSTRUCTION_GUEST_COOKIE}=${options.cookie}`)
    }

    return {
      req: {
        path: options.path || "/",
        method: options.method || "GET",
        raw: { headers: reqHeaders },
        url: `http://localhost${options.path || "/"}`,
        json: async () => options.body || {}
      },
      env: {
        CONSTRUCTION_MODE: options.mode !== undefined ? options.mode : "true",
        CONSTRUCTION_PASSPHRASE: options.passphraseVal || passphrase
      },
      redirect: (target: string) => {
        redirected = target
        return { status: 302, headers: { Location: target } }
      },
      json: (data: any, status = 200) => {
        jsonResp = { data, status }
        return jsonResp
      },
      getRedirected: () => redirected,
      getJson: () => jsonResp
    }
  }

  it("should pass next when construction mode is disabled", async () => {
    const middleware = construction()
    const ctx = createMockContext({ mode: "false" })
    const next = vi.fn().mockResolvedValue("next-called")

    const res = await middleware(ctx, next)
    expect(next).toHaveBeenCalled()
  })

  it("should pass whitelisted static and auth assets when enabled", async () => {
    const middleware = construction()
    const ctx = createMockContext({ path: "/_astro/styles.css", mode: "true" })
    const next = vi.fn().mockResolvedValue("next-called")

    await middleware(ctx, next)
    expect(next).toHaveBeenCalled()
  })

  it("should redirect unauthorized visitor to construction page", async () => {
    const middleware = construction()
    const ctx = createMockContext({ path: "/dashboard", mode: "true" })
    const next = vi.fn()

    await middleware(ctx, next)
    expect(next).not.toHaveBeenCalled()
    expect(ctx.getRedirected()).toContain("/en/construction?redirect=")
  })

  it("should handle guest sign-in endpoint properly", async () => {
    const middleware = construction()
    const ctx = createMockContext({
      path: "/api/construction-guest",
      method: "POST",
      body: { passphrase }
    })
    const next = vi.fn()

    await middleware(ctx, next)
    expect(ctx.getJson()).toEqual({ data: { success: true }, status: 200 })
  })

  it("should reject guest sign-in with bad passphrase", async () => {
    const middleware = construction()
    const ctx = createMockContext({
      path: "/api/construction-guest",
      method: "POST",
      body: { passphrase: "wrong" }
    })
    const next = vi.fn()

    await middleware(ctx, next)
    expect(ctx.getJson()).toEqual({ data: { error: "Invalid credentials" }, status: 401 })
  })
})

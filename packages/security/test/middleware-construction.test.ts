import { describe, it, expect, vi } from "vite-plus/test"
import { construction, CONSTRUCTION_GUEST_COOKIE } from "../src/middleware/construction"

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

    await middleware(ctx, next)
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

  it("should support zero-dep cookie extraction from Astro c.cookies and Hono c.req.header", async () => {
    const middleware = construction()
    let setCookieVal: any = null

    // Sign in to generate valid cookie
    const honoCtx = {
      req: {
        path: "/api/construction-guest",
        method: "POST",
        json: async () => ({ passphrase })
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      header: (name: string, value: string) => {
        if (name === "Set-Cookie") setCookieVal = value
      },
      json: (data: any, status = 200) => ({ data, status })
    }

    await middleware(honoCtx, vi.fn())
    expect(setCookieVal).toContain(CONSTRUCTION_GUEST_COOKIE)

    // Extract cookie value
    const match = setCookieVal.match(new RegExp(`${CONSTRUCTION_GUEST_COOKIE}=([^;]+)`))
    const token = match[1]

    // 1. Verify access with Astro c.cookies.get
    const astroCtx = {
      req: { path: "/protected" },
      cookies: {
        get: (name: string) => (name === CONSTRUCTION_GUEST_COOKIE ? { value: token } : undefined)
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      redirect: vi.fn()
    }
    const nextAstro = vi.fn()
    await middleware(astroCtx, nextAstro)
    expect(nextAstro).toHaveBeenCalled()

    // 2. Verify access with Hono c.req.header("cookie")
    const honoReqCtx = {
      req: {
        path: "/protected",
        header: (name: string) =>
          name === "cookie" ? `${CONSTRUCTION_GUEST_COOKIE}=${token}` : undefined
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      redirect: vi.fn()
    }
    const nextHono = vi.fn()
    await middleware(honoReqCtx, nextHono)
    expect(nextHono).toHaveBeenCalled()
  })

  it("should timing-safely reject mismatched passphrase lengths without errors", async () => {
    const middleware = construction()
    const testCases = ["", "a", "secret-passphrase", "secret-passphrase-9999", "wrong!"]

    for (const testPass of testCases) {
      const ctx = createMockContext({
        path: "/api/construction-guest",
        method: "POST",
        body: { passphrase: testPass }
      })
      await middleware(ctx, vi.fn())
      expect(ctx.getJson()).toEqual({ data: { error: "Invalid credentials" }, status: 401 })
    }
  })
})

import { describe, expect, it, vi } from "vite-plus/test"

vi.mock("virtual:sri-manifest", () => ({
  manifest: {}
}))

vi.mock("virtual:rimelight-security-config", () => ({
  config: {}
}))

import { security } from "../src/middleware/security"

describe("Security Middleware Headers", () => {
  it("sets standard COEP (credentialless), COOP, and CORP headers by default", async () => {
    const middleware = security()
    const req = new Request("https://rimelight.com/api/test")
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" }
    })

    const ctx = {
      req: { raw: req },
      res
    }

    const next = async () => {}
    const result = await middleware(ctx, next)
    const response = result || ctx.res

    expect(response.headers.get("Cross-Origin-Embedder-Policy")).toBe("credentialless")
    expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin")
    expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin")
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
    expect(response.headers.get("X-Frame-Options")).toBe("DENY")
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
  })

  it("supports custom Cross-Origin-Embedder-Policy configuration", async () => {
    const middleware = security({
      crossOriginEmbedderPolicy: "require-corp"
    })
    const req = new Request("https://rimelight.com/api/test")
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" }
    })
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBe("require-corp")
  })

  it("supports custom Cross-Origin-Opener-Policy configuration", async () => {
    const middleware = security({
      crossOriginOpenerPolicy: "same-origin-allow-popups"
    })
    const req = new Request("https://rimelight.com/api/test")
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" }
    })
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups")
  })

  it("supports disabling COEP / COOP / CORP headers with false", async () => {
    const middleware = security({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false
    })
    const req = new Request("https://rimelight.com/api/test")
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" }
    })
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBeNull()
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBeNull()
    expect(ctx.res.headers.get("Cross-Origin-Resource-Policy")).toBeNull()
  })

  it("allows overriding headers via custom headers object", async () => {
    const middleware = security({
      headers: {
        "Cross-Origin-Embedder-Policy": "unsafe-none",
        "Cross-Origin-Opener-Policy": "noopener-allow-popups"
      }
    })
    const req = new Request("https://rimelight.com/api/test")
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" }
    })
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBe("unsafe-none")
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBe("noopener-allow-popups")
  })

  it("sets COEP and COOP headers on HTML responses", async () => {
    const middleware = security()
    const req = new Request("https://rimelight.com/")
    const res = new Response("<!DOCTYPE html><html><head></head><body>Hello</body></html>", {
      headers: { "content-type": "text/html; charset=utf-8" }
    })
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBe("credentialless")
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin")
  })
})

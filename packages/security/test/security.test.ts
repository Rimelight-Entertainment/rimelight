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
    expect(response.headers.get("X-XSS-Protection")).toBe("0")
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

  it("strips fingerprinting headers by default", async () => {
    const middleware = security()
    const req = new Request("https://rimelight.com/api/test")
    const res = new Response('{"ok":true}', {
      headers: {
        "content-type": "application/json",
        "x-powered-by": "Express/Next",
        "server": "cloudflare",
        "x-aspnet-version": "4.0.30319",
        "public-key-pins": "max-age=5184000"
      }
    })
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    expect(ctx.res.headers.get("x-powered-by")).toBeNull()
    expect(ctx.res.headers.get("server")).toBeNull()
    expect(ctx.res.headers.get("x-aspnet-version")).toBeNull()
    expect(ctx.res.headers.get("public-key-pins")).toBeNull()
  })

  it("enforces TLS 1.2+ when enforceTls is enabled and cf.tlsVersion is present", async () => {
    const middleware = security({ enforceTls: true })
    const req = new Request("https://rimelight.com/api/test")
    ;(req as any).cf = { tlsVersion: "TLSv1.1" }
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" }
    })
    const ctx = { req: { raw: req }, res }

    const result = await middleware(ctx, async () => {})
    expect(result).toBeDefined()
    expect(result?.status).toBe(400)
    const text = await result?.text()
    expect(text).toContain("TLS 1.2 or higher is required")
  })

  it("generates a valid 128-bit Base64 nonce on HTML responses", async () => {
    const middleware = security()
    const req = new Request("https://rimelight.com/")
    const res = new Response(
      "<!DOCTYPE html><html><head></head><body><script>console.log(1)</script></body></html>",
      {
        headers: { "content-type": "text/html; charset=utf-8" }
      }
    )
    const ctx = { req: { raw: req }, res }

    await middleware(ctx, async () => {})
    const csp = ctx.res.headers.get("Content-Security-Policy")
    expect(csp).toBeDefined()
    // Extract nonce
    const match = csp?.match(/'nonce-([A-Za-z0-9+/=]+)'/)
    expect(match).toBeTruthy()
    const nonceVal = match?.[1]
    expect(nonceVal).toBeDefined()
    // 16 bytes base64 is 24 characters
    expect(nonceVal?.length).toBe(24)
  })
})

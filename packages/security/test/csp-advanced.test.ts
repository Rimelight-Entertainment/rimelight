import { describe, it, expect } from "vite-plus/test"
import { buildCspHeader } from "../src/csp"

describe("@rimelight/security CSP header generator", () => {
  it("should generate strict baseline Content-Security-Policy", () => {
    const csp = buildCspHeader({ domain: "example.com" })

    expect(csp).toContain("default-src 'none'")
    expect(csp).toContain(
      "img-src 'self' data: https://cdn.example.com https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com"
    )
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("upgrade-insecure-requests")
  })

  it("should incorporate request nonce into script-src", () => {
    const nonce = "random-test-nonce-12345"
    const csp = buildCspHeader({ domain: "example.com" }, nonce)

    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`)
  })

  it("should support trustedTypes flag", () => {
    const csp = buildCspHeader({ trustedTypes: true })
    expect(csp).toContain("require-trusted-types-for 'script'")
  })

  it("should allow merging and disabling custom directives", () => {
    const csp = buildCspHeader({
      directives: {
        "frame-ancestors": false,
        "connect-src": ["'self'", "https://api.example.com"]
      }
    })

    expect(csp).not.toContain("frame-ancestors")
    expect(csp).toContain("connect-src 'self' https://api.example.com")
  })
})

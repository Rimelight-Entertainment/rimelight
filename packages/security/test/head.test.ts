import { describe, it, expect } from "vite-plus/test"
import { createSecurityHead } from "../src/head"

describe("createSecurityHead generator", () => {
  it("should generate Trusted Types, CSP nonce sync, and dev reporter scripts", () => {
    const head = createSecurityHead({ nonce: "test-nonce-123", devReporter: true })
    expect(head.html).toContain('nonce="test-nonce-123"')
    expect(head.html).toContain("trustedTypes.createPolicy")
    expect(head.html).toContain("initialCspNonce")
    expect(head.html).toContain("securitypolicyviolation")
    expect(head.tags.length).toBe(3)
  })

  it("should support disabling individual components", () => {
    const head = createSecurityHead({ trustedTypes: false, devReporter: false })
    expect(head.html).not.toContain("trustedTypes.createPolicy")
    expect(head.html).not.toContain("securitypolicyviolation")
    expect(head.html).toContain("initialCspNonce")
    expect(head.tags.length).toBe(1)
  })
})

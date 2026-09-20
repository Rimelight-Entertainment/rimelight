import { describe, expect, it, vi, beforeEach } from "vite-plus/test"
import {
  isTurnstileEnabled,
  verifyTurnstile,
  getTurnstileSiteKey,
  getTurnstileSecretKey
} from "../src/turnstile"
import { buildCspHeader } from "../src/csp"

describe("Turnstile Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("isTurnstileEnabled & key resolution", () => {
    it("returns true when both siteKey and secretKey are present", () => {
      expect(
        isTurnstileEnabled({
          TURNSTILE_SITE_KEY: "0x4AAAAAA",
          TURNSTILE_SECRET_KEY: "0x4BBBBBB"
        })
      ).toBe(true)
    })

    it("returns false when siteKey or secretKey is missing", () => {
      expect(isTurnstileEnabled({ TURNSTILE_SITE_KEY: "0x4AAAAAA" })).toBe(false)
      expect(isTurnstileEnabled({ TURNSTILE_SECRET_KEY: "0x4BBBBBB" })).toBe(false)
      expect(isTurnstileEnabled({})).toBe(false)
      expect(isTurnstileEnabled(undefined)).toBe(false)
    })

    it("resolves site key and secret key correctly", () => {
      const env = {
        TURNSTILE_SITE_KEY: "site-123",
        TURNSTILE_SECRET_KEY: "sec-456"
      }
      expect(getTurnstileSiteKey(env)).toBe("site-123")
      expect(getTurnstileSecretKey({ env })).toBe("sec-456")
      expect(getTurnstileSecretKey({ secretKey: "explicit-key" })).toBe("explicit-key")
    })
  })

  describe("verifyTurnstile", () => {
    it("fails open when keys are missing and failOpen is true (default)", async () => {
      const res = await verifyTurnstile("some-token", {})
      expect(res.success).toBe(true)
    })

    it("fails closed when keys are missing and failOpen is false", async () => {
      const res = await verifyTurnstile({
        token: "some-token",
        env: {},
        failOpen: false
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain("not configured")
    })

    it("returns error if token is missing when keys are present", async () => {
      const res = await verifyTurnstile("", {
        TURNSTILE_SITE_KEY: "site",
        TURNSTILE_SECRET_KEY: "sec"
      })
      expect(res.success).toBe(false)
      expect(res.error).toBe("Security check token is missing.")
    })

    it("verifies successfully with Cloudflare API", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          "success": true,
          "error-codes": []
        })
      } as any)

      const res = await verifyTurnstile({
        token: "valid-cf-token",
        secretKey: "0x4SECRET",
        remoteIp: "127.0.0.1"
      })

      expect(res.success).toBe(true)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            secret: "0x4SECRET",
            response: "valid-cf-token",
            remoteip: "127.0.0.1"
          })
        })
      )
    })

    it("handles Cloudflare verification failures with error codes", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          "success": false,
          "error-codes": ["timeout-or-duplicate"]
        })
      } as any)

      const res = await verifyTurnstile({
        token: "expired-token",
        secretKey: "0x4SECRET"
      })

      expect(res.success).toBe(false)
      expect(res.error).toContain("Verification token expired or already used")
      expect(res.errorCodes).toEqual(["timeout-or-duplicate"])
    })

    it("fails open gracefully on network exception when failOpen is true", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network offline"))

      const res = await verifyTurnstile({
        token: "some-token",
        secretKey: "0x4SECRET",
        failOpen: true
      })

      expect(res.success).toBe(true)
    })
  })

  describe("CSP integration", () => {
    it("includes Cloudflare challenges domain in connect-src and frame-src when turnstile is true", () => {
      const csp = buildCspHeader({ turnstile: true })
      expect(csp).toContain("frame-src 'self' https://challenges.cloudflare.com")
      expect(csp).toContain("connect-src 'self' https://challenges.cloudflare.com")
    })

    it("omits Cloudflare challenges domain by default or when turnstile is false", () => {
      const cspDefault = buildCspHeader()
      expect(cspDefault).not.toContain("https://challenges.cloudflare.com")

      const cspFalse = buildCspHeader({ turnstile: false })
      expect(cspFalse).not.toContain("https://challenges.cloudflare.com")
    })
  })
})

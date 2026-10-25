import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { verifyTurnstile, buildCspHeader } from "../src/runtime";

describe("Turnstile Module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("verifyTurnstile", () => {
    it("fails open when secretKey is missing (default dev behavior)", async () => {
      const ok = await verifyTurnstile("some-token", undefined);
      expect(ok).toBe(true);
    });

    it("returns false if token is missing when secretKey is present", async () => {
      const ok = await verifyTurnstile(undefined, "sec-key");
      expect(ok).toBe(false);
    });

    it("verifies successfully with Cloudflare API", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as any);

      const ok = await verifyTurnstile("valid-cf-token", "0x4SECRET", "127.0.0.1");

      expect(ok).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            secret: "0x4SECRET",
            response: "valid-cf-token",
            remoteip: "127.0.0.1",
          }),
        }),
      );
    });

    it("returns false when Cloudflare responds with success: false", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: false }),
      } as any);

      const ok = await verifyTurnstile("invalid-token", "0x4SECRET");
      expect(ok).toBe(false);
    });

    it("fails open on network exception", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network offline"));
      const ok = await verifyTurnstile("some-token", "0x4SECRET");
      expect(ok).toBe(true);
    });
  });

  describe("CSP integration", () => {
    it("includes Cloudflare challenges domain in script-src, connect-src and frame-src when turnstile is true", () => {
      const csp = buildCspHeader({ turnstile: true });
      expect(csp).toContain(
        "script-src 'self' 'inline-speculation-rules' https://challenges.cloudflare.com",
      );
      expect(csp).toContain("frame-src 'self' https://challenges.cloudflare.com");
      expect(csp).toContain("connect-src 'self' https://challenges.cloudflare.com");
    });

    it("omits Cloudflare challenges domain by default or when turnstile is false", () => {
      const cspDefault = buildCspHeader();
      expect(cspDefault).not.toContain("https://challenges.cloudflare.com");

      const cspFalse = buildCspHeader({ turnstile: false });
      expect(cspFalse).not.toContain("https://challenges.cloudflare.com");
    });
  });
});

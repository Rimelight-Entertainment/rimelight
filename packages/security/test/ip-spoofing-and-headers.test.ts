import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { security, ratelimit } from "../src/middleware";
import { setSecurityConfig } from "../src/index";

describe("@rimelight/security - IP Spoofing and Header Integrity", () => {
  beforeEach(() => {
    setSecurityConfig();
  });

  it("generates strict security headers with comprehensive defaults", async () => {
    const middleware = security();
    const req = new Request("https://rimelight.com/secure");
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res: new Response('{"ok":true}', { headers: { "content-type": "application/json" } }),
    };
    await middleware(ctx as any, async () => {});

    expect(ctx.res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(ctx.res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(ctx.res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("rate limits based on multi-hop CF-Connecting-IP and custom key generators", async () => {
    const limitMock = vi.fn().mockImplementation(async ({ key }: { key: string }) => {
      return { success: key !== "203.0.113.195-blocked" };
    });

    setSecurityConfig({
      ratelimit: {
        routes: ["/api/test"],
        bindingName: "TEST_LIMITER",
        keyGenerator: (c: any) => {
          return c.req.header("CF-Connecting-IP") || "anonymous";
        },
      },
    });

    const limiter = ratelimit();

    const createCtx = (ip: string) => ({
      req: {
        path: "/api/test",
        header: (name: string) => (name === "CF-Connecting-IP" ? ip : undefined),
      },
      env: {
        TEST_LIMITER: {
          limit: limitMock,
        },
      },
      json: (data: any, status: number) => ({ data, status }),
    });

    const ctxAllowed = createCtx("198.51.100.22");
    let calledNext = false;
    await limiter(ctxAllowed as any, async () => {
      calledNext = true;
    });
    expect(calledNext).toBe(true);
    expect(limitMock).toHaveBeenCalledWith({ key: "198.51.100.22" });

    const ctxBlocked = createCtx("203.0.113.195-blocked");
    let calledNextBlocked = false;
    const blockedRes = await limiter(ctxBlocked as any, async () => {
      calledNextBlocked = true;
    });
    expect(calledNextBlocked).toBe(false);
    expect(blockedRes?.status).toBe(429);
  });
});

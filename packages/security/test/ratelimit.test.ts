import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { ratelimit } from "../src/middleware";
import { setSecurityConfig } from "../src/runtime";

describe("Rate Limit Middleware", () => {
  beforeEach(() => {
    setSecurityConfig();
  });

  it("skips non-sensitive routes by default", async () => {
    const middleware = ratelimit();
    const limitMock = vi.fn().mockResolvedValue({ success: false });

    const ctx = {
      req: {
        path: "/about",
        header: () => "1.2.3.4",
      },
      env: {
        MY_RATE_LIMITER: {
          limit: limitMock,
        },
      },
    };

    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    await middleware(ctx as any, next);
    expect(nextCalled).toBe(true);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("passes when rate limit check succeeds on sensitive route", async () => {
    const middleware = ratelimit();
    const limitMock = vi.fn().mockResolvedValue({ success: true });

    const ctx = {
      req: {
        path: "/auth/sign-in",
        header: (name: string) => (name === "CF-Connecting-IP" ? "1.2.3.4" : undefined),
      },
      env: {
        MY_RATE_LIMITER: {
          limit: limitMock,
        },
      },
    };

    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    await middleware(ctx as any, next);
    expect(limitMock).toHaveBeenCalledWith({ key: "1.2.3.4" });
    expect(nextCalled).toBe(true);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const middleware = ratelimit();
    const limitMock = vi.fn().mockResolvedValue({ success: false });

    const jsonMock = vi.fn((data: any, status: number, headers: any) => ({
      data,
      status,
      headers,
    }));

    const ctx = {
      req: {
        path: "/api/chat",
        header: (name: string) => (name === "CF-Connecting-IP" ? "9.9.9.9" : undefined),
      },
      env: {
        MY_RATE_LIMITER: {
          limit: limitMock,
        },
      },
      json: jsonMock,
    };

    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    await middleware(ctx as any, next);
    expect(nextCalled).toBe(false);
    expect(limitMock).toHaveBeenCalledWith({ key: "9.9.9.9" });
    expect(jsonMock).toHaveBeenCalledWith(
      {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
      },
      429,
      { "Retry-After": "60" },
    );
  });

  it("supports custom routes, bindingName, retryAfter, and custom keyGenerator", async () => {
    setSecurityConfig({
      ratelimit: {
        routes: ["/api/custom-endpoint"],
        bindingName: "CUSTOM_LIMITER",
        retryAfter: 120,
        keyGenerator: (c) => c.req.header("Authorization") || "anonymous",
      },
    });
    const middleware = ratelimit();

    const limitMock = vi.fn().mockResolvedValue({ success: false });
    const jsonMock = vi.fn((data: any, status: number, headers: any) => ({
      data,
      status,
      headers,
    }));

    const ctx = {
      req: {
        path: "/api/custom-endpoint",
        header: (name: string) => (name === "Authorization" ? "Bearer token-123" : undefined),
      },
      env: {
        CUSTOM_LIMITER: {
          limit: limitMock,
        },
      },
      json: jsonMock,
    };

    await middleware(ctx as any, async () => {});
    expect(limitMock).toHaveBeenCalledWith({ key: "Bearer token-123" });
    expect(jsonMock).toHaveBeenCalledWith(expect.anything(), 429, { "Retry-After": "120" });
  });

  it("fails open during local dev when no binding is present by default", async () => {
    const middleware = ratelimit();

    const ctx = {
      req: {
        path: "/auth/sign-in",
        header: () => "1.2.3.4",
      },
      env: {},
    };

    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    await middleware(ctx as any, next);
    expect(nextCalled).toBe(true);
  });

  it("fails closed when fallback is set to block and binding is missing", async () => {
    setSecurityConfig({
      ratelimit: {
        fallback: "block",
      },
    });
    const middleware = ratelimit();

    const jsonMock = vi.fn((data: any, status: number) => ({ data, status }));
    const ctx = {
      req: {
        path: "/auth/sign-in",
        header: () => "1.2.3.4",
      },
      env: {},
      json: jsonMock,
    };

    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    await middleware(ctx as any, next);
    expect(nextCalled).toBe(false);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Rate limiter not configured" }, 500);
  });
});

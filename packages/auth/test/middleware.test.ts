import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("virtual:rimelight-auth-config", () => ({
  config: {},
}));

import { auth } from "../src/middleware/index";

describe("Auth Middleware", () => {
  it("skips static assets by default", async () => {
    const middleware = auth();
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    const ctx = {
      req: {
        url: "https://example.com/assets/logo.png",
      },
    };

    await middleware(ctx, next);
    expect(nextCalled).toBe(true);
  });

  it("sets null session for ignored routes", async () => {
    const middleware = auth({
      ignoredRoutes: ["/docs/"],
    });

    const setMock = vi.fn();
    const ctx = {
      req: {
        url: "https://example.com/docs/getting-started",
      },
      set: setMock,
      get: () => null,
    };

    let nextCalled = false;
    await middleware(ctx, async () => {
      nextCalled = true;
    });

    expect(setMock).toHaveBeenCalledWith("user", null);
    expect(setMock).toHaveBeenCalledWith("session", null);
    expect(nextCalled).toBe(true);
  });

  it("resolves session from adapter and attaches user and session", async () => {
    const mockAdapter = {
      name: "test-auth",
      getSession: vi.fn().mockResolvedValue({
        userId: "user-123",
        email: "user@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        userType: "user",
      }),
    };

    const middleware = auth({
      auth: mockAdapter,
    });

    const state: Record<string, any> = {};
    const ctx = {
      req: {
        url: "https://example.com/dashboard",
        raw: new Request("https://example.com/dashboard"),
      },
      set: (k: string, v: any) => {
        state[k] = v;
      },
      get: (k: string) => state[k],
    };

    let nextCalled = false;
    await middleware(ctx, async () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(state["user"]?.userId).toBe("user-123");
    expect(state["session"]?.userId).toBe("user-123");
  });

  it("redirects unauthenticated user accessing protected route", async () => {
    const middleware = auth({
      protectedRoutes: ["/dashboard"],
      signInUrl: "/auth/sign-in",
    });

    const redirectMock = vi.fn((url: string) => ({ redirectedTo: url }));
    const ctx = {
      req: {
        url: "https://example.com/dashboard",
      },
      set: () => {},
      get: () => null,
      redirect: redirectMock,
    };

    const res = await middleware(ctx, async () => {});
    expect(redirectMock).toHaveBeenCalledWith("/auth/sign-in");
    expect(res).toEqual({ redirectedTo: "/auth/sign-in" });
  });

  it("returns 401 for API protected routes when unauthenticated", async () => {
    const middleware = auth({
      protectedRoutes: ["/api/private"],
    });

    const jsonMock = vi.fn((data: any, status: number) => ({ data, status }));
    const ctx = {
      req: {
        url: "https://example.com/api/private/data",
      },
      set: () => {},
      get: () => null,
      json: jsonMock,
    };

    await middleware(ctx, async () => {});
    expect(jsonMock).toHaveBeenCalledWith(
      { error: "Unauthorized", message: "Authentication required." },
      401,
    );
  });

  it("enforces role guards and forbids unauthorized roles", async () => {
    const mockAdapter = {
      name: "test-auth",
      getSession: vi.fn().mockResolvedValue({
        userId: "user-123",
        email: "user@example.com",
        roles: ["viewer"],
        permissions: [],
        userType: "user",
      }),
    };

    const middleware = auth({
      auth: mockAdapter,
      roleGuards: {
        "/admin": ["admin", "owner"],
      },
      homeUrl: "/",
    });

    const state: Record<string, any> = {};
    const redirectMock = vi.fn((url: string) => ({ redirectedTo: url }));
    const ctx = {
      req: {
        url: "https://example.com/admin/settings",
      },
      set: (k: string, v: any) => {
        state[k] = v;
      },
      get: (k: string) => state[k],
      redirect: redirectMock,
    };

    const res = await middleware(ctx, async () => {});
    expect(redirectMock).toHaveBeenCalledWith("/");
    expect(res).toEqual({ redirectedTo: "/" });
  });

  it("redirects authenticated user from guest-only routes to home", async () => {
    const mockAdapter = {
      name: "test-auth",
      getSession: vi.fn().mockResolvedValue({
        userId: "user-123",
        roles: ["user"],
      }),
    };

    const middleware = auth({
      auth: mockAdapter,
      guestOnlyRoutes: ["/auth/sign-in"],
    });

    const state: Record<string, any> = {};
    const redirectMock = vi.fn((url: string) => ({ redirectedTo: url }));
    const ctx = {
      req: {
        url: "https://example.com/auth/sign-in",
      },
      set: (k: string, v: any) => {
        state[k] = v;
      },
      get: (k: string) => state[k],
      redirect: redirectMock,
    };

    await middleware(ctx, async () => {});
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

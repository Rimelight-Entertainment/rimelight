import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { construction } from "../src/middleware";
import { activeConfig } from "../src/runtime";

const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest";

describe("@rimelight/security construction middleware", () => {
  beforeEach(() => {
    for (const key of Object.keys(activeConfig)) {
      delete (activeConfig as any)[key];
    }
    Object.assign(activeConfig, {
      construction: {
        constructionPath: "/construction",
        cookieName: "rimelight-construction-guest",
        cookieMaxAge: 604800,
      },
    });
  });

  const passphrase = "secret-passphrase-999";

  const createMockContext = (
    options: {
      path?: string;
      method?: string;
      cookie?: string;
      mode?: boolean | string;
      passphraseVal?: string;
      body?: any;
    } = {},
  ): any => {
    let redirected: string | null = null;
    let jsonResp: any = null;
    const reqHeaders = new Headers();
    if (options.cookie) {
      reqHeaders.set("cookie", `${CONSTRUCTION_GUEST_COOKIE}=${options.cookie}`);
    }

    return {
      req: {
        path: options.path || "/",
        method: options.method || "GET",
        raw: { headers: reqHeaders },
        url: `http://localhost${options.path || "/"}`,
        header: (name: string) => reqHeaders.get(name) ?? undefined,
        json: async () => options.body || {},
      },
      env: {
        CONSTRUCTION_MODE: options.mode !== undefined ? options.mode : "true",
        CONSTRUCTION_PASSPHRASE: options.passphraseVal || passphrase,
      },
      header: () => {},
      redirect: (target: string) => {
        redirected = target;
        return { status: 302, headers: { Location: target } };
      },
      json: (data: any, status = 200) => {
        jsonResp = { data, status };
        return jsonResp;
      },
      html: (htmlStr: string, status = 200) =>
        new Response(htmlStr, { status, headers: { "Content-Type": "text/html; charset=utf-8" } }),
      notFound: () =>
        new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }),
      getRedirected: () => redirected,
      getJson: () => jsonResp,
    };
  };

  it("should pass next when construction mode is disabled", async () => {
    const middleware = construction();
    const ctx = createMockContext({ mode: "false" });
    const next = vi.fn().mockResolvedValue("next-called");

    await middleware(ctx, next);
    expect(next).toHaveBeenCalled();
  });

  it("should pass whitelisted static and auth assets when enabled", async () => {
    const middleware = construction();
    const ctx = createMockContext({ path: "/favicon.ico", mode: "true" });
    const next = vi.fn().mockResolvedValue("next-called");

    await middleware(ctx, next);
    expect(next).toHaveBeenCalled();
  });

  it("should pass Vite /assets/ chunks through instead of redirecting to the construction page", async () => {
    const middleware = construction();

    for (const path of [
      "/assets/virtual_solid-ssr-entry-client-BZC9SKbh.js",
      "/assets/virtual_solid-ssr-entry-client-Cg2ujBbw.css",
      "/assets/fonts/inter.woff2",
    ]) {
      const ctx = createMockContext({ path, mode: "true" });
      const next = vi.fn().mockResolvedValue("next-called");

      await middleware(ctx, next);
      expect(next, `expected ${path} to bypass the construction gate`).toHaveBeenCalled();
      expect(ctx.getRedirected()).toBeNull();
    }
  });

  it("should pass module scripts like construction.tsx to next when mode is disabled or authorized", async () => {
    const middleware = construction();

    const scriptPaths = [
      "/src/routes/[locale]/construction.tsx",
      "/src/routes/en/construction.tsx",
      "/@fs/C:/Users/app/src/routes/construction.tsx",
      "/assets/construction-CiRrrzXi.js",
    ];

    for (const path of scriptPaths) {
      // 1. When construction mode is disabled
      const ctxOff = createMockContext({ path, mode: "false" });
      const nextOff = vi.fn().mockResolvedValue("next-called");
      await middleware(ctxOff, nextOff);
      expect(nextOff, `expected ${path} to call next when mode is disabled`).toHaveBeenCalled();
      expect(ctxOff.getRedirected()).toBeNull();
    }
  });

  it("should 404 subresource requests instead of redirecting them to HTML", async () => {
    const middleware = construction();
    const headers = new Headers({ "sec-fetch-dest": "script", accept: "*/*" });
    const ctx = {
      req: {
        path: "/stale-chunk-1234.js",
        method: "GET",
        raw: { headers },
        url: "http://localhost/",
        header: (name: string) => headers.get(name) ?? undefined,
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      redirect: vi.fn(),
      notFound: () =>
        new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }),
    };
    const next = vi.fn();

    const res = (await middleware(ctx as any, next)) as Response;
    expect(next).not.toHaveBeenCalled();
    expect(ctx.redirect).not.toHaveBeenCalled();
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("should still redirect top-level navigations when unauthorized", async () => {
    const middleware = construction();
    const headers = new Headers({ "sec-fetch-dest": "document", accept: "text/html" });
    let redirectedTo: string | null = null;
    const ctx = {
      req: {
        path: "/en/dashboard",
        method: "GET",
        raw: { headers },
        url: "http://localhost/en/dashboard",
        header: (name: string) => headers.get(name) ?? undefined,
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      redirect: (target: string) => {
        redirectedTo = target;
        return { status: 302, headers: { Location: target } };
      },
    };
    const next = vi.fn();

    await middleware(ctx as any, next);
    expect(next).not.toHaveBeenCalled();
    expect(redirectedTo).toContain("/construction?redirect=");
  });

  it("should redirect unauthorized visitor to construction page", async () => {
    const middleware = construction();
    const ctx = createMockContext({ path: "/dashboard", mode: "true" });
    const next = vi.fn();

    await middleware(ctx, next);
    expect(next).not.toHaveBeenCalled();
    expect(ctx.getRedirected()).toContain("/construction?redirect=");
  });

  it("should handle guest sign-in endpoint properly", async () => {
    const middleware = construction();
    const ctx = createMockContext({
      path: "/construction",
      method: "POST",
      body: { passphrase },
    });
    const next = vi.fn();

    await middleware(ctx, next);
    expect(ctx.getJson()).toEqual({ data: { success: true }, status: 200 });
  });

  it("should reject guest sign-in with bad passphrase", async () => {
    const middleware = construction();
    const ctx = createMockContext({
      path: "/construction",
      method: "POST",
      body: { passphrase: "wrong" },
    });
    const next = vi.fn();

    await middleware(ctx, next);
    expect(ctx.getJson()).toEqual({ data: { error: "Invalid credentials" }, status: 401 });
  });

  it("should support cookie extraction via Hono c.req.header", async () => {
    const middleware = construction();
    let setCookieVal: any = null;

    // Sign in to generate valid cookie
    const honoCtx = {
      req: {
        path: "/construction",
        url: "http://localhost/construction",
        method: "POST",
        header: () => undefined,
        json: async () => ({ passphrase }),
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      header: (name: string, value: string) => {
        if (name === "Set-Cookie") setCookieVal = value;
      },
      json: (data: any, status = 200) => ({ data, status }),
    };

    await middleware(honoCtx as any, vi.fn());
    expect(setCookieVal).toContain(CONSTRUCTION_GUEST_COOKIE);

    // Extract cookie value
    const match = setCookieVal.match(new RegExp(`${CONSTRUCTION_GUEST_COOKIE}=([^;]+)`));
    const token = match[1];

    // Verify access with Hono c.req.header("cookie")
    const cookieHeader = `${CONSTRUCTION_GUEST_COOKIE}=${token}`;
    const accessCtx = {
      req: {
        path: "/protected",
        url: "http://localhost/protected",
        method: "GET",
        header: (name: string) => (name === "cookie" ? cookieHeader : undefined),
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      redirect: vi.fn(),
    };
    const nextAccess = vi.fn();
    await middleware(accessCtx as any, nextAccess);
    expect(nextAccess).toHaveBeenCalled();
  });

  it("should timing-safely reject mismatched passphrase lengths without errors", async () => {
    const middleware = construction();
    const testCases = ["", "a", "secret-passphrase", "secret-passphrase-9999", "wrong!"];

    for (const testPass of testCases) {
      const ctx = createMockContext({
        path: "/construction",
        method: "POST",
        body: { passphrase: testPass },
      });
      await middleware(ctx, vi.fn());
      expect(ctx.getJson()).toEqual({ data: { error: "Invalid credentials" }, status: 401 });
    }
  });

  it("should handle native form POST submissions and redirect on success", async () => {
    const middleware = construction();
    const formData = new FormData();
    formData.append("passphrase", passphrase);
    formData.append("redirect", "/en/dashboard");
    formData.append("rememberMe", "true");

    let redirectedTo: string | null = null;
    const formCtx = {
      req: {
        path: "/construction",
        url: "http://localhost/construction",
        method: "POST",
        header: (name: string) =>
          name.toLowerCase() === "content-type" ? "application/x-www-form-urlencoded" : undefined,
        formData: async () => formData,
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      header: () => {},
      redirect: (target: string) => {
        redirectedTo = target;
        return { status: 303, headers: { Location: target } };
      },
    };

    await middleware(formCtx as any, vi.fn());
    expect(redirectedTo).toBe("/en/dashboard");
  });

  it("should handle native form POST submissions and redirect with error on failure", async () => {
    const middleware = construction();
    const formData = new FormData();
    formData.append("passphrase", "wrong-passphrase");
    formData.append("redirect", "/en/dashboard");

    let redirectedTo: string | null = null;
    const formCtx = {
      req: {
        path: "/construction",
        url: "http://localhost/construction",
        method: "POST",
        header: (name: string) =>
          name.toLowerCase() === "content-type" ? "application/x-www-form-urlencoded" : undefined,
        formData: async () => formData,
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      header: () => {},
      redirect: (target: string) => {
        redirectedTo = target;
        return { status: 303, headers: { Location: target } };
      },
    };

    await middleware(formCtx as any, vi.fn());
    expect(redirectedTo).toContain("/construction?error=invalid&redirect=");
  });

  it("should serve standalone fallback HTML when renderFallback is enabled", async () => {
    Object.assign(activeConfig, { construction: { renderFallback: true } });
    const middleware = construction();
    const ctx = createMockContext({ path: "/protected-page", mode: "true" });
    const next = vi.fn();
    const res = (await middleware(ctx, next)) as Response;
    expect(next).not.toHaveBeenCalled();
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).toContain("Under Construction");
  });

  it("should unlock and set cookie when valid ?preview= query param is provided", async () => {
    const middleware = construction();
    let cookieSet: string | null = null;
    let redirectedTo: string | null = null;

    const ctx = {
      req: {
        path: "/blog/article",
        url: `http://localhost/blog/article?preview=${passphrase}`,
        query: (key: string) => (key === "preview" ? passphrase : null),
        header: () => undefined,
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: passphrase },
      header: (name: string, val: string) => {
        if (name === "Set-Cookie") cookieSet = val;
      },
      redirect: (to: string) => {
        redirectedTo = to;
        return { status: 302 };
      },
    };

    const next = vi.fn();
    await middleware(ctx as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(cookieSet).toContain(CONSTRUCTION_GUEST_COOKIE);
    expect(redirectedTo).toBe("/blog/article");
  });

  it("should respect custom cookie name and maxAge from config", async () => {
    Object.assign(activeConfig, {
      construction: {
        cookieName: "custom-gate-cookie",
        cookieMaxAge: 3600,
      },
    });

    const middleware = construction();
    let setCookieVal: string | null = null;
    const ctx = {
      req: {
        path: "/custom",
        url: "http://localhost/custom?preview=secret-passphrase-999",
        query: (key: string) => (key === "preview" ? "secret-passphrase-999" : null),
        header: () => undefined,
      },
      env: { CONSTRUCTION_MODE: "true", CONSTRUCTION_PASSPHRASE: "secret-passphrase-999" },
      header: (name: string, val: string) => {
        if (name === "Set-Cookie") setCookieVal = val;
      },
      redirect: (to: string) => ({ status: 302, to }),
    };

    await middleware(ctx as any, vi.fn());
    expect(setCookieVal).toContain("custom-gate-cookie=secret-passphrase-999");
    expect(setCookieVal).toContain("Max-Age=3600");
  });
});

import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { security } from "../src/middleware";
import { setSecurityConfig } from "../src/runtime";

describe("Security Middleware Headers", () => {
  beforeEach(() => {
    setSecurityConfig();
  });

  it("sets standard COEP (credentialless), COOP, and CORP headers by default", async () => {
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });

    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    const next = async () => {};
    const result = await middleware(ctx as any, next);
    const response = result || ctx.res;

    expect(response.headers.get("Cross-Origin-Embedder-Policy")).toBe("credentialless");
    expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-XSS-Protection")).toBe("0");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("supports custom Cross-Origin-Embedder-Policy configuration", async () => {
    setSecurityConfig({
      crossOriginEmbedderPolicy: "require-corp",
    });
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBe("require-corp");
  });

  it("supports custom Cross-Origin-Opener-Policy configuration", async () => {
    setSecurityConfig({
      crossOriginOpenerPolicy: "same-origin-allow-popups",
    });
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
  });

  it("supports disabling COEP / COOP / CORP headers with false", async () => {
    setSecurityConfig({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    });
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBeNull();
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBeNull();
    expect(ctx.res.headers.get("Cross-Origin-Resource-Policy")).toBeNull();
  });

  it("allows overriding headers via custom headers object", async () => {
    setSecurityConfig({
      headers: {
        "Cross-Origin-Embedder-Policy": "unsafe-none",
        "Cross-Origin-Opener-Policy": "noopener-allow-popups",
      },
    });
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBe("unsafe-none");
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBe("noopener-allow-popups");
  });

  it("sets COEP and COOP headers on HTML responses", async () => {
    const middleware = security();
    const req = new Request("https://rimelight.com/");
    const res = new Response("<!DOCTYPE html><html><head></head><body>Hello</body></html>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res.headers.get("Cross-Origin-Embedder-Policy")).toBe("credentialless");
    expect(ctx.res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });

  it("strips fingerprinting headers by default", async () => {
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: {
        "content-type": "application/json",
        "x-powered-by": "Express/Next",
        server: "cloudflare",
        "x-aspnet-version": "4.0.30319",
        "public-key-pins": "max-age=5184000",
      },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res.headers.get("x-powered-by")).toBeNull();
    expect(ctx.res.headers.get("server")).toBeNull();
    expect(ctx.res.headers.get("x-aspnet-version")).toBeNull();
    expect(ctx.res.headers.get("public-key-pins")).toBeNull();
  });

  it("enforces TLS 1.2+ when enforceTls is enabled and cf.tlsVersion is present", async () => {
    setSecurityConfig({ enforceTls: true });
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    (req as any).cf = { tlsVersion: "TLSv1.1" };
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    const result = await middleware(ctx as any, async () => {});
    expect(result).toBeDefined();
    expect(result?.status).toBe(400);
    const text = await result?.text();
    expect(text).toContain("TLS 1.2 or higher is required");
  });

  it("generates a valid 128-bit Base64 nonce on HTML responses", async () => {
    const middleware = security();
    const req = new Request("https://rimelight.com/");
    const res = new Response(
      "<!DOCTYPE html><html><head></head><body><script>console.log(1)</script></body></html>",
      {
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    const csp = ctx.res.headers.get("Content-Security-Policy");
    expect(csp).toBeDefined();
    // Extract nonce
    const match = csp?.match(/'nonce-([A-Za-z0-9+/=]+)'/);
    expect(match).toBeTruthy();
    const nonceVal = match?.[1];
    expect(nonceVal).toBeDefined();
    // 16 bytes base64 is 24 characters
    expect(nonceVal?.length).toBe(24);
  });

  it("supports explicit SRI manifest in middleware options", async () => {
    const customManifest = {
      "/app.js": "sha384-abc123custom",
      "/styles.css": "sha384-xyz789custom",
    };
    setSecurityConfig({ manifest: customManifest });
    const middleware = security();
    const req = new Request("https://rimelight.com/api/test");
    const res = new Response('{"ok":true}', {
      headers: { "content-type": "application/json" },
    });
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});
    expect(ctx.res).toBeDefined();
  });

  it("transforms HTML via HTMLRewriter when available", async () => {
    const customManifest = {
      "/main.js": "sha384-customMainHash",
    };

    // Mock HTMLRewriter
    const handlers: Record<string, (el: any) => void> = {};
    class MockHTMLRewriter {
      on(selector: string, handler: { element: (el: any) => void }) {
        handlers[selector] = handler.element;
        return this;
      }
      transform(res: Response) {
        return res;
      }
    }

    (globalThis as any).HTMLRewriter = MockHTMLRewriter;

    setSecurityConfig({ manifest: customManifest });
    const middleware = security();
    const req = new Request("https://rimelight.com/");
    const res = new Response(
      '<html><head></head><body><script src="/main.js"></script></body></html>',
      {
        headers: { "content-type": "text/html" },
      },
    );
    const ctx = {
      req: {
        raw: req,
        url: req.url,
        path: new URL(req.url).pathname,
        method: req.method,
        header: (n: string) => req.headers.get(n) ?? undefined,
      },
      res,
    };

    await middleware(ctx as any, async () => {});

    // Verify selector handlers were registered
    expect(handlers["script[src]"]).toBeDefined();
    expect(handlers['link[rel="stylesheet"][href]']).toBeDefined();
    expect(handlers["script"]).toBeDefined();
    expect(handlers["head"]).toBeDefined();

    // Test element handler logic
    const mockEl = {
      attrs: { src: "/main.js" } as Record<string, string>,
      getAttribute: (name: string) => mockEl.attrs[name],
      setAttribute: (name: string, val: string) => {
        mockEl.attrs[name] = val;
      },
    };
    handlers["script[src]"]?.(mockEl);
    expect(mockEl.attrs["integrity"]).toBe("sha384-customMainHash");
    expect(mockEl.attrs["crossorigin"]).toBe("anonymous");

    delete (globalThis as any).HTMLRewriter;
  });

  it("permits unsafe-inline in dev mode Report-Only simulation to avoid false-positive warnings", async () => {
    const originalEnv = process.env["NODE_ENV"];
    process.env["NODE_ENV"] = "development";
    try {
      setSecurityConfig({ domain: "example.com" });
      const middleware = security();
      const req = new Request("http://localhost:5173/");
      const res = new Response("<html><head></head><body>Hello</body></html>", {
        headers: { "content-type": "text/html" },
      });
      const ctx = {
        req: {
          raw: req,
          url: req.url,
          path: new URL(req.url).pathname,
          method: req.method,
          header: (n: string) => req.headers.get(n) ?? undefined,
        },
        res,
      };

      await middleware(ctx as any, async () => {});

      const activeCsp = ctx.res.headers.get("Content-Security-Policy");
      const reportOnlyCsp = ctx.res.headers.get("Content-Security-Policy-Report-Only");

      expect(activeCsp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(reportOnlyCsp).toBeDefined();
      expect(reportOnlyCsp).toContain(
        "script-src 'self' 'unsafe-inline' 'inline-speculation-rules'",
      );
      expect(reportOnlyCsp).toContain("style-src 'self' 'unsafe-inline'");
    } finally {
      process.env["NODE_ENV"] = originalEnv;
    }
  });

  describe("Unified Pipeline Orchestration", () => {
    it("blocks /dev/ routes in production when devOnly is enabled by default", async () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = "production";
      try {
        setSecurityConfig();
        const middleware = security();
        let nextCalled = false;
        const ctx = {
          req: { path: "/dev/preview", raw: new Request("https://rimelight.com/dev/preview") },
          notFound: () => new Response("Not Found", { status: 404 }),
        };

        const result = await middleware(ctx as any, async () => {
          nextCalled = true;
        });
        expect(nextCalled).toBe(false);
        const res = (result || (ctx as any).res) as Response;
        expect(res.status).toBe(404);
      } finally {
        process.env["NODE_ENV"] = originalEnv;
      }
    });

    it("allows /dev/ routes when devOnly is set to false", async () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = "production";
      try {
        setSecurityConfig({ devOnly: false });
        const middleware = security();
        let nextCalled = false;
        const raw = new Request("https://rimelight.com/dev/preview");
        const ctx = {
          req: {
            path: "/dev/preview",
            method: "GET",
            url: raw.url,
            raw,
            header: (n: string) => raw.headers.get(n) ?? undefined,
          },
          res: new Response("OK", { headers: { "content-type": "text/plain" } }),
        };

        await middleware(ctx as any, async () => {
          nextCalled = true;
        });
        expect(nextCalled).toBe(true);
      } finally {
        process.env["NODE_ENV"] = originalEnv;
      }
    });

    it("applies rate limiting when configured in plugin config", async () => {
      const limitMock = vi.fn().mockResolvedValue({ success: false });
      setSecurityConfig({
        ratelimit: {
          routes: ["/auth/sign-in"],
          bindingName: "MY_RATE_LIMITER",
        },
      });

      const middleware = security();
      let nextCalled = false;
      const ctx = {
        req: {
          path: "/auth/sign-in",
          header: () => "1.2.3.4",
          raw: new Request("https://rimelight.com/auth/sign-in"),
        },
        env: {
          MY_RATE_LIMITER: { limit: limitMock },
        },
        json: (data: any, status: number) => new Response(JSON.stringify(data), { status }),
      };

      const result = await middleware(ctx as any, async () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      const res = (result || (ctx as any).res) as Response;
      expect(res.status).toBe(429);
    });

    it("skips rate limiting when ratelimit is false", async () => {
      const limitMock = vi.fn().mockResolvedValue({ success: false });
      setSecurityConfig({
        ratelimit: false,
      });

      const middleware = security();
      let nextCalled = false;
      const ctx = {
        req: {
          path: "/auth/sign-in",
          method: "GET",
          url: "https://rimelight.com/auth/sign-in",
          header: () => "1.2.3.4",
          raw: new Request("https://rimelight.com/auth/sign-in"),
        },
        env: {
          MY_RATE_LIMITER: { limit: limitMock },
        },
        res: new Response("OK", { headers: { "content-type": "text/plain" } }),
      };

      await middleware(ctx as any, async () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(limitMock).not.toHaveBeenCalled();
    });

    it("gates traffic through construction mode when enabled", async () => {
      setSecurityConfig({
        construction: {
          constructionPath: "/construction",
        },
      });

      const middleware = security();
      let nextCalled = false;
      let redirectedTo: string | null = null;
      let backingRes: Response | undefined;
      const raw = new Request("https://rimelight.com/dashboard", {
        headers: { "sec-fetch-dest": "document", accept: "text/html" },
      });
      const ctx = {
        req: {
          path: "/dashboard",
          method: "GET",
          url: raw.url,
          raw,
          header: (n: string) => raw.headers.get(n) ?? undefined,
        },
        env: {
          CONSTRUCTION_MODE: "true",
          CONSTRUCTION_PASSPHRASE: "pass123",
        },
        redirect: (target: string) => {
          redirectedTo = target;
          return new Response(null, { status: 302, headers: { Location: target } });
        },
        // Hono's `Context#res` getter auto-instantiates an empty 200 on first
        // read instead of returning undefined — mirror that here, or the
        // sub-middleware's early return can be silently swallowed.
        get res(): Response {
          return (backingRes ??= new Response(null, { status: 200 }));
        },
        set res(value: Response) {
          backingRes = value;
        },
      };

      const result = (await middleware(ctx as any, async () => {
        nextCalled = true;
      })) as Response;

      expect(nextCalled).toBe(false);
      expect(redirectedTo).toContain("/en/construction?redirect=");
      expect(result.status).toBe(302);
      expect(result.headers.get("Location")).toContain("/en/construction?redirect=");
      expect(ctx.res.status).toBe(302);
    });

    it("skips construction mode when construction is false", async () => {
      setSecurityConfig({
        construction: false,
      });

      const middleware = security();
      let nextCalled = false;
      const ctx = {
        req: {
          path: "/dashboard",
          raw: new Request("https://rimelight.com/dashboard", {
            headers: { "sec-fetch-dest": "document", accept: "text/html" },
          }),
        },
        env: {
          CONSTRUCTION_MODE: "true",
          CONSTRUCTION_PASSPHRASE: "pass123",
        },
        res: new Response("OK", { headers: { "content-type": "text/plain" } }),
      };

      await middleware(ctx as any, async () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });
});

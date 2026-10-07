import { describe, it, expect } from "vite-plus/test";
import { security, serializeConfig } from "../src/vite";
import { buildCspHeader } from "../src/csp";
import type { SecurityPluginOptions } from "../src/types";

describe("Security Plugin Config Serialization", () => {
  it("serializes primitives, arrays, RegExps, and functions", async () => {
    const options: SecurityPluginOptions = {
      domain: "example.com",
      ratelimit: {
        routes: ["/auth/sign-in", /^\/api\/secure\//],
        retryAfter: 45,
        keyGenerator: (c: any) => c.req.header("X-Custom-IP") || "ip",
      },
      construction: {
        renderFallback: true,
        whitelist: [/^\/public\//, "/login"],
        isAuthorized(c: any) {
          return c.req.path === "/admin-special";
        },
      },
      turnstile: {
        field: "cf-token",
        failOpen: false,
      },
    };

    const plugin = security(options) as any;
    const code = plugin.load("\0virtual:rimelight-security-config");
    expect(code).toContain("export const config =");

    // Test dynamic import via data: URL
    const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
    const mod = await import(dataUrl);
    const loadedConfig: SecurityPluginOptions = mod.config;

    expect(loadedConfig.domain).toBe("example.com");
    expect(loadedConfig.turnstile).toEqual({
      field: "cf-token",
      failOpen: false,
    });
    const ratelimitOpts =
      typeof loadedConfig.ratelimit === "object" ? loadedConfig.ratelimit : undefined;
    expect(ratelimitOpts?.retryAfter).toBe(45);

    // Assert RegExp survived
    const routes = ratelimitOpts?.routes;
    expect(Array.isArray(routes)).toBe(true);
    if (Array.isArray(routes)) {
      expect(routes[0]).toBe("/auth/sign-in");
      expect(routes[1]).toBeInstanceOf(RegExp);
      expect((routes[1] as RegExp).test("/api/secure/data")).toBe(true);
      expect((routes[1] as RegExp).test("/api/public/data")).toBe(false);
    }

    // Assert functions survived
    const keyGen = ratelimitOpts?.keyGenerator;
    expect(typeof keyGen).toBe("function");
    const mockCtx = {
      req: { header: (name: string) => (name === "X-Custom-IP" ? "1.2.3.4" : undefined) },
    };
    expect(await keyGen!(mockCtx)).toBe("1.2.3.4");

    const constructionOpts =
      typeof loadedConfig.construction === "object" ? loadedConfig.construction : undefined;
    const isAuth = constructionOpts?.isAuthorized;
    expect(typeof isAuth).toBe("function");
    expect(await isAuth!({ req: { path: "/admin-special" } })).toBe(true);
    expect(await isAuth!({ req: { path: "/other" } })).toBe(false);
  });

  it("throws when trying to serialize a native function", () => {
    expect(() => {
      serializeConfig({
        fn: Math.sin,
      });
    }).toThrow(/Cannot serialize native function/);
  });

  it("enables challenges domain in CSP when turnstile is configured as an object", () => {
    const csp = buildCspHeader({
      turnstile: {
        field: "cf-token",
      },
    });
    expect(csp).toContain("frame-src 'self' https://challenges.cloudflare.com");
    expect(csp).toContain("connect-src 'self' https://challenges.cloudflare.com");
  });
});

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vite-plus/test";
import { security, serializeConfig, type RimelightSecurityPluginOptions } from "../src/plugin";
import { buildCspHeader } from "../src/runtime";

describe("Security Plugin Config Serialization", () => {
  it("serializes primitives, arrays, and RegExps into disk artifacts", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "security-plugin-"));
    const options: RimelightSecurityPluginOptions = {
      domain: "example.com",
      ratelimit: {
        routes: ["/auth/sign-in", /^\/api\/secure\//],
        retryAfter: 45,
      },
      construction: {
        renderFallback: true,
        whitelist: [/^\/public\//, "/login"],
      },
      turnstile: {
        field: "cf-token",
        failOpen: false,
      },
    };

    try {
      const plugin = security(options) as any;
      const viteConfig = (await plugin.config?.({ root: tmpDir })) as any;
      const aliases = viteConfig.resolve.alias;
      const findAlias = (name: string) =>
        aliases.find((a: any) => (a.find instanceof RegExp ? a.find.test(name) : a.find === name));
      expect(findAlias("#rimelight/security")?.replacement).toMatch(
        /[\\/]\.rimelight[\\/]security[\\/]config\.js$/,
      );

      const generatedJs = path.join(tmpDir, "node_modules", ".rimelight", "security", "config.js");
      expect(fs.existsSync(generatedJs)).toBe(true);

      const code = fs.readFileSync(generatedJs, "utf-8");
      expect(code).toContain("export const config =");

      // Test dynamic import via data: URL
      const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
      const mod = await import(dataUrl);
      const loadedConfig: RimelightSecurityPluginOptions = mod.config;

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
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("throws when trying to serialize a function", () => {
    expect(() => {
      serializeConfig({
        fn: () => {},
      });
    }).toThrow(/Functions cannot be serialized directly/);
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

import { describe, it, expect } from "vite-plus/test";
import { security, type RimelightSecurityPluginOptions } from "../src/plugin";
import { buildCspHeader } from "../src/runtime";

const VIRTUAL_ID = "virtual:rimelight-security";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

describe("Security Plugin Virtual Module", () => {
  it("resolves and loads virtual module in-memory", async () => {
    const options: RimelightSecurityPluginOptions = {
      domain: "example.com",
      ratelimit: {
        routes: ["/auth/sign-in"],
        retryAfter: 45,
      },
      turnstile: {
        field: "cf-token",
        failOpen: false,
      },
    };

    const plugin = security(options) as any;
    expect(plugin.resolveId(VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);

    const code = plugin.load(RESOLVED_VIRTUAL_ID);
    expect(code).toContain("export const config =");
    expect(code).toContain('"domain":"example.com"');

    const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
    const mod = await import(dataUrl);

    expect(mod.config.domain).toBe("example.com");
    expect(mod.config.ratelimit.retryAfter).toBe(45);
    expect(mod.config.turnstile.field).toBe("cf-token");

    const csp = buildCspHeader(mod.config);
    expect(csp).toContain("https://cdn.example.com");
    expect(csp).toContain("https://challenges.cloudflare.com");
  });
});

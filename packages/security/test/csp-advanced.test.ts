import { describe, it, expect } from "vite-plus/test";
import { buildCspHeader, resolveSecurityDomain } from "../src/csp";
import { security as securityPlugin } from "../src/plugin";

describe("@rimelight/security CSP header generator", () => {
  it("should generate strict baseline Content-Security-Policy", () => {
    const csp = buildCspHeader({ domain: "example.com" });

    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("img-src 'self' data: https://cdn.example.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("should incorporate request nonce and strict-dynamic into script-src", () => {
    const nonce = "random-test-nonce-12345";
    const csp = buildCspHeader({ domain: "example.com" }, nonce);

    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`);
  });

  it("should allow disabling strict-dynamic", () => {
    const nonce = "random-test-nonce-12345";
    const csp = buildCspHeader({ domain: "example.com", strictDynamic: false }, nonce);

    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
    expect(csp).not.toContain("'strict-dynamic'");
  });

  it("should support trustedTypes flag", () => {
    const csp = buildCspHeader({ trustedTypes: true });
    expect(csp).toContain("require-trusted-types-for 'script'");
  });

  it("should support allowedDomains across img-src, connect-src and frame-src", () => {
    const csp = buildCspHeader({
      allowedDomains: ["https://api.example.com", "https://ws.example.com"],
    });

    expect(csp).toContain("img-src 'self' data: https://api.example.com https://ws.example.com");
    expect(csp).toContain("connect-src 'self' https://api.example.com https://ws.example.com");
    expect(csp).toContain("frame-src 'self' https://api.example.com https://ws.example.com");
  });

  it("should not let allowedDomains widen script-src or style-src", () => {
    const csp = buildCspHeader({ allowedDomains: ["https://cdn.example.com"] });

    expect(csp).toContain("script-src 'self' 'inline-speculation-rules'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain(
      "script-src 'self' 'inline-speculation-rules' https://cdn.example.com",
    );
  });

  it("should dedupe allowedDomains against domain-derived and explicit sources", () => {
    const csp = buildCspHeader({
      domain: "example.com",
      allowedDomains: ["https://cdn.example.com", "https://api.example.com"],
      imgSrc: ["https://api.example.com"],
    });

    expect(csp).toContain("img-src 'self' data: https://cdn.example.com https://api.example.com");
  });

  it("should allow merging and disabling custom directives", () => {
    const csp = buildCspHeader({
      directives: {
        "frame-ancestors": false,
        "connect-src": ["'self'", "https://api.example.com"],
      },
    });

    expect(csp).not.toContain("frame-ancestors");
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });
});

describe("security domain validation", () => {
  it("should normalize scheme, case, whitespace, path and trailing slash", () => {
    for (const input of [
      "example.com",
      "https://example.com",
      "http://example.com",
      "https://Example.com/",
      "  example.com  ",
      "example.com/path",
      "example.com/",
      "EXAMPLE.COM",
      "example.com:8080",
    ]) {
      expect(resolveSecurityDomain(input), input).toBe(
        input === "example.com:8080" ? "example.com:8080" : "example.com",
      );
    }
  });

  it("should return undefined for absent or blank domains", () => {
    expect(resolveSecurityDomain(undefined)).toBeUndefined();
    expect(resolveSecurityDomain("")).toBeUndefined();
    expect(resolveSecurityDomain("   ")).toBeUndefined();
  });

  it("should throw on unfixable domains", () => {
    for (const input of ["rimelight com", "..", "localhost", "example", "-example.com"]) {
      expect(() => resolveSecurityDomain(input), input).toThrow(/Invalid security domain/);
    }
  });

  it("should fail fast at build time via the vite plugin", () => {
    expect(() => securityPlugin({ domain: "rimelight com" })).toThrow(/Invalid security domain/);
    expect(() => securityPlugin({ domain: "rimelight.com/" })).not.toThrow();
    expect(() => securityPlugin()).not.toThrow();
  });

  it("should not throw on the request path for a malformed domain", () => {
    // The request path normalizes rather than throws, so a config typo can never 500 a request.
    const csp = buildCspHeader({ domain: "https://Example.com/" });
    expect(csp).toContain("https://cdn.example.com");
  });
});

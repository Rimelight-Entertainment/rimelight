import { describe, it, expect } from "vite-plus/test";
import { createSeoHead, createHead, defineSeoConfig } from "../src/head";
import { deepMerge } from "../src/meta";
import { serializeJsonLd, sanitizeUrl } from "../src/sanitize";

describe("sanitize helpers", () => {
  describe("serializeJsonLd", () => {
    it("neutralizes </script> tag breakouts and HTML comments", () => {
      const payload = {
        name: '</script><script>alert("hacked")</script>',
        comment: "--> <script>",
      };
      const serialized = serializeJsonLd(payload);
      expect(serialized).not.toContain("<");
      expect(serialized).not.toContain(">");
      expect(serialized).not.toContain("/");
      expect(serialized).toContain("\\u003c\\u002fscript\\u003e\\u003cscript\\u003e");
      expect(serialized).toContain("--\\u003e \\u003cscript\\u003e");
    });
  });

  describe("sanitizeUrl", () => {
    it("permits safe HTTP, HTTPS, mailto, and relative URLs", () => {
      expect(sanitizeUrl("https://rimelight.com/about")).toBe("https://rimelight.com/about");
      expect(sanitizeUrl("http://localhost:3000")).toBe("http://localhost:3000");
      expect(sanitizeUrl("mailto:security@rimelight.com")).toBe("mailto:security@rimelight.com");
      expect(sanitizeUrl("tel:+1234567890")).toBe("tel:+1234567890");
      expect(sanitizeUrl("/assets/logo.png")).toBe("/assets/logo.png");
      expect(sanitizeUrl("./favicon.ico")).toBe("./favicon.ico");
      expect(sanitizeUrl("../images/og.png")).toBe("../images/og.png");
    });

    it("rejects javascript:, vbscript:, data:, and protocol-relative // URLs", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe("");
      expect(sanitizeUrl("JAVASCRIPT:alert(1)")).toBe("");
      expect(sanitizeUrl("  javascript:alert(1)  ")).toBe("");
      expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
      expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("");
      expect(sanitizeUrl("//evil.com/phishing")).toBe("");
    });
  });
});

describe("createSeoHead", () => {
  it("generates a valid head tag list", () => {
    const tags = createSeoHead({
      title: "Pricing Plans",
      description: "Transparent pricing for all teams.",
      canonical: "https://rimelight.com/pricing",
    });

    const title = tags.find((t) => t.tag === "title");
    expect(title?.props?.["children"]).toBe("Pricing Plans | Rimelight");

    const description = tags.find((t) => t.tag === "meta" && t.props?.["name"] === "description");
    expect(description?.props?.["content"]).toBe("Transparent pricing for all teams.");

    const canonical = tags.find((t) => t.tag === "link" && t.props?.["rel"] === "canonical");
    expect(canonical?.props?.["href"]).toBe("https://rimelight.com/pricing/");

    const sitemap = tags.find((t) => t.tag === "link" && t.props?.["rel"] === "sitemap");
    expect(sitemap?.props?.["href"]).toBe("/sitemap.xml");

    expect(tags.length).toBeGreaterThan(5);
  });

  it("exposes raw text values for the head registry to escape", () => {
    const tags = createSeoHead({
      title: 'Malicious <script>alert("xss")</script>',
      description: 'Quote " & <tag>',
      canonical: "https://rimelight.com/test",
    });

    const title = tags.find((t) => t.tag === "title");
    expect(title?.props?.["children"]).toBe('Malicious <script>alert("xss")</script> | Rimelight');

    const description = tags.find((t) => t.tag === "meta" && t.props?.["name"] === "description");
    expect(description?.props?.["content"]).toBe('Quote " & <tag>');
  });

  it("neutralizes malicious URLs in canonical and alternates", () => {
    const tags = createSeoHead({
      title: "Security Test",
      canonical: "javascript:alert(1)",
      languageAlternates: [{ hreflang: "es", href: "javascript:alert(2)" }],
    });

    const canonical = tags.find((t) => t.tag === "link" && t.props?.["rel"] === "canonical");
    expect(canonical?.props?.["href"]).toBe("");

    const alternate = tags.find(
      (t) => t.tag === "link" && t.props?.["rel"] === "alternate" && t.props?.["hreflang"] === "es",
    );
    expect(alternate?.props?.["href"]).toBe("");
  });

  it("threads CSP nonce to JSON-LD script tags", () => {
    const tags = createSeoHead({
      title: "Nonce Test",
      nonce: "secret-nonce-12345",
      breadcrumbs: [{ name: "Home", url: "https://rimelight.com" }],
    });

    const jsonLdTags = tags.filter(
      (t) => t.tag === "script" && t.props?.["type"] === "application/ld+json",
    );
    expect(jsonLdTags.length).toBeGreaterThanOrEqual(1);
    for (const tag of jsonLdTags) {
      expect(tag.props?.["nonce"]).toBe("secret-nonce-12345");
    }
  });

  it("composes overrides via deepMerge at the call site", () => {
    const base = {
      title: "Base Page",
      description: "Base description",
      canonical: "https://rimelight.com/base",
    };

    const tags = createSeoHead(
      deepMerge(base, {
        title: "Child Page",
        description: "Child description",
        canonical: "https://rimelight.com/child",
      }),
    );

    expect(tags.find((t) => t.tag === "title")?.props?.["children"]).toBe("Child Page | Rimelight");
    expect(
      tags.find((t) => t.tag === "meta" && t.props?.["name"] === "description")?.props?.["content"],
    ).toBe("Child description");
    expect(
      tags.find((t) => t.tag === "link" && t.props?.["rel"] === "canonical")?.props?.["href"],
    ).toBe("https://rimelight.com/child/");
  });

  it("accumulates JSON-LD script tags for website and breadcrumbs", () => {
    const tags = createSeoHead({
      title: "Base Page",
      breadcrumbs: [{ name: "Home", url: "https://rimelight.com" }],
    });

    const scriptTags = tags.filter(
      (t) => t.tag === "script" && t.props?.["type"] === "application/ld+json",
    );
    expect(scriptTags.length).toBeGreaterThanOrEqual(2);
  });

  it("defineSeoConfig factory pre-binds site configuration", () => {
    const customCreateHead = defineSeoConfig({
      name: "Acme Corp",
      url: "https://acme.org",
      seo: { titleTemplate: "%s — Acme Platform", maxDescriptionLength: 160 },
    });

    const tags = customCreateHead({
      title: "Features",
      canonical: "https://acme.org/features",
    });

    expect(tags.find((t) => t.tag === "title")?.props?.["children"]).toBe(
      "Features — Acme Platform",
    );
    expect(
      tags.find((t) => t.tag === "meta" && t.props?.["property"] === "og:site_name")?.props?.[
        "content"
      ],
    ).toBe("Acme Corp");
  });

  it("createHead is an alias of createSeoHead", () => {
    expect(createHead).toBe(createSeoHead);
  });
});

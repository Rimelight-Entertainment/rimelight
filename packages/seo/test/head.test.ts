import { describe, it, expect } from "vite-plus/test";
import { createSeoHead, createHead, defineSeoConfig } from "../src/head.js";
import { escapeHtml, serializeJsonLd, sanitizeUrl } from "../src/sanitize.js";

describe("sanitize helpers", () => {
  describe("escapeHtml", () => {
    it("escapes special HTML characters", () => {
      expect(escapeHtml("<script>alert(\"XSS & 'attack'\")</script>")).toBe(
        "&lt;script&gt;alert(&quot;XSS &amp; &#039;attack&#039;&quot;)&lt;/script&gt;"
      );
    });
  });

  describe("serializeJsonLd", () => {
    it("neutralizes </script> tag breakouts and HTML comments", () => {
      const payload = {
        name: '</script><script>alert("hacked")</script>',
        comment: "--> <script>"
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
  it("generates valid HeadResult with html and tags", () => {
    const result = createSeoHead({
      title: "Pricing Plans",
      description: "Transparent pricing for all teams.",
      canonical: "https://rimelight.com/pricing"
    });

    expect(result.html).toContain("<title>Pricing Plans | Rimelight</title>");
    expect(result.html).toContain(
      '<meta name="description" content="Transparent pricing for all teams." />'
    );
    expect(result.html).toContain('<link rel="canonical" href="https://rimelight.com/pricing/" />');
    expect(result.html).toContain('<link rel="sitemap" href="/sitemap.xml" />');
    expect(result.tags.length).toBeGreaterThan(5);
  });

  it("escapes HTML in title, descriptions, and metadata", () => {
    const result = createSeoHead({
      title: 'Malicious <script>alert("xss")</script>',
      description: 'Quote " & <tag>',
      canonical: "https://rimelight.com/test"
    });

    expect(result.html).not.toContain('<script>alert("xss")</script>');
    expect(result.html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    expect(result.html).toContain('content="Quote &quot; &amp; &lt;tag&gt;"');
  });

  it("neutralizes malicious URLs in canonical and alternates", () => {
    const result = createSeoHead({
      title: "Security Test",
      canonical: "javascript:alert(1)",
      languageAlternates: [{ hreflang: "es", href: "javascript:alert(2)" }]
    });

    expect(result.html).not.toContain("javascript:alert");
    expect(result.html).toContain('rel="canonical" href=""');
    expect(result.html).toContain('rel="alternate" hreflang="es" href=""');
  });

  it("threads CSP nonce to JSON-LD script tags", () => {
    const result = createSeoHead({
      title: "Nonce Test",
      nonce: "secret-nonce-12345",
      breadcrumbs: [{ name: "Home", url: "https://rimelight.com" }]
    });

    expect(result.html).toContain('<script type="application/ld+json" nonce="secret-nonce-12345">');
    const jsonLdTag = result.tags.find(
      (t) => t.tag === "script" && t.props?.type === "application/ld+json"
    );
    expect(jsonLdTag?.props?.nonce).toBe("secret-nonce-12345");
  });

  it("supports .extend() with deterministic last-wins deduplication", () => {
    const base = createSeoHead({
      title: "Base Page",
      description: "Base description",
      canonical: "https://rimelight.com/base",
      breadcrumbs: [{ name: "Home", url: "https://rimelight.com" }]
    });

    const child = base.extend({
      title: "Child Page",
      description: "Child description",
      canonical: "https://rimelight.com/child",
      breadcrumbs: [{ name: "Child", url: "https://rimelight.com/child" }]
    });

    expect(child.html).toContain("<title>Child Page | Rimelight</title>");
    expect(child.html).not.toContain("<title>Base Page | Rimelight</title>");
    expect(child.html).toContain('<meta name="description" content="Child description" />');
    expect(child.html).not.toContain('<meta name="description" content="Base description" />');
    expect(child.html).toContain('<link rel="canonical" href="https://rimelight.com/child/" />');

    // Multiple JSON-LD script tags accumulate
    const scriptTags = child.tags.filter(
      (t) => t.tag === "script" && t.props?.type === "application/ld+json"
    );
    expect(scriptTags.length).toBeGreaterThanOrEqual(2);
  });

  it("defineSeoConfig factory pre-binds site configuration", () => {
    const customCreateHead = defineSeoConfig({
      name: "Acme Corp",
      url: "https://acme.org",
      seo: { titleTemplate: "%s — Acme Platform", maxDescriptionLength: 160 }
    });

    const result = customCreateHead({
      title: "Features",
      canonical: "https://acme.org/features"
    });

    expect(result.html).toContain("<title>Features — Acme Platform</title>");
    expect(result.html).toContain('<meta property="og:site_name" content="Acme Corp" />');
  });

  it("createHead is an alias of createSeoHead", () => {
    expect(createHead).toBe(createSeoHead);
  });
});

import { describe, it, expect } from "vite-plus/test";
import { Hono } from "hono";
import { seo } from "../src/middleware";

describe("seo Hono Middleware", () => {
  it("intercepts /robots.txt with inlined default private disallows", async () => {
    const app = new Hono();
    app.use(seo({ url: "https://example.com" }));

    const res = await app.request("/robots.txt");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Disallow: /admin");
    expect(text).toContain("Disallow: /api");
    expect(text).toContain("Disallow: /dashboard");
    expect(text).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("intercepts /sitemap.xml and excludes default private paths from entries", async () => {
    const app = new Hono();
    app.use(
      seo({
        url: "https://example.com",
        entries: () => [
          { path: "/about" },
          { path: "/admin" },
          { path: "/admin/users" },
          { path: "/api/users" },
        ],
      }),
    );

    const sitemapRes = await app.request("/sitemap.xml");
    expect(sitemapRes.status).toBe(200);
    expect(sitemapRes.headers.get("Content-Type")).toContain("application/xml");
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain("<loc>https://example.com/about</loc>");
    expect(sitemapText).not.toContain("<loc>https://example.com/admin</loc>");
    expect(sitemapText).not.toContain("https://example.com/admin/users");
    expect(sitemapText).not.toContain("https://example.com/api/users");
  });

  it("intercepts /sitemap.xml and /sitemap-index.xml", async () => {
    const app = new Hono();
    app.use(
      seo({
        url: "https://example.com",
        sitemap: {
          urls: [{ loc: "https://example.com/page-1" }],
        },
      }),
    );

    const sitemapRes = await app.request("/sitemap.xml");
    expect(sitemapRes.status).toBe(200);
    expect(sitemapRes.headers.get("Content-Type")).toContain("application/xml");
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain("<loc>https://example.com/page-1</loc>");

    const indexRes = await app.request("/sitemap-index.xml");
    expect(indexRes.status).toBe(200);
    expect(indexRes.headers.get("Content-Type")).toContain("application/xml");
    const indexText = await indexRes.text();
    expect(indexText).toContain("<sitemapindex");
  });

  it("intercepts /site.webmanifest", async () => {
    const app = new Hono();
    app.use(seo({ name: "Custom App" }));

    const res = await app.request("/site.webmanifest");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/manifest+json");
    const json = await res.json();
    expect(json.name).toBe("Custom App");
    expect(json.icons.length).toBeGreaterThan(0);
  });

  it("intercepts /llms.txt and /llms-full.txt when enabled", async () => {
    const app = new Hono();
    app.use(
      seo({
        name: "DocSite",
        description: "A cool documentation site",
        llms: {
          pages: [{ title: "Guide", url: "/guide" }],
        },
        llmsFull: {
          pages: [{ title: "Full Guide", url: "/full-guide", markdown: "Markdown content here" }],
        },
      }),
    );

    const resLlms = await app.request("/llms.txt");
    expect(resLlms.status).toBe(200);
    const textLlms = await resLlms.text();
    expect(textLlms).toContain("DocSite");

    const resFull = await app.request("/llms-full.txt");
    expect(resFull.status).toBe(200);
    const textFull = await resFull.text();
    expect(textFull).toContain("Markdown content here");
  });

  it("intercepts /favicon.svg", async () => {
    const app = new Hono();
    app.use(seo({ name: "Acme" }));

    const res = await app.request("/favicon.svg");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("image/svg+xml");
    const svg = await res.text();
    expect(svg).toContain("<svg");
    expect(svg).toContain("A");
  });

  it("passes unmatched routes to next()", async () => {
    const app = new Hono();
    app.use(seo());
    app.get("/api/test", (c) => c.text("hello api"));

    const res = await app.request("/api/test");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("hello api");
  });
});

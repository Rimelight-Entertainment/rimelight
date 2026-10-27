import { describe, it, expect } from "vite-plus/test";
import {
  buildSitemapUrls,
  buildSitemapXml,
  buildSitemapIndexXml,
  chunkSitemapUrls,
} from "../src/sitemap";
import type { SeoEntry } from "../src/types";

// Locales come from the mocked i18n config: en (default, unprefixed) and pt.
describe("buildSitemapUrls", () => {
  const options = { site: "https://example.com" };

  it("builds URLs for a single entry in every locale", () => {
    const urls = buildSitemapUrls([{ path: "/about" }], options);

    expect(urls.map((u) => u.loc)).toEqual([
      "https://example.com/about",
      "https://example.com/pt/about",
    ]);
  });

  it("lists every locale plus x-default as alternates on each URL", () => {
    const urls = buildSitemapUrls([{ path: "/about" }], options);
    const expected = [
      { hreflang: "en-US", href: "https://example.com/about" },
      { hreflang: "pt-BR", href: "https://example.com/pt/about" },
      { hreflang: "x-default", href: "https://example.com/about" },
    ];

    expect(urls[0]!.alternates).toEqual(expected);
    expect(urls[1]!.alternates).toEqual(expected);
  });

  it("handles the trailingSlash option", () => {
    const urls = buildSitemapUrls([{ path: "/about" }], { ...options, trailingSlash: "always" });

    expect(urls.map((u) => u.loc)).toEqual([
      "https://example.com/about/",
      "https://example.com/pt/about/",
    ]);
  });

  it("includes lastmod, changefreq and priority when provided", () => {
    const date = new Date("2024-01-01");
    const entries: SeoEntry[] = [
      { path: "/about", lastmod: date, changefreq: "weekly", priority: 0.8 },
    ];
    const [url] = buildSitemapUrls(entries, options);

    expect(url!.lastmod).toBe(date.toISOString());
    expect(url!.changefreq).toBe("weekly");
    expect(url!.priority).toBe(0.8);
  });

  it("restricts to specified locales without alternates", () => {
    const urls = buildSitemapUrls([{ path: "/about", locales: ["en"] }], options);

    expect(urls).toHaveLength(1);
    expect(urls[0]!.loc).toBe("https://example.com/about");
    expect(urls[0]!.alternates).toBeUndefined();
  });

  it("filters out paths matching privatePathPrefixes", () => {
    const entries: SeoEntry[] = [
      { path: "/about" },
      { path: "/admin" },
      { path: "/admin/settings" },
      { path: "/api/data" },
      { path: "/blog" },
    ];
    const urls = buildSitemapUrls(entries, {
      ...options,
      privatePathPrefixes: ["/admin", "/api"],
    });

    const paths = urls.map((u) => u.loc);
    expect(paths).toContain("https://example.com/about");
    expect(paths).toContain("https://example.com/blog");
    expect(paths).not.toContain("https://example.com/admin");
    expect(paths).not.toContain("https://example.com/admin/settings");
    expect(paths).not.toContain("https://example.com/api/data");
  });
});

describe("buildSitemapXml", () => {
  it("generates valid XML for URLs", () => {
    const urls = [
      {
        loc: "https://example.com/about",
        lastmod: "2024-01-01T00:00:00.000Z",
        changefreq: "weekly" as const,
        priority: 0.8,
      },
    ];

    const xml = buildSitemapXml(urls);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain("<loc>https://example.com/about</loc>");
    expect(xml).toContain("<lastmod>2024-01-01T00:00:00.000Z</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
  });

  it("includes xhtml:link alternates when present", () => {
    const urls = [
      {
        loc: "https://example.com/about",
        alternates: [
          { hreflang: "en", href: "https://example.com/about" },
          { hreflang: "es", href: "https://example.com/es/about" },
        ],
      },
    ];

    const xml = buildSitemapXml(urls);

    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/about" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/about" />',
    );
  });
});

describe("buildSitemapIndexXml", () => {
  it("generates valid sitemap index XML", () => {
    const sitemaps = ["https://example.com/sitemap-1.xml", "https://example.com/sitemap-2.xml"];

    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://example.com/sitemap-1.xml</loc>");
    expect(xml).toContain("<loc>https://example.com/sitemap-2.xml</loc>");
  });
});

describe("chunkSitemapUrls", () => {
  it("chunks URLs according to limit", () => {
    const urls = Array.from({ length: 100 }, (_, i) => ({
      loc: `https://example.com/page-${i}`,
    }));

    const chunks = chunkSitemapUrls(urls, 30);

    expect(chunks).toHaveLength(4);
    expect(chunks[0]).toHaveLength(30);
    expect(chunks[1]).toHaveLength(30);
    expect(chunks[2]).toHaveLength(30);
    expect(chunks[3]).toHaveLength(10);
  });

  it("handles URLs less than limit", () => {
    const urls = [{ loc: "https://example.com/page-1" }];

    const chunks = chunkSitemapUrls(urls, 50);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toHaveLength(1);
  });
});

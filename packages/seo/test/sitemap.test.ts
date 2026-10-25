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
    expect(xml).toContain("<urlset");
    expect(xml).toContain("https://example.com/about");
    expect(xml).toContain("<lastmod>2024-01-01T00:00:00.000Z</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>0.8</priority>");
  });

  it("includes alternates in XML", () => {
    const urls = [
      {
        loc: "https://example.com/about",
        alternates: [
          { hreflang: "pt-BR", href: "https://example.com/pt/about" },
          { hreflang: "x-default", href: "https://example.com/about" },
        ],
      },
    ];

    const xml = buildSitemapXml(urls);

    expect(xml).toContain("xhtml:link");
    expect(xml).toContain('hreflang="pt-BR"');
    expect(xml).toContain('hreflang="x-default"');
  });

  it("escapes XML special characters", () => {
    const urls = [
      {
        loc: "https://example.com/about?query=test&amp;other=value",
      },
    ];

    const xml = buildSitemapXml(urls);

    expect(xml).toContain("&amp;");
  });
});

describe("buildSitemapIndexXml", () => {
  it("generates valid sitemap index XML", () => {
    const sitemaps = ["https://example.com/sitemap-0.xml", "https://example.com/sitemap-1.xml"];

    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("https://example.com/sitemap-0.xml");
    expect(xml).toContain("https://example.com/sitemap-1.xml");
  });
});

describe("chunkSitemapUrls", () => {
  it("chunks URLs at default limit", () => {
    const urls = Array.from({ length: 50000 }, (_, i) => ({
      loc: `https://example.com/page-${i}`,
    }));

    const chunks = chunkSitemapUrls(urls);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(45000);
    expect(chunks[1]).toHaveLength(5000);
  });

  it("handles custom limit", () => {
    const urls = Array.from({ length: 100 }, (_, i) => ({
      loc: `https://example.com/page-${i}`,
    }));

    const chunks = chunkSitemapUrls(urls, 25);

    expect(chunks).toHaveLength(4);
    expect(chunks[0]).toHaveLength(25);
  });

  it("returns single chunk for small arrays", () => {
    const urls = [{ loc: "https://example.com/page-1" }, { loc: "https://example.com/page-2" }];

    const chunks = chunkSitemapUrls(urls);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toHaveLength(2);
  });
});

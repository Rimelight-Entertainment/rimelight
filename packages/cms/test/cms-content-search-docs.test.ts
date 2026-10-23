import { describe, it, expect } from "vite-plus/test";
import { createCmsRouter } from "../src/server/router";
import { createContentRouter } from "../src/server/content";
import { createSearchRouter } from "../src/server/search";
import { buildDocsNavFromPages, getDocsConfig } from "../src/docs/config";
import { getDocsSidebar } from "../src/docs/sidebar";
import { searchIndex as pgSearchIndex } from "../src/schema/search";
import { searchIndex as sqliteSearchIndex } from "../src/schema/sqlite";

describe("CMS Content Router, Search Router & Dynamic Docs Config", () => {
  it("exports searchIndex schema for PostgreSQL and SQLite", () => {
    expect(pgSearchIndex).toBeDefined();
    expect(sqliteSearchIndex).toBeDefined();
  });

  it("builds docs navigation dynamically from CMS database pages", () => {
    const mockPages = [
      {
        slug: "overview/getting-started",
        title: { en: "Getting Started" },
        content: {
          properties: {
            scope: "overview",
            order: 1,
            badge: { text: "New", color: "success" },
          },
        },
      },
      {
        slug: "features/auth",
        title: "Authentication",
        content: {
          properties: {
            scope: "features",
            order: 2,
          },
        },
      },
      {
        slug: "company/about",
        title: { en: "About Us" },
        content: {
          properties: {
            scope: "company",
          },
        },
      },
    ];

    const config = buildDocsNavFromPages(mockPages);
    expect(config.sidebar).toBeDefined();
    const scopes = "scopes" in config.sidebar ? config.sidebar.scopes : [];
    expect(scopes.length).toBe(3);

    const overviewScope = scopes.find((s) => s.id === "overview");
    expect(overviewScope).toBeDefined();
    expect(overviewScope?.label).toBe("Overview");
    expect(overviewScope?.items?.[0]?.label).toBe("Getting Started");
    expect(overviewScope?.items?.[0]?.href).toBe("/{locale}/docs/overview/getting-started");

    const featuresScope = scopes.find((s) => s.id === "features");
    expect(featuresScope).toBeDefined();
    expect(featuresScope?.items?.[0]?.label).toBe("Authentication");
  });

  it("returns empty scopes when no doc pages exist", () => {
    const config = buildDocsNavFromPages([]);
    const scopes = "scopes" in config.sidebar ? config.sidebar.scopes : [];
    expect(scopes).toEqual([]);
  });

  it("getDocsConfig derives navigation from passed pages or fallback", async () => {
    const config = await getDocsConfig({ pages: [] });
    expect(config.sidebar).toBeDefined();
  });

  it("resolves sidebar items and scopes via getDocsSidebar with dynamically generated config", async () => {
    const mockPages = [
      {
        slug: "overview/intro",
        title: "Introduction",
        content: { properties: { scope: "overview" } },
      },
    ];

    const { items, scopes, activeScope } = await getDocsSidebar(
      mockPages,
      "en",
      "/en/docs/overview/intro",
    );

    expect(scopes.length).toBe(1);
    expect(activeScope?.id).toBe("overview");
    expect(items.length).toBe(1);
    expect(items[0]?.active).toBe(true);
  });

  it("content router serves pages and doc version endpoints", async () => {
    const mockPages = [
      {
        id: "page-1",
        slug: "getting-started",
        type: "doc",
        title: { en: "Getting Started" },
        content: JSON.stringify({
          properties: { version: "v1.0" },
          blocks: [{ id: "b1", type: "ParagraphBlock", props: { text: { en: "Hello" } } }],
        }),
        deletedAt: null,
        createdAt: new Date(),
        postedAt: new Date(),
      },
    ];

    const createQueryChain = (data: any[]) => {
      const promise = Promise.resolve(data);
      const chain: any = Object.assign(promise, {
        orderBy: () => chain,
        limit: () => Promise.resolve(data.slice(0, 1)),
      });
      return chain;
    };

    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => createQueryChain(mockPages),
          orderBy: () => createQueryChain(mockPages),
        }),
      }),
    };

    const router = createContentRouter({ db: mockDb });

    // Test /pages
    const resPages = await router.request("http://localhost/pages?type=doc");
    expect(resPages.status).toBe(200);
    const dataPages = (await resPages.json()) as any;
    expect(dataPages.pages.length).toBe(1);
    expect(dataPages.pages[0].slug).toBe("getting-started");

    // Test /doc-versions
    const resVersions = await router.request("http://localhost/doc-versions");
    expect(resVersions.status).toBe(200);
    const dataVersions = (await resVersions.json()) as any;
    expect(dataVersions.versions.length).toBe(1);
    expect(dataVersions.versions[0].version).toBe("v1.0");

    // Test /docs-config
    const resDocsConfig = await router.request("http://localhost/docs-config");
    expect(resDocsConfig.status).toBe(200);
    const dataDocsConfig = (await resDocsConfig.json()) as any;
    expect(dataDocsConfig.config).toBeDefined();
    expect(dataDocsConfig.config.sidebar).toBeDefined();
  });

  it("search router performs query and returns empty array on empty query", async () => {
    const router = createSearchRouter({ db: {} });
    const res = await router.request("http://localhost/?q=");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("unified cms router automatically provides content, search, and cms admin routes", async () => {
    const mockPages = [
      {
        id: "p1",
        slug: "intro",
        type: "doc",
        title: { en: "Introduction" },
        content: JSON.stringify({ blocks: [] }),
        deletedAt: null,
        createdAt: new Date(),
        postedAt: new Date(),
      },
    ];

    const createQueryChain = (data: any[]) => {
      const promise = Promise.resolve(data);
      const chain: any = Object.assign(promise, {
        orderBy: () => chain,
        limit: () => Promise.resolve(data.slice(0, 1)),
      });
      return chain;
    };

    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => createQueryChain(mockPages),
          orderBy: () => createQueryChain(mockPages),
        }),
      }),
    };

    const cmsRouter = createCmsRouter({ db: mockDb });

    // Content sub-route
    const resContent = await cmsRouter.request("http://localhost/content/pages?type=doc");
    expect(resContent.status).toBe(200);
    const contentData = (await resContent.json()) as any;
    expect(contentData.pages.length).toBe(1);

    // Search sub-route
    const resSearch = await cmsRouter.request("http://localhost/search?q=");
    expect(resSearch.status).toBe(200);
    const searchData = await resSearch.json();
    expect(searchData).toEqual([]);

    // CMS sub-route
    const resStats = await cmsRouter.request("http://localhost/cms/stats");
    expect(resStats.status).toBe(200);
  });

  it("cms middleware handles /api/content, /api/search, and /api/cms without manual router mounts in apps", async () => {
    const { Hono } = await import("hono");
    const { cms } = await import("../src/middleware/index");

    const mockPages = [
      {
        id: "p1",
        slug: "starter-doc",
        type: "doc",
        title: { en: "Starter Doc" },
        content: JSON.stringify({ blocks: [] }),
        deletedAt: null,
        createdAt: new Date(),
        postedAt: new Date(),
      },
    ];

    const createQueryChain = (data: any[]) => {
      const promise = Promise.resolve(data);
      const chain: any = Object.assign(promise, {
        orderBy: () => chain,
        limit: () => Promise.resolve(data.slice(0, 1)),
      });
      return chain;
    };

    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => createQueryChain(mockPages),
          orderBy: () => createQueryChain(mockPages),
        }),
      }),
    };

    const env = { DB: mockDb };
    const app = new Hono();
    app.use(cms());

    // Custom app API without any CMS routes mounted
    const api = new Hono().get("/hello", (c) => c.text("world"));
    app.route("/api", api);

    // Test /api/content endpoint via middleware
    const resContent = await app.request("http://localhost/api/content/pages?type=doc", {}, env);
    expect(resContent.status).toBe(200);
    const contentData = (await resContent.json()) as any;
    expect(contentData.pages.length).toBe(1);

    // Test /api/search endpoint via middleware
    const resSearch = await app.request("http://localhost/api/search?q=", {}, env);
    expect(resSearch.status).toBe(200);

    // Test custom app route still works
    const resHello = await app.request("http://localhost/api/hello", {}, env);
    expect(resHello.status).toBe(200);
    expect(await resHello.text()).toBe("world");
  });
});

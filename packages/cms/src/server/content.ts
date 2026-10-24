import { Hono } from "hono";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getCmsDb } from "../db/index";
import { renderPageAsMarkdown } from "../docs/agent";
import { buildDocsNavFromPages } from "../docs/config";

export interface ContentRouterOptions {
  prefix?: string | undefined;
  db?: any;
  schema?: {
    pages?: any;
  };
}

function normalizePage(page: any) {
  if (!page) return page;
  return Object.assign({}, page, {
    content: typeof page.content === "string" ? JSON.parse(page.content) : page.content,
  });
}

export function createContentRouter(options: ContentRouterOptions = {}) {
  const content = new Hono();
  if (options.prefix) {
    content.basePath(options.prefix);
  }

  const resolvePagesAndDb = (c?: any) => {
    const res = getCmsDb({ db: options.db }, c);
    return {
      db: res.db,
      pages: options.schema?.pages || res.tables.pages,
    };
  };

  // Public list of published pages, optionally filtered by type (?type=blog|doc|legal)
  content.get("/pages", async (c) => {
    const type = c.req.query("type") || "";
    try {
      const { db, pages } = resolvePagesAndDb(c);
      const list = await db
        .select()
        .from(pages)
        .where(type ? and(eq(pages.type, type), isNull(pages.deletedAt)) : isNull(pages.deletedAt))
        .orderBy(desc(pages.postedAt), desc(pages.createdAt));
      return c.json({ pages: list.map(normalizePage) });
    } catch (error: any) {
      console.error("[Content API /pages Error]:", error);
      return c.json({ pages: [] });
    }
  });

  // Public single page by slug, optionally narrowed by type (?type=legal)
  content.get("/pages/:slug", async (c) => {
    const slug = c.req.param("slug");
    const type = c.req.query("type") || "";
    try {
      const { db, pages } = resolvePagesAndDb(c);
      const results = await db
        .select()
        .from(pages)
        .where(
          type
            ? and(eq(pages.type, type), eq(pages.slug, slug), isNull(pages.deletedAt))
            : and(eq(pages.slug, slug), isNull(pages.deletedAt)),
        )
        .limit(1);
      if (!results[0]) return c.json({ page: null }, 404);
      return c.json({ page: normalizePage(results[0]) });
    } catch (error: any) {
      console.error("[Content API /pages/:slug Error]:", error);
      return c.json({ page: null }, 404);
    }
  });

  // Public doc slugs + versions for version resolution
  content.get("/doc-versions", async (c) => {
    try {
      const { db, pages } = resolvePagesAndDb(c);
      const allDocPages = await db
        .select({ slug: pages.slug, content: pages.content })
        .from(pages)
        .where(and(eq(pages.type, "doc"), isNull(pages.deletedAt)));
      const rows = Array.isArray(allDocPages) ? allDocPages : [];
      const versions = rows.map((row: any) => {
        const contentObj =
          typeof row.content === "string" ? JSON.parse(row.content) : row.content || {};
        return {
          slug: row.slug,
          version: contentObj?.properties?.version,
          properties: contentObj?.properties,
        };
      });
      return c.json({ versions });
    } catch (error: any) {
      console.error("[Content API /doc-versions Error]:", error);
      return c.json({ versions: [] });
    }
  });

  // Public doc candidates lookup by slug list (?slugs=a,b,c)
  content.get("/docs", async (c) => {
    const slugs = (c.req.query("slugs") || "").split(",").filter(Boolean);
    if (slugs.length === 0) return c.json({ pages: [] });
    try {
      const { db, pages } = resolvePagesAndDb(c);
      const results = await db
        .select()
        .from(pages)
        .where(and(eq(pages.type, "doc"), inArray(pages.slug, slugs), isNull(pages.deletedAt)));
      return c.json({ pages: results.map(normalizePage) });
    } catch (error: any) {
      console.error("[Content API /docs Error]:", error);
      return c.json({ pages: [] });
    }
  });

  // Dynamic docs config derived from database docs
  content.get("/docs-config", async (c) => {
    try {
      const { db, pages } = resolvePagesAndDb(c);
      const allDocPages = await db
        .select()
        .from(pages)
        .where(and(eq(pages.type, "doc"), isNull(pages.deletedAt)))
        .orderBy(desc(pages.createdAt));
      const config = buildDocsNavFromPages(allDocPages.map(normalizePage));
      return c.json({ config });
    } catch (error: any) {
      console.error("[Content API /docs-config Error]:", error);
      return c.json({ config: null });
    }
  });

  // Public markdown rendering for a doc slug
  content.get("/docs/:slug/md", async (c) => {
    let slug = c.req.param("slug") || "index";
    const locale = c.req.query("locale") || "en";
    if (slug.endsWith(".md")) slug = slug.slice(0, -3);

    const candidateSlugs = [
      slug,
      slug === "index" ? "overview/getting-started" : `overview/${slug}`,
    ];

    try {
      const { db, pages } = resolvePagesAndDb(c);
      const results = await db
        .select()
        .from(pages)
        .where(
          and(eq(pages.type, "doc"), inArray(pages.slug, candidateSlugs), isNull(pages.deletedAt)),
        );

      let dbPage: any = null;
      for (const cand of candidateSlugs) {
        const match = results.find((p: any) => p.slug === cand);
        if (match) {
          dbPage = match;
          break;
        }
      }

      if (!dbPage) return c.text("Not Found", 404);

      const url = new URL(c.req.url);
      const siteUrl = `${url.protocol}//${url.host}`;
      const body = renderPageAsMarkdown(dbPage, locale, { siteUrl, llmsUrl: "/llms.txt" });

      return new Response(body, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    } catch (error: any) {
      console.error("[Content API /docs/:slug/md Error]:", error);
      return c.text("Not Found", 404);
    }
  });

  return content;
}

export const contentRouter: Hono = createContentRouter();

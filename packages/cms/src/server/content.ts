import { Hono, type Context } from "hono";
import { verifyPreviewToken } from "../core/preview";
import { filterBlocksForReader } from "../auth/filter-blocks";
import { renderPageAsMarkdown } from "../docs/agent";
import { buildDocsNavFromPages } from "../docs/config";
import type { Cms } from "../services/index";
import type { Entry, EntrySummary } from "../services/entries";
import { handleCmsError } from "./errors";
import { cmsForRequest, resolveActor, type CmsServerOptions } from "./context";

export interface ContentRouterOptions extends CmsServerOptions {}

/** An entry as public readers see it: published content only, role-gated blocks removed. */
export interface PublicEntry {
  id: string;
  collection: string;
  slug: string;
  title: Entry["title"];
  description: Entry["description"];
  tags: Entry["tags"];
  bylines: Entry["bylines"];
  publishedAt: Date | null;
  updatedAt: Date | null;
  blocks: Entry["published"]["blocks"];
  properties: Entry["published"]["properties"];
  /** Taxonomy terms (categories, tags…) assigned to the entry. */
  terms: { taxonomy: string; slug: string; label: Record<string, string> | string }[];
}

function publicEntry(entry: Entry | EntrySummary, roles?: string[]): PublicEntry {
  const published = entry.published ?? { blocks: [], properties: {} };
  return {
    id: entry.id,
    collection: entry.collection,
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    tags: entry.tags,
    bylines: entry.bylines,
    publishedAt: entry.postedAt,
    updatedAt: entry.updatedAt,
    blocks: filterBlocksForReader(
      published.blocks,
      roles ? { userId: "", roles, permissions: [] } : undefined,
    ),
    properties: published.properties,
    terms: [],
  };
}

/** Attaches each entry's taxonomy terms (one query for the whole list). */
async function withTerms(cms: Cms, entries: PublicEntry[]): Promise<PublicEntry[]> {
  const byEntry = await cms.taxonomies.getTermsForEntries(entries.map((e) => e.id));
  return entries.map((e) => ({
    ...e,
    terms: (byEntry.get(e.id) ?? []).map((t) => ({
      taxonomy: t.taxonomy,
      slug: t.slug,
      label: t.label as any,
    })),
  }));
}

/**
 * Public, read-only delivery API. Only `published` entries are visible, except when a valid
 * `?preview=<token>` is supplied, which returns the draft of that one entry.
 */
export function createContentRouter(options: ContentRouterOptions = {}) {
  const content = new Hono();
  const search = new Hono();

  content.onError(handleCmsError as any);
  search.onError(handleCmsError as any);

  const cache = (c: Context, seconds = 60) =>
    c.header(
      "Cache-Control",
      `public, max-age=${seconds}, s-maxage=${seconds * 5}, stale-while-revalidate=86400`,
    );

  const readerRoles = async (c: Context) =>
    (await resolveActor(c, { ...options, devBypassAuth: false }))?.roles;

  async function findPublished(cms: Cms, c: Context, slug: string, collection?: string) {
    const token = c.req.query("preview");
    const entry = await cms.entries.getEntry(slug, collection).catch(() => null);
    if (!entry || entry.deletedAt) return null;
    if (token) {
      const secret = cms.ctx.previewSecret;
      if (secret && (await verifyPreviewToken(entry.id, token, secret))) {
        c.header("Cache-Control", "private, no-store");
        return { ...entry, published: entry.draft };
      }
    }
    return entry.status === "published" ? entry : null;
  }

  // ── Generic collection delivery ────────────────────────────────────────────
  content.get("/collections/:collection", async (c) => {
    const cms = cmsForRequest(c, options);
    const { entries, total } = await cms.entries.listEntries({
      collection: c.req.param("collection"),
      status: "published",
      orderBy: (c.req.query("orderBy") as any) ?? "posted",
      includeContent: c.req.query("content") !== "false",
      limit: Number(c.req.query("limit") ?? 50),
      offset: Number(c.req.query("offset") ?? 0),
      ...(c.req.query("taxonomy") && c.req.query("term")
        ? { taxonomy: { taxonomy: c.req.query("taxonomy")!, term: c.req.query("term")! } }
        : {}),
    });
    const roles = await readerRoles(c);
    const resolved = await cms.mentions.resolveMentions(
      await withTerms(
        cms,
        entries.map((e: any) => publicEntry(e, roles)),
      ),
      c.req.query("locale") ?? "en",
    );
    cache(c);
    return c.json({ entries: resolved, total });
  });

  content.get("/collections/:collection/:slug{.+}", async (c) => {
    const cms = cmsForRequest(c, options);
    const raw = c.req.param("slug");
    const asMarkdown = raw.endsWith(".md");
    const entry = await findPublished(
      cms,
      c,
      asMarkdown ? raw.slice(0, -3) : raw,
      c.req.param("collection"),
    );
    if (!entry) return asMarkdown ? c.text("Not Found", 404) : c.json({ entry: null }, 404);
    const [pub] = await cms.mentions.resolveMentions(
      await withTerms(cms, [publicEntry(entry, await readerRoles(c))]),
      c.req.query("locale") ?? "en",
    );
    if (asMarkdown) {
      const url = new URL(c.req.url);
      return new Response(
        renderPageAsMarkdown(pub, c.req.query("locale") ?? "en", {
          siteUrl: `${url.protocol}//${url.host}`,
        }),
        {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        },
      );
    }
    if (!c.req.query("preview")) cache(c);
    return c.json({ entry: pub });
  });

  // ── Docs ───────────────────────────────────────────────────────────────────
  /** Sidebar navigation built from a collection's published entries (default: "doc"). */
  content.get("/docs/nav", async (c) => {
    const cms = cmsForRequest(c, options);
    const { entries } = await cms.entries.listEntries({
      collection: c.req.query("collection") ?? "doc",
      status: "published",
      orderBy: "slug",
      includeContent: true,
      limit: 1000,
    });
    cache(c, 300);
    return c.json({
      config: buildDocsNavFromPages(
        entries.map((e: any) => ({ ...e, properties: e.published?.properties ?? {} })),
        {
          ...(c.req.query("basePath") ? { basePath: c.req.query("basePath")! } : {}),
          locale: c.req.query("locale") ?? "en",
        },
      ),
    });
  });

  // ── Taxonomies & bylines (public) ──────────────────────────────────────────
  content.get("/taxonomies/:taxonomy", async (c) => {
    const cms = cmsForRequest(c, options);
    cache(c, 300);
    return c.json({ terms: await cms.taxonomies.listTerms(c.req.param("taxonomy")) });
  });
  content.get("/bylines/:slug", async (c) => {
    const cms = cmsForRequest(c, options);
    const byline = await cms.bylines.getByline(c.req.param("slug"));
    cache(c, 300);
    return c.json({ byline });
  });

  // ── Search ─────────────────────────────────────────────────────────────────
  search.get("/", async (c) => {
    const cms = cmsForRequest(c, options);
    const results = await cms.search.searchEntries(c.req.query("q") ?? "", {
      ...(c.req.query("collection") ? { collection: c.req.query("collection")! } : {}),
      limit: Math.min(Number(c.req.query("limit") ?? 10), 50),
    });
    cache(c, 30);
    return c.json(results);
  });

  return { content, search };
}

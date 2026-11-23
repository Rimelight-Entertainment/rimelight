/**
 * Public read API for the website (Space CMS.3, decision 0049): the published, Public content the website reads today
 * from the CMS delivery API (packages/cms/src/server/content.ts). Mounted under /v1 by the Space API (api.ts registers
 * the default export). No session: anyone may read. The website's `content` client (packages/cms/src/solid/content.ts)
 * switches to this API in CMS.7 by changing only its base path to `/v1/content/public`.
 *
 * Route map (the CMS route each one mirrors; the client's path is `${base}${path}`):
 *   GET /content/public/collections/:collection          <- GET /api/content/collections/:collection   (list: { entries, total })
 *   GET /content/public/collections/:collection/:slug    <- GET /api/content/collections/:collection/:slug (one: { entry }, `.md` suffix renders Markdown)
 *   GET /content/public/docs/nav                         <- GET /api/content/docs/nav                  (sidebar: { config })
 *   GET /content/public/taxonomies/:taxonomy             <- GET /api/content/taxonomies/:taxonomy      (terms: { terms })
 *   GET /content/public/bylines/:slug                    <- GET /api/content/bylines/:slug             (byline: { byline })
 *   GET /content/public/search                           <- the CMS search router (client path `${base}/search`; array of hits)
 * Mentions have no route of their own: every entry response has its mentions filled (see fillMentions).
 *
 * Shape mapping (the CMS services are drizzle code, so each result is rebuilt here from SQL; the JSON stays the same):
 * - Entry (PublicEntry): id, collection (= pages.type), slug, title, description, tags, bylines (the jsonb columns as
 *   stored), publishedAt (= posted_at), updatedAt (= updated_at), blocks and properties (from pages.content, the
 *   published read cache), terms ({ taxonomy, slug, label }). Dates are ISO strings. `content=false` on a list returns
 *   blocks [] and properties {}, as the CMS does.
 * - Blocks: filterBlocks(blocks, [], "public") from content-access.ts. Anonymous readers have no roles, so role- and
 *   permission-gated blocks are dropped; blocks with visibility "internal" are dropped; children are filtered too.
 * - Terms: TaxonomyTerm fields as the CMS listTerms returns them (id, taxonomy, slug, label, name, description,
 *   parentId, displayOrder, count, postCount, createdAt, updatedAt). `count` and `postCount` count only Public,
 *   published, undeleted entries (the CMS counts every published entry).
 * - Mentions: stored mentions carry only entryId and snapshots. Each one is filled with its collection's colour, the
 *   target's current title and slug, and an href only when the target is Public and published and undeleted. A
 *   target that is not public keeps its stored slug and title (no lookup of an Internal page's title), and gets no href.
 *
 * Caching: the CMS delivery headers (cacheControl), 60 s for entries and lists, 300 s for nav, taxonomies and bylines,
 * 30 s for search, 3600 s for Markdown. Error responses are not cached, as in the CMS.
 *
 * Not mirrored (see the report): the `?preview=` draft read (the CMS checks a preview secret this Worker does not hold),
 * the signed-in reader's role-gated blocks (this API is anonymous by design), the CMS 500 body for unknown orderBy
 * values (answered with 400 here).
 */
import { Hono } from "hono";
// UNSURE: the docs helpers come from the CMS package's docs entry (not written for the Worker). Not checked under the
// Worker bundle; if the bundle pulls in Node-only code, move these two functions here.
import { buildDocsNavFromPages, renderPageAsMarkdown } from "@rimelight/cms/docs";
import { getSql } from "../../db/index.ts";
import { apiError, badRequest, json, type Row, type Sql, UUID } from "../canvas-access.ts";

import {
  type PublicTermRef,
  type PublicEntry,
  type MentionTarget,
  type CollectionInfo,
  parseJson,
  cacheControl,
  entryFromRow,
  termView,
  bylineView,
  mentionIds,
  fillMentions,
} from "./content-public-logic.ts";

type Localized = Record<string, string>;

/* ---------- SQL ---------- */

/** The public filter: deleted_at IS NULL, status = 'published', visibility = 'Public', plus optional type and taxonomy. */
function publicWhere(
  sql: Sql,
  collection: string | null,
  taxonomy: { taxonomy: string; term: string } | null,
) {
  const type = collection === null ? sql`` : sql`AND p.type = ${collection}`;
  const term = taxonomy
    ? sql`AND p.id IN (SELECT ptt.page_id FROM page_taxonomy_terms ptt
         JOIN taxonomy_terms t ON t.id = ptt.term_id
         WHERE t.taxonomy = ${taxonomy.taxonomy} AND t.slug = ${taxonomy.term})`
    : sql``;
  return sql`p.deleted_at IS NULL AND p.status = 'published' AND p.visibility = 'Public' ${type} ${term}`;
}

/** The ORDER BY of a list. Keys are fixed here, never taken from the query string. */
function orderClause(sql: Sql, key: string) {
  switch (key) {
    case "updated":
      return sql`coalesce(p.updated_at, p.created_at) DESC`;
    case "created":
      return sql`p.created_at DESC`;
    case "title":
      return sql`cast(p.title AS text) ASC`;
    case "slug":
      return sql`p.slug ASC`;
    case "type":
      return sql`p.type ASC, coalesce(p.updated_at, p.created_at) DESC`;
    default:
      return sql`p.posted_at DESC NULLS LAST, p.created_at DESC`;
  }
}

const ORDER_KEYS = ["posted", "updated", "created", "title", "slug", "type"];

/** Column list shared by the entry queries (the `Row` shape entryFromRow reads). */
function entryColumns(sql: Sql) {
  return sql`p.id::text AS id, p.type, p.slug, p.title, p.description, p.tags, p.bylines, p.content, p.posted_at, p.updated_at`;
}

/** The terms of many entries, grouped by entry id (one query). */
async function termsFor(sql: Sql, ids: string[]): Promise<Map<string, PublicTermRef[]>> {
  const out = new Map<string, PublicTermRef[]>();
  if (!ids.length) return out;
  const rows = await sql`SELECT ptt.page_id::text AS page_id, t.taxonomy, t.slug, t.label
    FROM page_taxonomy_terms ptt
    JOIN taxonomy_terms t ON t.id = ptt.term_id
    WHERE ptt.page_id = ANY(${ids}::uuid[])
    ORDER BY t.display_order ASC, t.slug ASC`;
  for (const r of rows) {
    const list = out.get(String(r["page_id"])) ?? [];
    list.push({
      taxonomy: String(r["taxonomy"]),
      slug: String(r["slug"]),
      label: parseJson(r["label"]) as Localized | string,
    });
    out.set(String(r["page_id"]), list);
  }
  return out;
}

/** Fills the mentions of the entries from their targets and the collection table (two queries, none if no mentions). */
async function fillEntryMentions<T extends PublicEntry>(
  sql: Sql,
  entries: T[],
  locale: string,
): Promise<T[]> {
  const ids = mentionIds(entries);
  if (!ids.length) return entries;
  const [targetRows, collectionRows] = await Promise.all([
    sql`SELECT p.id::text AS id, p.type, p.slug, p.title, p.status, p.visibility, p.deleted_at
      FROM pages p WHERE p.id = ANY(${ids}::uuid[])`,
    sql`SELECT slug, color, features FROM content_types`,
  ]);
  const targets = new Map<string, MentionTarget>(
    targetRows.map((r) => [
      String(r["id"]),
      {
        collection: String(r["type"]),
        slug: String(r["slug"]),
        title: parseJson(r["title"]),
        public:
          r["deleted_at"] == null && r["status"] === "published" && r["visibility"] === "Public",
      },
    ]),
  );
  const collections = new Map<string, CollectionInfo>(
    collectionRows.map((r) => [
      String(r["slug"]),
      {
        color: (r["color"] as string | null) ?? null,
        features: (parseJson(r["features"]) as Record<string, unknown> | null) ?? {},
      },
    ]),
  );
  return fillMentions(entries, targets, collections, locale);
}

/** One public entry by id or by slug within a collection (the CMS findPublished, public branch). */
async function loadPublicEntry(sql: Sql, collection: string, key: string): Promise<Row | null> {
  const rows = UUID.test(key)
    ? await sql`SELECT ${entryColumns(sql)} FROM pages p
        WHERE p.id = ${key}::text::uuid AND ${publicWhere(sql, null, null)}`
    : await sql`SELECT ${entryColumns(sql)} FROM pages p
        WHERE p.slug = ${key} AND p.type = ${collection} AND ${publicWhere(sql, null, null)}`;
  return (rows[0] as Row | undefined) ?? null;
}

/* ---------- routes ---------- */

const pub = new Hono();

/** A JSON response with the CMS delivery cache headers (json() alone sends no-store). */
function cached(body: unknown, seconds = 60): Response {
  const res = json(body);
  res.headers.set("Cache-Control", cacheControl(seconds));
  return res;
}

/** A query number, or the fallback when absent or not a number. */
function num(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isNaN(n) ? fallback : n;
}

pub.get("/content/public/collections/:collection", async (c) => {
  const sql = getSql();
  const collection = c.req.param("collection");
  const locale = c.req.query("locale") ?? "en";
  const orderKey = c.req.query("orderBy") ?? "posted";
  if (!ORDER_KEYS.includes(orderKey)) {
    return badRequest(`orderBy is one of ${ORDER_KEYS.join(", ")}.`);
  }
  const limit = Math.min(Math.max(num(c.req.query("limit"), 50), 1), 500);
  const offset = Math.max(num(c.req.query("offset"), 0), 0);
  const taxonomy = c.req.query("taxonomy");
  const term = c.req.query("term");
  const withContent = c.req.query("content") !== "false";
  const where = publicWhere(sql, collection, taxonomy && term ? { taxonomy, term } : null);

  const [rows, count] = await Promise.all([
    sql`SELECT ${entryColumns(sql)} FROM pages p
      WHERE ${where}
      ORDER BY ${orderClause(sql, orderKey)}
      LIMIT ${limit} OFFSET ${offset}`,
    sql`SELECT count(*)::int AS n FROM pages p WHERE ${where}`,
  ]);
  const terms = await termsFor(
    sql,
    rows.map((r) => String(r["id"])),
  );
  const entries = rows.map((r) =>
    entryFromRow(r as Row, terms.get(String(r["id"])) ?? [], withContent),
  );
  const filled = await fillEntryMentions(sql, entries, locale);
  return cached({ entries: filled, total: Number((count[0] as Row | undefined)?.["n"] ?? 0) });
});

pub.get("/content/public/collections/:collection/:slug{.+}", async (c) => {
  const sql = getSql();
  const collection = c.req.param("collection");
  const raw = c.req.param("slug");
  const asMarkdown = raw.endsWith(".md");
  const key = asMarkdown ? raw.slice(0, -3) : raw;
  const locale = c.req.query("locale") ?? "en";

  const row = await loadPublicEntry(sql, collection, key);
  if (!row) {
    return asMarkdown
      ? new Response("Not Found", {
          status: 404,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      : json({ entry: null }, 404);
  }
  const terms = await termsFor(sql, [String(row["id"])]);
  const [entry] = await fillEntryMentions(
    sql,
    [entryFromRow(row, terms.get(String(row["id"])) ?? [])],
    locale,
  );
  if (!entry) return json({ entry: null }, 404);

  if (asMarkdown) {
    const url = new URL(c.req.url);
    return new Response(
      renderPageAsMarkdown(entry as unknown as Parameters<typeof renderPageAsMarkdown>[0], locale, {
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
  return cached({ entry });
});

/** Sidebar navigation from a collection's Public, published entries (default collection "doc"). */
pub.get("/content/public/docs/nav", async (c) => {
  const sql = getSql();
  const collection = c.req.query("collection") ?? "doc";
  const rows = await sql`SELECT ${entryColumns(sql)} FROM pages p
    WHERE ${publicWhere(sql, collection, null)}
    ORDER BY p.slug ASC
    LIMIT 1000`;
  const entries = rows.map((r) => entryFromRow(r as Row));
  const basePath = c.req.query("basePath");
  return cached(
    {
      config: buildDocsNavFromPages(entries, {
        ...(basePath ? { basePath } : {}),
        locale: c.req.query("locale") ?? "en",
      }),
    },
    300,
  );
});

/** Terms of a taxonomy, with the count of Public, published entries that use each. */
pub.get("/content/public/taxonomies/:taxonomy", async (c) => {
  const sql = getSql();
  const rows = await sql`SELECT t.id::text AS id, t.taxonomy, t.slug, t.label, t.description,
      t.parent_id::text AS parent_id, t.display_order, t.created_at, t.updated_at,
      (SELECT count(*)::int FROM page_taxonomy_terms ptt
         JOIN pages p ON p.id = ptt.page_id
         WHERE ptt.term_id = t.id
           AND p.deleted_at IS NULL AND p.status = 'published' AND p.visibility = 'Public') AS count
    FROM taxonomy_terms t
    WHERE t.taxonomy = ${c.req.param("taxonomy")}
    ORDER BY t.display_order ASC, t.slug ASC`;
  return cached({ terms: rows.map((r) => termView(r as Row)) }, 300);
});

/** A byline by slug or id. Bylines are public profiles, so there is no visibility filter (as the CMS). */
pub.get("/content/public/bylines/:slug", async (c) => {
  // UNSURE: `fields` and `socials` are returned whole, as the CMS does. Check that no internal field lives there.
  const sql = getSql();
  const key = c.req.param("slug");
  const rows = UUID.test(key)
    ? await sql`SELECT id::text AS id, name, slug, website_url, bio, avatar, user_id, socials, metadata,
        is_guest, fields, created_at, updated_at, deleted_at
      FROM bylines WHERE deleted_at IS NULL AND (slug = ${key} OR id = ${key}::text::uuid) LIMIT 1`
    : await sql`SELECT id::text AS id, name, slug, website_url, bio, avatar, user_id, socials, metadata,
        is_guest, fields, created_at, updated_at, deleted_at
      FROM bylines WHERE deleted_at IS NULL AND slug = ${key} LIMIT 1`;
  const row = rows[0] as Row | undefined;
  if (!row) return apiError(404, "not_found", "There is no such byline.");
  return cached({ byline: bylineView(row) }, 300);
});

/**
 * Full-text search over Public, published entries (the CMS searchEntries, Postgres branch). Query: q, collection,
 * limit (default 10, at most 50). Responds with an array of hits, as the CMS does.
 */
pub.get("/content/public/search", async (c) => {
  const sql = getSql();
  const query = (c.req.query("q") ?? "").trim();
  const collection = c.req.query("collection") || null;
  const limit = Math.min(Math.max(num(c.req.query("limit"), 10), 1), 50);
  if (!query) return cached([], 30);

  // The tsquery terms, as the CMS builds them: punctuation dropped, each word a prefix match.
  const tsq = query
    .replace(/[!|&():*'\\]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `${t}:*`)
    .join(" & ");
  if (!tsq) return cached([], 30);

  // UNSURE: search_index is written by the CMS package (Postgres tsvector). Its rows are only removed on delete, so the
  // Public + published filter below is what keeps unpublished pages out. Only the Postgres branch is ported (Space is Postgres).
  const scope = collection ? sql`AND s.source_type = ${collection}` : sql``;
  const rows = await sql`SELECT s.title, s.url, s.source_type, s.source_id,
      ts_rank(s.searchable_text, to_tsquery('simple', ${tsq})) AS rank,
      ts_headline('simple', s.body_content, to_tsquery('simple', ${tsq}),
        'StartSel=<mark>, StopSel=</mark>, MaxWords=24, MinWords=8') AS snippet
    FROM search_index s
    WHERE (s.searchable_text @@ to_tsquery('simple', ${tsq}) OR s.title ILIKE ${`%${query}%`})
      AND s.source_id IN (
        SELECT p.id::text FROM pages p
        WHERE p.deleted_at IS NULL AND p.status = 'published' AND p.visibility = 'Public')
      ${scope}
    ORDER BY rank DESC, s.updated_at DESC
    LIMIT ${limit}`;
  return cached(
    rows.map((r) => ({
      title: r["title"],
      url: r["url"],
      sourceType: r["source_type"],
      sourceId: r["source_id"],
      snippet: r["snippet"],
      rank: Number(r["rank"]),
    })),
    30,
  );
});

export default pub;

/**
 * Rimelight Space content routes, part 1 (CMS.3, decision 0049): the content types (collections) and pages.
 * Mounted under /v1 by the Space API. Access rules are in content-access.ts.
 */
import { Hono } from "hono";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import {
  type AccessLevel,
  apiError,
  atLeast,
  badRequest,
  forbidden,
  json,
  notFound,
  readBody,
  type Row,
  type Sql,
  UUID,
} from "../canvas-access.ts";
import {
  type ContentScope,
  callerRoles,
  filterBlocks,
  loadPage,
  pageAccess,
  pageFromRow,
  type PageRow,
  type ContentBlock,
} from "./content-access.ts";
import { collectionListItem } from "./content-collections-logic.ts";
import { collectionColor, resolveLabel } from "./content-public-logic.ts";
import {
  MENTION_SCAN_LIMIT,
  mentionLimit,
  mentionPattern,
  normaliseMentionQuery,
} from "./content-mentions-logic.ts";
import { templateContent, templateIdField } from "./content-templates-logic.ts";

const SCOPE_KINDS: ContentScope[] = ["Project", "Team", "Department", "Company"];
const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;
const TITLE_MAX = 200;

/** A page as the caller sees it in lists and headers (no content). */
export function pageSummary(p: PageRow, access: string) {
  return {
    id: p.id,
    slug: p.slug,
    type: p.type,
    title: p.title,
    description: p.description,
    scope_kind: p.scopeKind,
    scope_id: p.scopeId,
    visibility: p.visibility,
    status: p.status,
    published_version_id: p.publishedVersionId,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    my_access: access,
  };
}

/** The scope of a request: kind and id (null for Company). Returns a 400 response when the scope is bad. */
export function scopeFrom(
  kindRaw: unknown,
  idRaw: unknown,
): { kind: ContentScope; id: string | null } | Response {
  if (typeof kindRaw !== "string" || !SCOPE_KINDS.includes(kindRaw as ContentScope)) {
    return badRequest("scopeKind is Project, Team, Department or Company.");
  }
  const kind = kindRaw as ContentScope;
  if (kind === "Company") {
    if (idRaw !== undefined && idRaw !== null && idRaw !== "") {
      return badRequest("A Company page has no scopeId.");
    }
    return { kind, id: null };
  }
  if (typeof idRaw !== "string" || !UUID.test(idRaw)) {
    return badRequest("scopeId is the id of the project, team or department.");
  }
  return { kind, id: idRaw.toLowerCase() };
}

/**
 * The pages in a scope the caller can view, optionally of one content type. Shared by GET /v1/content/pages and the
 * MCP list_pages tool. Returns a Response for a bad scope or no access.
 */
export async function pagesInScope(
  sql: Sql,
  userId: string,
  query: { scopeKind: unknown; scopeId: unknown; type: string | null },
): Promise<{ pages: ReturnType<typeof pageSummary>[] } | Response> {
  const scope = scopeFrom(query.scopeKind, query.scopeId);
  if (scope instanceof Response) return scope;
  const access = await pageAccess(sql, userId, { scopeKind: scope.kind, scopeId: scope.id });
  if (access === "none") return notFound("There is no such scope.");

  const rows = await sql`SELECT id::text AS id, slug, type, title, description, scope_kind,
       scope_id::text AS scope_id, visibility, status, published_version_id::text AS published_version_id,
       content, created_at, updated_at
     FROM pages
     WHERE deleted_at IS NULL
       AND scope_kind = ${scope.kind}::text
       AND scope_id IS NOT DISTINCT FROM ${scope.id}::text::uuid
       AND (${query.type}::text IS NULL OR type = ${query.type}::text)
     ORDER BY updated_at DESC, id`;
  return {
    pages: rows.map((r) => pageSummary(pageFromRow(r as Row), access)),
  };
}

/**
 * Creates an empty Internal draft page from a raw body {scopeKind, scopeId, type, slug, title}. Shared by POST
 * /v1/content/pages and the MCP create_page tool. Needs edit on the scope. Returns a Response for every refusal.
 */
export async function createPageFromInput(
  sql: Sql,
  userId: string,
  body: Record<string, unknown>,
): Promise<ReturnType<typeof pageSummary> | Response> {
  const scope = scopeFrom(body["scopeKind"], body["scopeId"]);
  if (scope instanceof Response) return scope;

  const type = body["type"];
  if (typeof type !== "string" || type.trim() === "")
    return badRequest("type is a content type slug.");
  const slug = body["slug"];
  if (typeof slug !== "string" || !SLUG.test(slug)) {
    return badRequest("slug is lower-case letters, digits and hyphens, 1 to 100 characters.");
  }
  const title = typeof body["title"] === "string" ? body["title"].trim() : "";
  if (title.length < 1 || Array.from(title).length > TITLE_MAX) {
    return badRequest("title is 1 to 200 characters.");
  }

  const access = await pageAccess(sql, userId, { scopeKind: scope.kind, scopeId: scope.id });
  if (access === "none") return notFound("There is no such scope.");
  if (access === "view") return forbidden("You can view this scope but not add pages to it.");

  const types = await sql`SELECT 1 FROM content_types WHERE slug = ${type}::text`;
  if (types.length === 0) return badRequest("There is no such content type.");

  // An optional template: the page starts from its initialBlocks and defaultProperties, with fresh block ids.
  const tid = templateIdField(body["templateId"]);
  if (!tid.ok) return badRequest(tid.message);
  let templateVersion = 1;
  let content = { blocks: [] as unknown[], properties: {} as Record<string, unknown> };
  if (tid.id !== null) {
    const found = await sql`SELECT page_type, version, initial_blocks, default_properties
       FROM page_templates WHERE id = ${tid.id}::text::uuid`;
    const tpl = found[0] as Row | undefined;
    if (!tpl) return badRequest("There is no such template.");
    if (tpl["page_type"] !== type)
      return badRequest("That template is for a different content type.");
    templateVersion = Number(tpl["version"] ?? 1);
    content = templateContent(
      { initialBlocks: tpl["initial_blocks"], defaultProperties: tpl["default_properties"] },
      () => crypto.randomUUID(),
    ) as typeof content;
  }

  const titleJson = JSON.stringify({ en: title });
  const contentJson = JSON.stringify(content);
  try {
    const rows = await sql`INSERT INTO pages (slug, type, title, content, status, visibility,
         scope_kind, scope_id, template_id, template_version)
       VALUES (${slug}::text, ${type}::text, ${titleJson}::jsonb, ${contentJson}::jsonb, 'draft', 'Internal',
         ${scope.kind}::text, ${scope.id}::text::uuid, ${tid.id}::text::uuid, ${templateVersion}::int)
       RETURNING id::text AS id, slug, type, title, description, scope_kind, scope_id::text AS scope_id,
         visibility, status, published_version_id::text AS published_version_id, content, created_at, updated_at`;
    return pageSummary(pageFromRow(rows[0] as Row), access);
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return apiError(409, "conflict", "Another page already uses that slug.");
    }
    throw err;
  }
}

const content = new Hono();

/** GET /v1/content/collections: the content types (collections) pages can be created with. */
content.get("/content/collections", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const rows = await sql`SELECT slug, name, description, icon, color, mode, features, field_schema
       FROM content_types ORDER BY slug`;
    return json({ collections: rows.map((r) => collectionListItem(r as Row)) });
  } catch (err) {
    console.error("space GET /content/collections failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * GET /v1/content/mentions?q=&limit=: pages whose title (in any locale) or slug contains q, that the caller may view.
 * limit is 1 to 25 (default 10). An empty q gives no results.
 */
content.get("/content/mentions", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const q = normaliseMentionQuery(c.req.query("q"));
    const limit = mentionLimit(c.req.query("limit"));
    if (q === "") return json({ results: [] });

    const pattern = mentionPattern(q);
    const rows = await sql`SELECT p.id::text AS id, p.slug, p.type, p.title, p.scope_kind,
         p.scope_id::text AS scope_id, ct.color
       FROM pages p
       LEFT JOIN content_types ct ON ct.slug = p.type
       WHERE p.deleted_at IS NULL
         AND (p.slug ILIKE ${pattern}::text ESCAPE '\\'
              OR EXISTS (SELECT 1 FROM jsonb_each_text(p.title) t
                         WHERE t.value ILIKE ${pattern}::text ESCAPE '\\'))
       ORDER BY p.updated_at DESC, p.id
       LIMIT ${MENTION_SCAN_LIMIT}`;

    // Access is per scope: one check for each scope among the candidates, in their order.
    const access = new Map<string, AccessLevel>();
    const viewable: Row[] = [];
    for (const r of rows as Row[]) {
      if (viewable.length >= limit) break;
      const key = `${r["scope_kind"]}:${r["scope_id"] ?? ""}`;
      if (!access.has(key)) {
        access.set(
          key,
          await pageAccess(sql, who.id, {
            scopeKind: r["scope_kind"] as ContentScope,
            scopeId: (r["scope_id"] as string | null) ?? null,
          }),
        );
      }
      if (atLeast(access.get(key) as AccessLevel, "view")) viewable.push(r);
    }
    return json({
      results: viewable.map((r) => ({
        entryId: r["id"],
        collection: r["type"],
        slug: r["slug"],
        title: resolveLabel(r["title"]),
        color: collectionColor(r["type"] as string, (r["color"] as string | null) ?? null),
      })),
    });
  } catch (err) {
    console.error("space GET /content/mentions failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** GET /v1/content/pages?scopeKind=&scopeId=&type=: the pages in a scope the caller can view. */
content.get("/content/pages", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const listed = await pagesInScope(sql, who.id, {
      scopeKind: c.req.query("scopeKind"),
      scopeId: c.req.query("scopeId"),
      type: c.req.query("type") ?? null,
    });
    if (listed instanceof Response) return listed;
    return json(listed);
  } catch (err) {
    console.error("space GET /content/pages failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/pages {scopeKind, scopeId, type, slug, title}: a new draft page, empty, Internal. Needs edit on the scope. */
content.post("/content/pages", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const created = await createPageFromInput(sql, who.id, body);
    if (created instanceof Response) return created;
    return json(created, 201);
  } catch (err) {
    console.error("space POST /content/pages failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** GET /v1/content/pages/:id: the published content, with the blocks this caller may see. */
content.get("/content/pages/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "view");
    if (found instanceof Response) return found;
    const roles = await callerRoles(sql, who.id);
    const blocks = filterBlocks(
      (found.page.content?.blocks ?? []) as ContentBlock[],
      roles,
      "employee",
    );
    return json({
      ...pageSummary(found.page, found.access),
      content: {
        blocks,
        properties: found.page.content?.properties ?? {},
      },
    });
  } catch (err) {
    console.error("space GET /content/pages/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PATCH /v1/content/pages/:id {visibility?, slug?}: manage only. */
content.patch("/content/pages/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "manage");
    if (found instanceof Response) return found;
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");

    const hasVisibility = body["visibility"] !== undefined;
    const hasSlug = body["slug"] !== undefined;
    if (!hasVisibility && !hasSlug) return badRequest("Send visibility or slug.");
    if (hasVisibility && body["visibility"] !== "Internal" && body["visibility"] !== "Public") {
      return badRequest("visibility is Internal or Public.");
    }
    if (hasSlug && (typeof body["slug"] !== "string" || !SLUG.test(body["slug"]))) {
      return badRequest("slug is lower-case letters, digits and hyphens, 1 to 100 characters.");
    }

    try {
      const rows = await sql`UPDATE pages SET
           visibility = ${hasVisibility ? (body["visibility"] as string) : found.page.visibility}::text,
           slug = ${hasSlug ? (body["slug"] as string) : found.page.slug}::text,
           updated_at = now()
         WHERE id = ${found.page.id}::text::uuid
         RETURNING id::text AS id, slug, type, title, description, scope_kind, scope_id::text AS scope_id,
           visibility, status, published_version_id::text AS published_version_id, content, created_at, updated_at`;
      return json(pageSummary(pageFromRow(rows[0] as Row), found.access));
    } catch (err) {
      if ((err as { code?: string }).code === "23505") {
        return apiError(409, "conflict", "Another page already uses that slug.");
      }
      throw err;
    }
  } catch (err) {
    console.error("space PATCH /content/pages/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/content/pages/:id: soft delete. Manage only. */
content.delete("/content/pages/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "manage");
    if (found instanceof Response) return found;
    await sql`UPDATE pages SET deleted_at = now(), updated_at = now() WHERE id = ${found.page.id}::text::uuid`;
    return json({ deleted: true, id: found.page.id });
  } catch (err) {
    console.error("space DELETE /content/pages/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default content;

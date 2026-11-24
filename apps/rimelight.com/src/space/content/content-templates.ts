/**
 * Rimelight Space page template routes (CMS.6, decision 0049): the page_templates table. Mounted under /v1 by the
 * Space API. Body validation is in content-templates-logic.ts.
 *
 *   GET    /v1/content/templates?collection=  -> { templates: [{ id, slug, title, collection, initialBlocks, ... }] }
 *   POST   /v1/content/templates {slug, title, collection, description?, initialBlocks?, allowedRoles?,
 *            requiredPermission?, defaultProperties?}  -> 201 { template }
 *   PATCH  /v1/content/templates/:id {...any of the fields above but slug}  -> { template }
 *   DELETE /v1/content/templates/:id  -> { deleted: true, id }
 *
 * Listing needs any employee (caller). Writes need an admin or a content editor (isContentAdmin).
 */
import { Hono } from "hono";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import {
  apiError,
  badRequest,
  forbidden,
  json,
  notFound,
  readBody,
  type Row,
  uuidOr404,
} from "../canvas-access.ts";
import { isContentAdmin } from "./content-collections.ts";
import { parseTemplateBody, templateCollectionFilter } from "./content-templates-logic.ts";

const NO_TEMPLATE = "There is no such template.";

/** A template as the routes return it. */
export function templateView(r: Row) {
  return {
    id: r["id"] as string,
    slug: r["slug"],
    title: r["title"],
    description: r["description"] ?? null,
    collection: r["page_type"],
    initialBlocks: r["initial_blocks"] ?? [],
    allowedRoles: r["allowed_roles"] ?? [],
    requiredPermission: r["required_permission"] ?? null,
    defaultProperties: r["default_properties"] ?? {},
  };
}

const content = new Hono();

/** GET /v1/content/templates?collection=: the page templates, optionally of one collection. */
content.get("/content/templates", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const collection = templateCollectionFilter(c.req.query("collection"));
    const rows =
      await sql`SELECT id::text AS id, slug, title, description, page_type, initial_blocks, allowed_roles,
         required_permission, default_properties
       FROM page_templates
       WHERE (${collection}::text IS NULL OR page_type = ${collection}::text)
       ORDER BY slug`;
    return json({ templates: rows.map((r) => templateView(r as Row)) });
  } catch (err) {
    console.error("space GET /content/templates failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/templates: creates a page template. */
content.post("/content/templates", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    if (!(await isContentAdmin(sql, who.id)))
      return forbidden("Only an admin or a content editor can do that.");
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const parsed = parseTemplateBody(body, "create");
    if (!parsed.ok) return badRequest(parsed.message);
    const v = parsed.values;
    const collections =
      await sql`SELECT 1 FROM content_types WHERE slug = ${v.pageType as string}::text`;
    if (collections.length === 0) return badRequest("There is no such collection.");
    try {
      const rows =
        await sql`INSERT INTO page_templates (slug, title, description, page_type, allowed_roles,
           required_permission, default_properties, initial_blocks)
         VALUES (${v.slug as string}::text, ${JSON.stringify(v.title)}::jsonb,
           ${v.description === undefined || v.description === null ? null : JSON.stringify(v.description)}::jsonb,
           ${v.pageType as string}::text, ${JSON.stringify(v.allowedRoles ?? [])}::jsonb,
           ${v.requiredPermission ?? null}::text, ${JSON.stringify(v.defaultProperties ?? {})}::jsonb,
           ${JSON.stringify(v.initialBlocks ?? [])}::jsonb)
         RETURNING id::text AS id, slug, title, description, page_type, initial_blocks, allowed_roles,
           required_permission, default_properties`;
      return json({ template: templateView(rows[0] as Row) }, 201);
    } catch (err) {
      if ((err as { code?: string }).code === "23505") {
        return apiError(409, "conflict", "A template with that slug already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("space POST /content/templates failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PATCH /v1/content/templates/:id: changes a template. The slug cannot change. */
content.patch("/content/templates/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    if (!(await isContentAdmin(sql, who.id)))
      return forbidden("Only an admin or a content editor can do that.");
    const id = uuidOr404(c.req.param("id"), NO_TEMPLATE);
    if (typeof id !== "string") return id;
    const existing =
      await sql`SELECT id::text AS id, slug, title, description, page_type, initial_blocks,
         allowed_roles, required_permission, default_properties
       FROM page_templates WHERE id = ${id}::text::uuid`;
    const row = existing[0] as Row | undefined;
    if (!row) return notFound(NO_TEMPLATE);
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const parsed = parseTemplateBody(body, "update");
    if (!parsed.ok) return badRequest(parsed.message);
    const v = parsed.values;

    const pick = <T>(next: T | undefined, current: T) => (next === undefined ? current : next);
    const title = pick(v.title, row["title"]);
    const description = v.description === undefined ? (row["description"] ?? null) : v.description;
    const pageType = pick(v.pageType, row["page_type"] as string);
    const initialBlocks = pick(v.initialBlocks, row["initial_blocks"]);
    const allowedRoles = pick(v.allowedRoles, row["allowed_roles"]);
    const requiredPermission =
      v.requiredPermission === undefined
        ? (row["required_permission"] ?? null)
        : v.requiredPermission;
    const defaultProperties = pick(v.defaultProperties, row["default_properties"]);

    if (v.pageType !== undefined) {
      const collections = await sql`SELECT 1 FROM content_types WHERE slug = ${pageType}::text`;
      if (collections.length === 0) return badRequest("There is no such collection.");
    }

    const rows = await sql`UPDATE page_templates SET
         title = ${JSON.stringify(title)}::jsonb,
         description = ${description === null ? null : JSON.stringify(description)}::jsonb,
         page_type = ${pageType}::text,
         initial_blocks = ${JSON.stringify(initialBlocks)}::jsonb,
         allowed_roles = ${JSON.stringify(allowedRoles)}::jsonb,
         required_permission = ${requiredPermission}::text,
         default_properties = ${JSON.stringify(defaultProperties)}::jsonb,
         updated_at = now()
       WHERE id = ${id}::text::uuid
       RETURNING id::text AS id, slug, title, description, page_type, initial_blocks, allowed_roles,
         required_permission, default_properties`;
    return json({ template: templateView(rows[0] as Row) });
  } catch (err) {
    console.error("space PATCH /content/templates/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/content/templates/:id: removes a template. */
content.delete("/content/templates/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    if (!(await isContentAdmin(sql, who.id)))
      return forbidden("Only an admin or a content editor can do that.");
    const id = uuidOr404(c.req.param("id"), NO_TEMPLATE);
    if (typeof id !== "string") return id;
    const rows =
      await sql`DELETE FROM page_templates WHERE id = ${id}::text::uuid RETURNING id::text AS id`;
    if (rows.length === 0) return notFound(NO_TEMPLATE);
    return json({ deleted: true, id });
  } catch (err) {
    console.error("space DELETE /content/templates/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default content;

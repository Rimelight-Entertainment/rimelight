/**
 * Rimelight Space collections admin routes (CMS.6, decision 0049): the content_types table, which the CMS reads as
 * collections. Mounted under /v1 by the Space API. Body validation is in content-collections-logic.ts.
 *
 *   POST   /v1/content/collections {slug, label, labelPlural, icon, color, features, fields}  -> 201 { collection }
 *   PATCH  /v1/content/collections/:slug {label?, labelPlural?, icon?, color?, features?, fields?} -> { collection }
 *   DELETE /v1/content/collections/:slug  -> { deleted: true, slug }, or 409 while pages of that type exist
 *
 * Allowed for global admins (user_roles.role = 'admin') and content editors (user_roles.role = 'content_editor').
 * The GET list stays in content-pages.ts.
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
  type Sql,
} from "../canvas-access.ts";
import {
  collectionInUseMessage,
  collectionListItem,
  parseCollectionBody,
  type CollectionValues,
} from "./content-collections-logic.ts";

/** True for a global admin or a content editor. Shared with content-templates.ts. */
export async function isContentAdmin(sql: Sql, userId: string): Promise<boolean> {
  const rows = await sql`SELECT EXISTS (SELECT 1 FROM user_roles r
       WHERE r.user_id = ${userId}::text::uuid AND r.role IN ('admin', 'content_editor')) AS allowed`;
  return (rows[0] as Row | undefined)?.["allowed"] === true;
}

/** A content type as the admin routes return it (the same shape as the collections list). */
export function collectionView(r: Row) {
  return collectionListItem(r);
}

const content = new Hono();

/** POST /v1/content/collections: creates a content type. */
content.post("/content/collections", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    if (!(await isContentAdmin(sql, who.id)))
      return forbidden("Only an admin or a content editor can do that.");
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const parsed = parseCollectionBody(body, "create");
    if (!parsed.ok) return badRequest(parsed.message);
    const v = parsed.values;
    const features = v.featuresPatch ?? {};
    try {
      const rows =
        await sql`INSERT INTO content_types (slug, name, icon, color, features, field_schema)
         VALUES (${v.slug as string}::text, ${JSON.stringify(v.name)}::jsonb, ${v.icon as string}::text,
           ${v.color ?? null}::text, ${JSON.stringify(features)}::jsonb,
           ${JSON.stringify(v.fieldSchema)}::jsonb)
         RETURNING slug, name, description, icon, color, mode, features, field_schema`;
      return json({ collection: collectionView(rows[0] as Row) }, 201);
    } catch (err) {
      if ((err as { code?: string }).code === "23505") {
        return apiError(409, "conflict", "A collection with that slug already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("space POST /content/collections failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PATCH /v1/content/collections/:slug: changes a content type. The slug cannot change. */
content.patch("/content/collections/:slug", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    if (!(await isContentAdmin(sql, who.id)))
      return forbidden("Only an admin or a content editor can do that.");
    const slug = c.req.param("slug");
    const existing =
      await sql`SELECT slug, name, description, icon, color, mode, features, field_schema
       FROM content_types WHERE slug = ${slug}::text`;
    const row = existing[0] as Row | undefined;
    if (!row) return notFound("There is no such collection.");
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const parsed = parseCollectionBody(body, "update");
    if (!parsed.ok) return badRequest(parsed.message);
    const v: CollectionValues = parsed.values;

    const name = v.name ?? row["name"];
    const icon = v.icon ?? row["icon"];
    const color = v.color !== undefined ? v.color : (row["color"] ?? null);
    const features = {
      ...(row["features"] as Record<string, unknown> | null),
      ...v.featuresPatch,
    };
    const fields = v.fieldSchema ?? row["field_schema"];
    const rows = await sql`UPDATE content_types SET
         name = ${JSON.stringify(name)}::jsonb,
         icon = ${icon as string}::text,
         color = ${color}::text,
         features = ${JSON.stringify(features)}::jsonb,
         field_schema = ${JSON.stringify(fields)}::jsonb,
         updated_at = now()
       WHERE slug = ${slug}::text
       RETURNING slug, name, description, icon, color, mode, features, field_schema`;
    return json({ collection: collectionView(rows[0] as Row) });
  } catch (err) {
    console.error("space PATCH /content/collections/:slug failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/content/collections/:slug: removes a content type. Refused (409) while pages of that type exist. */
content.delete("/content/collections/:slug", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    if (!(await isContentAdmin(sql, who.id)))
      return forbidden("Only an admin or a content editor can do that.");
    const slug = c.req.param("slug");
    const exists = await sql`SELECT 1 FROM content_types WHERE slug = ${slug}::text`;
    if (exists.length === 0) return notFound("There is no such collection.");
    // UNSURE: soft-deleted pages are not counted, so deleting a type whose only pages are in the trash is allowed.
    const counted =
      await sql`SELECT count(*)::int AS n FROM pages WHERE type = ${slug}::text AND deleted_at IS NULL`;
    const message = collectionInUseMessage(Number((counted[0] as Row)["n"]));
    if (message !== null) return apiError(409, "conflict", message);
    await sql`DELETE FROM content_types WHERE slug = ${slug}::text`;
    return json({ deleted: true, slug });
  } catch (err) {
    console.error("space DELETE /content/collections/:slug failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default content;

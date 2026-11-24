/**
 * Rimelight Space content route for moving a page to another scope (CMS.6, decision 0049). Mounted under /v1 by the
 * Space API. Body validation is in content-scope-logic.ts; access rules are in content-access.ts.
 *
 *   PATCH /v1/content/pages/:id/scope {scopeKind, scopeId}
 *     Needs manage on the page in its current scope, and edit on the target scope (the same rules as pageAccess).
 *     scopeId is null for Company and the id of an existing project, team or department otherwise.
 *     Responds with the page summary (200), or 400, 403, 404, 409 (slug taken in the target scope).
 */
import { Hono } from "hono";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import {
  apiError,
  atLeast,
  badRequest,
  forbidden,
  json,
  notFound,
  readBody,
  type Row,
} from "../canvas-access.ts";
import { loadPage, pageAccess, pageFromRow } from "./content-access.ts";
import { pageSummary } from "./content-pages.ts";
import { validateScopeMove } from "./content-scope-logic.ts";

const content = new Hono();

/** PATCH /v1/content/pages/:id/scope {scopeKind, scopeId}: moves a page to another scope. */
content.patch("/content/pages/:id/scope", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "manage");
    if (found instanceof Response) return found;
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const move = validateScopeMove(body);
    if (!move.ok) return badRequest(move.message);

    if (move.kind !== "Company" && move.id !== null) {
      const rows =
        move.kind === "Project"
          ? await sql`SELECT 1 FROM projects WHERE id = ${move.id}::text::uuid AND deleted_at IS NULL`
          : move.kind === "Team"
            ? await sql`SELECT 1 FROM teams WHERE id = ${move.id}::text::uuid`
            : await sql`SELECT 1 FROM departments WHERE id = ${move.id}::text::uuid`;
      if (rows.length === 0) return notFound("There is no such scope.");
    }

    const target = await pageAccess(sql, who.id, { scopeKind: move.kind, scopeId: move.id });
    if (target === "none") return notFound("There is no such scope.");
    if (!atLeast(target, "edit")) {
      return forbidden("You can view that scope but not add pages to it.");
    }

    try {
      const rows = await sql`UPDATE pages SET
           scope_kind = ${move.kind}::text,
           scope_id = ${move.id}::text::uuid,
           updated_at = now()
         WHERE id = ${found.page.id}::text::uuid
         RETURNING id::text AS id, slug, type, title, description, scope_kind, scope_id::text AS scope_id,
           visibility, status, published_version_id::text AS published_version_id, content, created_at, updated_at`;
      return json(pageSummary(pageFromRow(rows[0] as Row), target));
    } catch (err) {
      if ((err as { code?: string }).code === "23505") {
        return apiError(
          409,
          "conflict",
          "Another page already uses that slug in the target scope.",
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("space PATCH /content/pages/:id/scope failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default content;

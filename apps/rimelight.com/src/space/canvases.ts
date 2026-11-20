/**
 * Rimelight Space canvas routes on the website Worker (CV.1, decision 0045): list, create, read, rename, archive,
 * unarchive, delete for good, move to a project, sharing of personal canvases, the snapshot the live room starts
 * from, and storage quotas. Mounted under /v1 by the Space API. Asset bytes and thumbnails are in canvas-assets.ts.
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { getSql } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";
import {
  type CanvasRow,
  type QuotaScope,
  type Q,
  type Row,
  type Sql,
  apiError,
  assetView,
  badRequest,
  canvasFromRow,
  canvasView,
  cleanTitle,
  forbidden,
  iso,
  json,
  lockQuota,
  loadCanvas,
  notFound,
  projectAccess,
  quotaUsage,
  readBody,
  uuidOr404,
} from "./canvas-access.ts";
import { quotaRefusal } from "./canvas-image.ts";
import { notifyRoom } from "./canvas-live.ts";

const NO_PERSON = "There is no such person.";
const NO_SHARE = "That person has no access.";
const blobBucket = (): R2Bucket => (env as unknown as { BLOB: R2Bucket }).BLOB;

/** The canvas as the caller sees it, with a status (201 after a create). */
async function viewOf(
  sql: Sql,
  userId: string,
  id: string,
  status = 200,
  includeArchived = false,
): Promise<Response> {
  const canvas = await loadCanvas(sql, userId, id, "view", { includeArchived });
  if (isResponse(canvas)) return canvas;
  return json(canvasView(canvas), status);
}

/** The quota shape: usage and limit. */
async function quotaView(sql: Q, scope: QuotaScope, subjectId: string) {
  const q = await quotaUsage(sql, scope, subjectId);
  return {
    scope,
    subject_id: subjectId,
    usage_bytes: q.usage,
    limit_bytes: q.limit,
  };
}

const canvases = new Hono();

/**
 * GET /v1/canvases?scope=personal|shared|project&project=KEY&archived=true: the canvases in a list,
 * most recently updated first. The archived list (archived=true) is for personal and project canvases; in a project
 * only the canvases the caller may manage are in it.
 */
canvases.get("/canvases", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const scope = c.req.query("scope");
    if (scope !== "personal" && scope !== "shared" && scope !== "project") {
      return badRequest("scope is personal, shared or project.");
    }
    const includeArchived = c.req.query("archived") === "true";
    if (includeArchived && scope === "shared") {
      return badRequest("Archived canvases are only listed for personal and project canvases.");
    }

    let rows: Row[];
    if (scope === "personal") {
      rows =
        await sql`SELECT c.id::text AS id, c.title, c.owner_id::text AS owner_id, c.project_id::text AS project_id,
             p.key AS project_key, c.created_by::text AS created_by, c.seq, c.created_at, c.updated_at, c.archived_at,
             m.role AS project_role, s.role AS share_role,
             EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = ${who.id}::text::uuid AND r.role = 'admin') AS global_admin
        FROM canvases c
        LEFT JOIN projects p ON p.id = c.project_id
        LEFT JOIN project_members m ON m.project_id = c.project_id AND m.user_id = ${who.id}::text::uuid AND m.deleted_at IS NULL
        LEFT JOIN canvas_shares s ON s.canvas_id = c.id AND s.user_id = ${who.id}::text::uuid
       WHERE c.owner_id = ${who.id}::text::uuid AND ((c.archived_at IS NOT NULL) = ${includeArchived}::boolean)
       ORDER BY c.updated_at DESC, c.id`;
    } else if (scope === "shared") {
      rows =
        await sql`SELECT c.id::text AS id, c.title, c.owner_id::text AS owner_id, c.project_id::text AS project_id,
             p.key AS project_key, c.created_by::text AS created_by, c.seq, c.created_at, c.updated_at, c.archived_at,
             m.role AS project_role, s.role AS share_role,
             EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = ${who.id}::text::uuid AND r.role = 'admin') AS global_admin
        FROM canvas_shares s
        JOIN canvases c ON c.id = s.canvas_id
        LEFT JOIN projects p ON p.id = c.project_id
        LEFT JOIN project_members m ON m.project_id = c.project_id AND m.user_id = ${who.id}::text::uuid AND m.deleted_at IS NULL
       WHERE s.user_id = ${who.id}::text::uuid AND c.archived_at IS NULL
       ORDER BY c.updated_at DESC, c.id`;
    } else {
      const key = c.req.query("project");
      if (!key) return badRequest("project is the project key.");
      const project = await projectAccess(sql, who.id, key);
      if (isResponse(project)) return project;
      rows =
        await sql`SELECT c.id::text AS id, c.title, c.owner_id::text AS owner_id, c.project_id::text AS project_id,
             p.key AS project_key, c.created_by::text AS created_by, c.seq, c.created_at, c.updated_at, c.archived_at,
             m.role AS project_role, s.role AS share_role,
             EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = ${who.id}::text::uuid AND r.role = 'admin') AS global_admin
        FROM canvases c
        LEFT JOIN projects p ON p.id = c.project_id
        LEFT JOIN project_members m ON m.project_id = c.project_id AND m.user_id = ${who.id}::text::uuid AND m.deleted_at IS NULL
        LEFT JOIN canvas_shares s ON s.canvas_id = c.id AND s.user_id = ${who.id}::text::uuid
       WHERE c.project_id = ${project.projectId}::text::uuid AND ((c.archived_at IS NOT NULL) = ${includeArchived}::boolean)
       ORDER BY c.updated_at DESC, c.id`;
    }

    let list: CanvasRow[] = rows
      .map((r) => canvasFromRow(r, who.id))
      .filter((x) => x.access !== "none");
    if (scope === "project" && includeArchived) {
      list = list.filter((x) => x.access === "manage");
    }
    return json({ canvases: list.map((x) => canvasView(x)) });
  } catch (err) {
    console.error("space GET /canvases failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * POST /v1/canvases { title?, project_key? }: a personal canvas, or one in a project the caller may add to
 * (admins and members; a global admin always may). 201 with the canvas.
 */
canvases.post("/canvases", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const title = cleanTitle(body["title"]);
    if (title === null) return badRequest("A title is 1 to 200 characters.");

    let projectId: string | null = null;
    const key = body["project_key"];
    if (key !== undefined && key !== null) {
      if (typeof key !== "string") return badRequest("project_key is text.");
      const project = await projectAccess(sql, who.id, key);
      if (isResponse(project)) return project;
      if (project.role !== "admin" && project.role !== "member" && !project.globalAdmin) {
        return forbidden("Viewers cannot create canvases in this project.");
      }
      projectId = project.projectId;
    }

    const inserted =
      projectId === null
        ? await sql`INSERT INTO canvases (title, owner_id, created_by)
             VALUES (${title}::text, ${who.id}::text::uuid, ${who.id}::text::uuid)
             RETURNING id::text AS id`
        : await sql`INSERT INTO canvases (title, project_id, created_by)
             VALUES (${title}::text, ${projectId}::text::uuid, ${who.id}::text::uuid)
             RETURNING id::text AS id`;
    const id = inserted[0]?.["id"] as string;
    return await viewOf(sql, who.id, id, 201);
  } catch (err) {
    console.error("space POST /canvases failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * GET /v1/canvases/{id}: the canvas, with the caller's access. Needs view access. An archived canvas is returned
 * too (`archived: true`); it opens read-only, since the live room refuses ops on it.
 */
canvases.get("/canvases/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    return await viewOf(getSql(), who.id, c.req.param("id"), 200, true);
  } catch (err) {
    console.error("space GET /canvases/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PATCH /v1/canvases/{id} { title }: renames the canvas. Needs manage access. */
canvases.patch("/canvases/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage");
    if (isResponse(found)) return found;
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    if (typeof body["title"] !== "string") return badRequest("A title is 1 to 200 characters.");
    const title = cleanTitle(body["title"]);
    if (title === null) return badRequest("A title is 1 to 200 characters.");
    await sql`UPDATE canvases SET title = ${title}::text, updated_at = now()
       WHERE id = ${found.id}::text::uuid`;
    await notifyRoom(found.id, { type: "title", title });
    return await viewOf(sql, who.id, found.id);
  } catch (err) {
    console.error("space PATCH /canvases/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * POST /v1/canvases/{id}/archive: archives the canvas. Its images and thumbnails are kept. Needs manage access.
 */
canvases.post("/canvases/:id/archive", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage", {
      includeArchived: true,
    });
    if (isResponse(found)) return found;
    if (found.archivedAt !== null) {
      return apiError(409, "conflict", "This canvas is already archived.");
    }
    await sql`UPDATE canvases SET archived_at = now(), updated_at = now()
       WHERE id = ${found.id}::text::uuid AND archived_at IS NULL`;
    await notifyRoom(found.id, { type: "archived" });
    return await viewOf(sql, who.id, found.id, 200, true);
  } catch (err) {
    console.error("space POST /canvases/:id/archive failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/canvases/{id}/unarchive: takes a canvas out of the archive. Needs manage access. */
canvases.post("/canvases/:id/unarchive", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage", {
      includeArchived: true,
    });
    if (isResponse(found)) return found;
    if (found.archivedAt === null) {
      return apiError(409, "conflict", "This canvas is not archived.");
    }
    await sql`UPDATE canvases SET archived_at = NULL, updated_at = now()
       WHERE id = ${found.id}::text::uuid`;
    await notifyRoom(found.id, { type: "unarchived" });
    return await viewOf(sql, who.id, found.id);
  } catch (err) {
    console.error("space POST /canvases/:id/unarchive failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * DELETE /v1/canvases/{id}: deletes the canvas for good, with its items, images and thumbnails (R2 objects under
 * space/canvases/{id}/). Archive (POST .../archive) keeps them instead. Needs manage access.
 */
canvases.delete("/canvases/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage", {
      includeArchived: true,
    });
    if (isResponse(found)) return found;
    // Items, assets and shares go by ON DELETE CASCADE.
    await sql`DELETE FROM canvases WHERE id = ${found.id}::text::uuid`;
    await notifyRoom(found.id, { type: "deleted" });
    const prefix = `space/canvases/${found.id}/`;
    try {
      const bucket = blobBucket();
      let cursor: string | undefined;
      for (;;) {
        const listed = await bucket.list(
          cursor === undefined ? { prefix, limit: 1000 } : { prefix, cursor, limit: 1000 },
        );
        if (listed.objects.length > 0) {
          await bucket.delete(listed.objects.map((o) => o.key));
        }
        if (listed.truncated) cursor = listed.cursor;
        else break;
      }
    } catch (err) {
      // The row is gone; the bytes are orphaned under a known prefix.
      console.error("space DELETE /canvases/:id R2 cleanup failed", found.id, err);
    }
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("space DELETE /canvases/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * POST /v1/canvases/{id}/move { project_key }: moves a personal canvas into a project. Only the owner may move it,
 * and the target project's quota must hold the canvas's bytes. Shares are dropped; the id and R2 keys stay.
 */
canvases.post("/canvases/:id/move", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage");
    if (isResponse(found)) return found;
    if (found.projectId !== null) {
      return apiError(409, "conflict", "This canvas already belongs to a project.");
    }
    if (found.ownerId !== who.id) {
      return forbidden("Only the owner can move a personal canvas.");
    }
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const key = body["project_key"];
    if (typeof key !== "string") return badRequest("project_key is the project key.");
    const project = await projectAccess(sql, who.id, key);
    if (isResponse(project)) return project;
    if (project.role !== "admin" && project.role !== "member" && !project.globalAdmin) {
      return forbidden("You need to be a member of that project.");
    }

    const projectId = project.projectId;
    const refusal = await sql.begin(async (tx): Promise<string | null> => {
      await lockQuota(tx, "Project", projectId);
      const sized = await tx`SELECT COALESCE(sum(bytes), 0)::bigint AS total FROM canvas_assets
         WHERE canvas_id = ${found.id}::text::uuid`;
      const bytes = Number(sized[0]?.["total"] ?? 0);
      const { usage, limit } = await quotaUsage(tx, "Project", projectId);
      const message = quotaRefusal(usage, limit, bytes);
      if (message !== null) return message;
      await tx`UPDATE canvases SET owner_id = NULL, project_id = ${projectId}::text::uuid, updated_at = now()
         WHERE id = ${found.id}::text::uuid AND owner_id = ${who.id}::text::uuid AND project_id IS NULL
           AND archived_at IS NULL`;
      await tx`DELETE FROM canvas_shares WHERE canvas_id = ${found.id}::text::uuid`;
      return null;
    });
    if (refusal !== null) {
      return json({ error: "quota_exceeded", message: refusal }, 413);
    }
    await notifyRoom(found.id, { type: "reconnect" });
    return await viewOf(sql, who.id, found.id);
  } catch (err) {
    console.error("space POST /canvases/:id/move failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** GET /v1/canvases/{id}/shares: who the personal canvas is shared with. Needs manage access. */
canvases.get("/canvases/:id/shares", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage");
    if (isResponse(found)) return found;
    const rows = await sql`SELECT s.user_id::text AS user_id, e.name, e.email, s.role
       FROM canvas_shares s
       JOIN employees e ON e.id = s.user_id
       WHERE s.canvas_id = ${found.id}::text::uuid
       ORDER BY e.name, s.user_id`;
    return json({
      shares: rows.map((r) => ({
        user_id: r["user_id"] as string,
        name: r["name"] as string,
        email: r["email"] as string,
        role: r["role"] as string,
      })),
    });
  } catch (err) {
    console.error("space GET /canvases/:id/shares failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PUT /v1/canvases/{id}/shares/{user} { role }: shares a personal canvas with an active person. Needs manage access. */
canvases.put("/canvases/:id/shares/:user", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage");
    if (isResponse(found)) return found;
    if (found.projectId !== null) {
      return apiError(409, "conflict", "Project canvases use project roles.");
    }
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const role = body["role"];
    if (role !== "Viewer" && role !== "Editor") return badRequest("role is Viewer or Editor.");
    const target = uuidOr404(c.req.param("user"), NO_PERSON);
    if (isResponse(target)) return target;
    if (target === who.id) return badRequest("You already own this canvas.");

    const people = await sql`SELECT e.id::text AS id, e.name, e.email FROM employees e
       WHERE e.id = ${target}::text::uuid AND e.is_active AND e.deleted_at IS NULL`;
    const person = people[0] as Row | undefined;
    if (!person) return notFound(NO_PERSON);

    await sql`INSERT INTO canvas_shares (canvas_id, user_id, role, created_by)
       VALUES (${found.id}::text::uuid, ${target}::text::uuid, ${role}::text, ${who.id}::text::uuid)
       ON CONFLICT (canvas_id, user_id) DO UPDATE SET role = EXCLUDED.role`;
    await notifyRoom(found.id, { type: "reconnect" });
    return json({
      user_id: target,
      name: person["name"] as string,
      email: person["email"] as string,
      role,
    });
  } catch (err) {
    console.error("space PUT /canvases/:id/shares/:user failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/canvases/{id}/shares/{user}: takes a person's access away. Needs manage access. */
canvases.delete("/canvases/:id/shares/:user", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "manage");
    if (isResponse(found)) return found;
    const target = uuidOr404(c.req.param("user"), NO_SHARE);
    if (isResponse(target)) return target;
    const removed = await sql`DELETE FROM canvas_shares
       WHERE canvas_id = ${found.id}::text::uuid AND user_id = ${target}::text::uuid
       RETURNING user_id`;
    if (removed.length === 0) return notFound(NO_SHARE);
    await notifyRoom(found.id, { type: "reconnect" });
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("space DELETE /canvases/:id/shares/:user failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * GET /v1/canvases/{id}/snapshot: the canvas, its live items (in draw order) and its assets. The live room starts
 * from this. Needs view access.
 */
canvases.get("/canvases/:id/snapshot", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadCanvas(sql, who.id, c.req.param("id"), "view", {
      includeArchived: true,
    });
    if (isResponse(found)) return found;
    const items = await sql`SELECT i.id::text AS id, i.kind, i.z, i.version, i.props,
         i.updated_by::text AS updated_by, i.updated_at
       FROM canvas_items i
       WHERE i.canvas_id = ${found.id}::text::uuid AND NOT i.deleted
       ORDER BY i.z, i.id`;
    const assets = await sql`SELECT * FROM canvas_assets
       WHERE canvas_id = ${found.id}::text::uuid
       ORDER BY created_at, id`;
    return json({
      canvas: canvasView(found),
      items: items.map((r) => ({
        id: r["id"] as string,
        kind: r["kind"] as string,
        z: r["z"] as string,
        version: Number(r["version"]),
        props: r["props"],
        updated_by: r["updated_by"] as string,
        updated_at: iso(r["updated_at"]),
      })),
      assets: assets.map((r) => assetView(found.id, r as Row)),
    });
  } catch (err) {
    console.error("space GET /canvases/:id/snapshot failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** GET /v1/me/quota: the caller's personal storage use and limit. */
canvases.get("/me/quota", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    return json(await quotaView(getSql(), "User", who.id));
  } catch (err) {
    console.error("space GET /me/quota failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** GET /v1/projects/{key}/quota: the project's canvas storage use and limit. Needs membership. */
canvases.get("/projects/:key/quota", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const project = await projectAccess(sql, who.id, c.req.param("key"));
    if (isResponse(project)) return project;
    return json(await quotaView(sql, "Project", project.projectId));
  } catch (err) {
    console.error("space GET /projects/:key/quota failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default canvases;

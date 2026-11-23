/**
 * Rimelight Space issue attachment routes on the website Worker (port of the attachment handlers in
 * project_service.rs and the attachment SQL in pg_projects.rs). Mounted under /v1 by the Space API.
 *
 * Bytes live in the R2 bucket (env.BLOB). The Rust store puts every blob key under `space/avatars/`
 * (blob.rs R2_PREFIX, shared by avatars and attachments), so attachment keys use that prefix too.
 * Keys are `attachment-{issue uuid}-{16 hex}.bin`, as in project_service.rs.
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import type postgres from "postgres";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

type Sql = ReturnType<typeof getDb>["$client"];
type Q = Sql | postgres.TransactionSql<{}>;
// biome-ignore lint/suspicious/noExplicitAny: postgres.js rows are untyped
type Row = Record<string, any>;

type BlobBindings = { BLOB: R2Bucket };

const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
const FILE_NAME_MAX = 255;
const NO_ATTACHMENT = "There is no such attachment.";
/** Key prefix the Rust R2 store applies to every blob key (blob.rs R2_PREFIX). */
const BLOB_PREFIX = "space/avatars/";

const blobBucket = (): R2Bucket => (env as unknown as BlobBindings).BLOB;
const objectKey = (key: string) => `${BLOB_PREFIX}${key}`;

/* ---------- responses ---------- */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const apiError = (status: number, error: string, message: string) =>
  json({ error, message }, status);
const notFound = (message: string) => apiError(404, "not_found", message);
const forbidden = (message: string) => apiError(403, "forbidden", message);
const badRequest = (message: string) => apiError(400, "invalid_request", message);
const noIssue = () => notFound("There is no such issue.");
const noProject = () => notFound("There is no such project.");
const serverError = () =>
  apiError(500, "server_error", "Something went wrong. Try again in a moment.");

/* ---------- parsing and naming ---------- */

const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const asciiUpper = (s: string) => s.replace(/[a-z]/g, (ch) => ch.toUpperCase());

/** `EMB-12` into the project key and the number (at least 1, at most u32). */
function parseIssueKey(raw: string): [string, number] | null {
  const trimmed = raw.trim();
  const dash = trimmed.lastIndexOf("-");
  if (dash < 0) return null;
  const project = asciiUpper(trimmed.slice(0, dash));
  const digits = trimmed.slice(dash + 1);
  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(project) || !/^[0-9]+$/.test(digits)) return null;
  const n = Number(digits);
  if (!Number.isSafeInteger(n) || n < 1 || n > 4294967295) return null;
  return [project, n];
}

function hexValue(b: number): number | null {
  if (b >= 0x30 && b <= 0x39) return b - 0x30;
  if (b >= 0x61 && b <= 0x66) return b - 0x61 + 10;
  if (b >= 0x41 && b <= 0x46) return b - 0x41 + 10;
  return null;
}

/** The Worker's percent_decode (worker/src/lib.rs): `+` is a space, bad escapes pass through. */
function percentDecode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const out: number[] = [];
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i] as number;
    if (b === 0x2b) {
      out.push(0x20);
      i += 1;
    } else if (b === 0x25 && i + 2 < bytes.length) {
      const high = hexValue(bytes[i + 1] as number);
      const low = hexValue(bytes[i + 2] as number);
      if (high !== null && low !== null) {
        out.push(high * 16 + low);
        i += 3;
      } else {
        out.push(0x25);
        i += 1;
      }
    } else {
      out.push(b);
      i += 1;
    }
  }
  return new TextDecoder().decode(new Uint8Array(out));
}

/**
 * A file name safe for a header and a download: ASCII letters, digits and ` .-_()`, with the path
 * stripped. Anything else becomes `_`. An empty name becomes `attachment`.
 */
function cleanFileName(raw: string | undefined): string {
  const base = (raw ?? "").split(/[\\/]/).pop()?.trim() ?? "";
  const cleaned = Array.from(base)
    .slice(0, FILE_NAME_MAX)
    .map((c) => (/^[A-Za-z0-9]$/.test(c) || " .-_()".includes(c) ? c : "_"))
    .join("")
    .replace(/^\.+|\.+$/g, "")
    .trim();
  return cleaned === "" ? "attachment" : cleaned;
}

/**
 * A media type such as `image/png`: lower-cased ASCII without parameters. Anything else is
 * `application/octet-stream`.
 */
function mediaType(raw: string | undefined): string {
  const essence = ((raw ?? "").split(";")[0] ?? "")
    .trim()
    .replace(/[A-Z]/g, (ch) => ch.toLowerCase());
  const valid = essence.length <= 100 && /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(essence);
  return valid ? essence : "application/octet-stream";
}

const jsonText = (value: unknown): string | null =>
  value === null || value === undefined ? null : JSON.stringify(value);

/* ---------- access ---------- */

type Access = { globalAdmin: boolean; role: string | null };

/** Viewers, members and admins of the project, or a global admin, may see it (rimelight_policy). */
const canView = (a: Access) =>
  a.globalAdmin || ["viewer", "member", "admin"].includes(a.role ?? "");

/** Members and admins of the project, or a global admin, may change its issues (rimelight_policy). */
const canEdit = (a: Access) => a.globalAdmin || a.role === "admin" || a.role === "member";

/**
 * The issue of a key, with the caller's access to its project. A project the caller may not see, or
 * an issue that does not exist, is a 404 (as in project_service.rs `load_issue`).
 */
async function loadIssue(
  sql: Sql,
  userId: string,
  rawKey: string,
): Promise<{ issueId: string; issueKey: string; access: Access } | Response> {
  const parsed = parseIssueKey(rawKey);
  if (!parsed) return noIssue();
  const [projectKey, number] = parsed;
  const projects =
    await sql`SELECT p.id::text AS project_id, p.key AS project_key, m.role AS my_role
     FROM projects p
     LEFT JOIN project_members m ON m.project_id = p.id AND m.user_id = ${userId}::text::uuid AND m.deleted_at IS NULL
     WHERE p.key = ${projectKey}::text AND p.deleted_at IS NULL`;
  const project = projects[0] as Row | undefined;
  if (!project) return noProject();
  const admins =
    await sql`SELECT EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = ${userId}::text::uuid AND x.role = 'admin') AS admin`;
  const access: Access = {
    globalAdmin: admins[0]?.["admin"] === true,
    role: (project["my_role"] as string | null) ?? null,
  };
  if (!canView(access)) return noProject();
  // Rust `to_i32`: a number above i32::MAX is clamped to it before the query.
  const column = Math.min(number, 2147483647);
  const issues = await sql`SELECT i.id::text AS id, i.number FROM issues i
     WHERE i.project_id = ${project["project_id"]}::text::uuid AND i.number = ${column}::int AND i.deleted_at IS NULL`;
  const issue = issues[0] as Row | undefined;
  if (!issue) return noIssue();
  return {
    issueId: issue["id"] as string,
    issueKey: `${project["project_key"]}-${issue["number"]}`,
    access,
  };
}

/** A path id: a UUID (lower-cased), or a 404 that names the attachment. */
function attachmentId(raw: string): string | Response {
  return UUID.test(raw) ? raw.toLowerCase() : notFound(NO_ATTACHMENT);
}

/* ---------- SQL helpers ---------- */

async function activity(
  q: Q,
  issueId: string,
  actorId: string,
  kind: string,
  field: string,
  oldValue: unknown,
  newValue: unknown,
  now: number,
): Promise<void> {
  await q`INSERT INTO activity (issue_id, actor_id, kind, field, old_value, new_value, created_at, updated_at)
     VALUES (${issueId}::text::uuid, ${actorId}::text::uuid, ${kind}::text, ${field}::text,
             ${jsonText(oldValue)}::text::jsonb, ${jsonText(newValue)}::text::jsonb,
             to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))`;
}

/** The public shape of an attachment, with its download URL (`/v1/issues/{key}/attachments/{id}`). */
function attachmentView(issueKey: string, r: Row) {
  const id = r["id"] as string;
  return {
    id,
    file_name: r["file_name"] as string,
    content_type: r["content_type"] as string,
    size_bytes: Number(r["size_bytes"]),
    url: `/v1/issues/${issueKey}/attachments/${id}`,
  };
}

const nowSecs = () => Math.floor(Date.now() / 1000);

const attachments = new Hono();

/** GET /v1/issues/{key}/attachments: the live attachments, oldest first. Needs view access. */
attachments.get("/issues/:issue/attachments", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const found = await loadIssue(sql, who.id, c.req.param("issue"));
    if (isResponse(found)) return found;
    const rows = await sql`SELECT a.id::text AS id, a.file_name, a.content_type, a.size_bytes
       FROM issue_attachments a
       WHERE a.issue_id = ${found.issueId}::text::uuid AND a.deleted_at IS NULL
       ORDER BY a.created_at, a.id`;
    return json(rows.map((r) => attachmentView(found.issueKey, r as Row)));
  } catch (err) {
    console.error("space GET /issues/:issue/attachments failed", err);
    return serverError();
  }
});

/**
 * POST /v1/issues/{key}/attachments: the body is the file, `X-File-Name` names it (percent-encoded)
 * and `Content-Type` types it. At most 10 MB. Needs edit access.
 */
attachments.post("/issues/:issue/attachments", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const found = await loadIssue(sql, who.id, c.req.param("issue"));
    if (isResponse(found)) return found;
    if (!canEdit(found.access)) {
      return forbidden("Viewers can read this project but not change it.");
    }
    const bytes = await c.req.arrayBuffer();
    if (bytes.byteLength === 0) return badRequest("The upload is empty.");
    if (bytes.byteLength > ATTACHMENT_MAX_BYTES) {
      return apiError(413, "payload_too_large", "Attachments are at most 10 MB.");
    }

    const nonce = [...crypto.getRandomValues(new Uint8Array(8))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const blobKey = `attachment-${found.issueId}-${nonce}.bin`;
    const bucket = blobBucket();
    // `.bin` has no media type in the Rust store, so R2 gets application/octet-stream.
    await bucket.put(objectKey(blobKey), bytes, {
      httpMetadata: { contentType: "application/octet-stream" },
    });

    const rawName = c.req.header("X-File-Name");
    const fileName = cleanFileName(rawName === undefined ? undefined : percentDecode(rawName));
    const contentType = mediaType(c.req.header("Content-Type"));
    const size = bytes.byteLength;
    const now = nowSecs();

    let id: string;
    try {
      id = await sql.begin(async (tx) => {
        const inserted = await tx`INSERT INTO issue_attachments
             (issue_id, uploader_id, file_name, content_type, size_bytes, blob_key, created_at, updated_at)
           VALUES (${found.issueId}::text::uuid, ${who.id}::text::uuid, ${fileName}::text, ${contentType}::text,
                   ${size}::bigint, ${blobKey}::text, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
           RETURNING id::text AS id`;
        const newId = inserted[0]?.["id"] as string;
        await activity(
          tx,
          found.issueId,
          who.id,
          "field_changed",
          "attachment",
          null,
          { file_name: fileName },
          now,
        );
        return newId;
      });
    } catch (err) {
      // The row was not written, so the bytes have no owner.
      console.error("space POST /issues/:issue/attachments insert failed", err);
      await bucket.delete(objectKey(blobKey)).catch(() => undefined);
      return serverError();
    }

    return json(
      attachmentView(found.issueKey, {
        id,
        file_name: fileName,
        content_type: contentType,
        size_bytes: size,
      }),
      201,
    );
  } catch (err) {
    console.error("space POST /issues/:issue/attachments failed", err);
    return serverError();
  }
});

/** GET /v1/issues/{key}/attachments/{id}: the file's bytes with its media type. Needs view access. */
attachments.get("/issues/:issue/attachments/:attachment", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const found = await loadIssue(sql, who.id, c.req.param("issue"));
    if (isResponse(found)) return found;
    const id = attachmentId(c.req.param("attachment"));
    if (isResponse(id)) return id;
    const rows = await sql`SELECT a.blob_key, a.file_name, a.content_type FROM issue_attachments a
       WHERE a.id = ${id}::text::uuid AND a.issue_id = ${found.issueId}::text::uuid AND a.deleted_at IS NULL`;
    const file = rows[0] as Row | undefined;
    if (!file) return notFound(NO_ATTACHMENT);
    const object = await blobBucket().get(objectKey(file["blob_key"] as string));
    if (!object) return notFound(NO_ATTACHMENT);
    return new Response(await object.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": file["content_type"] as string,
        "Content-Disposition": `attachment; filename="${file["file_name"]}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("space GET /issues/:issue/attachments/:attachment failed", err);
    return serverError();
  }
});

/** DELETE /v1/issues/{key}/attachments/{id}: soft-deletes the row, then the bytes. Needs edit access. */
attachments.delete("/issues/:issue/attachments/:attachment", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const found = await loadIssue(sql, who.id, c.req.param("issue"));
    if (isResponse(found)) return found;
    if (!canEdit(found.access)) {
      return forbidden("Viewers can read this project but not change it.");
    }
    const id = attachmentId(c.req.param("attachment"));
    if (isResponse(id)) return id;
    const rows = await sql`SELECT a.blob_key FROM issue_attachments a
       WHERE a.id = ${id}::text::uuid AND a.issue_id = ${found.issueId}::text::uuid AND a.deleted_at IS NULL`;
    const file = rows[0] as Row | undefined;
    if (!file) return notFound(NO_ATTACHMENT);
    const now = nowSecs();
    const removed = await sql.begin(async (tx) => {
      const updated = await tx`UPDATE issue_attachments
         SET deleted_at = to_timestamp(${now}::bigint), updated_at = to_timestamp(${now}::bigint)
         WHERE id = ${id}::text::uuid AND issue_id = ${found.issueId}::text::uuid AND deleted_at IS NULL
         RETURNING file_name`;
      const row = updated[0] as Row | undefined;
      if (!row) return false;
      await activity(
        tx,
        found.issueId,
        who.id,
        "field_changed",
        "attachment",
        { file_name: row["file_name"] },
        null,
        now,
      );
      return true;
    });
    if (!removed) return notFound(NO_ATTACHMENT);
    // The row is gone, so a failed blob delete only leaves bytes nobody can reach.
    await blobBucket()
      .delete(objectKey(file["blob_key"] as string))
      .catch(() => undefined);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("space DELETE /issues/:issue/attachments/:attachment failed", err);
    return serverError();
  }
});

export default attachments;

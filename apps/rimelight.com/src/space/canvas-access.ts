/**
 * Access rules and shared helpers for the Rimelight Space canvas routes (CV.1, decision 0045).
 * accessLevel, atLeast and cleanTitle are pure and unit tested; the SQL helpers follow attachments.ts.
 * Type-only imports keep this file free of the database module, so the tests load no database code.
 */
import type { Context } from "hono";
import type postgres from "postgres";
import type { getDb } from "../db/index.ts";
import { DEFAULT_PROJECT_QUOTA_BYTES, DEFAULT_USER_QUOTA_BYTES } from "./canvas-image.ts";

export type Sql = ReturnType<typeof getDb>["$client"];
// biome-ignore lint/suspicious/noExplicitAny: postgres.js rows are untyped
export type Row = Record<string, any>;
export type Q = Sql | postgres.TransactionSql<{}>;

/* ---------- responses ---------- */

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const apiError = (status: number, error: string, message: string) =>
  json({ error, message }, status);
export const notFound = (message: string) => apiError(404, "not_found", message);
export const forbidden = (message: string) => apiError(403, "forbidden", message);
export const badRequest = (message: string) => apiError(400, "invalid_request", message);
export const serverError = () =>
  apiError(500, "server_error", "Something went wrong. Try again in a moment.");

const NO_CANVAS = "There is no such canvas.";
const NO_PROJECT = "There is no such project.";

/* ---------- parsing and naming ---------- */

export const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/** A path id: a UUID (lower-cased), or a 404 with the given message. */
export function uuidOr404(raw: string, message: string): string | Response {
  return UUID.test(raw) ? raw.toLowerCase() : notFound(message);
}

/** The JSON object in the request body. An empty body is {}; anything else that is not an object is null. */
export async function readBody(c: Context): Promise<Record<string, unknown> | null> {
  const text = await c.req.text().catch(() => null);
  if (text === null) return null;
  if (text.trim() === "") return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export type AccessLevel = "none" | "view" | "edit" | "manage";

export type AccessFacts = {
  userId: string;
  ownerId: string | null; // canvases.owner_id
  projectId: string | null; // canvases.project_id
  createdBy: string; // canvases.created_by
  projectRole: string | null; // caller's project_members.role ('admin'|'member'|'viewer') or null
  shareRole: string | null; // caller's canvas_shares.role ('Viewer'|'Editor') or null
  globalAdmin: boolean;
};

/**
 * What the caller may do with a canvas.
 * Project canvases: global admins and project admins manage; members manage their own canvases and edit the rest;
 * viewers view. Personal canvases are private to their owner and the people it is shared with (decision 0045),
 * so a global admin gets no access to someone else's personal canvas.
 */
export function accessLevel(f: AccessFacts): AccessLevel {
  if (f.projectId !== null) {
    if (f.globalAdmin || f.projectRole === "admin") return "manage";
    if (f.projectRole === "member") return f.createdBy === f.userId ? "manage" : "edit";
    if (f.projectRole === "viewer") return "view";
    return "none";
  }
  if (f.ownerId === f.userId) return "manage";
  if (f.shareRole === "Editor") return "edit";
  if (f.shareRole === "Viewer") return "view";
  return "none";
}

const RANK: Record<AccessLevel, number> = { none: 0, view: 1, edit: 2, manage: 3 };

/** True when `have` is at least `need`. */
export const atLeast = (have: AccessLevel, need: AccessLevel): boolean => RANK[have] >= RANK[need];

export type CanvasRow = {
  id: string;
  title: string;
  ownerId: string | null;
  projectId: string | null;
  projectKey: string | null;
  createdBy: string;
  seq: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  access: AccessLevel;
};

/** A canvas row from the canvas SELECT (see loadCanvas for the columns), with the caller's access. */
export function canvasFromRow(r: Row, userId: string): CanvasRow {
  const ownerId = (r["owner_id"] as string | null) ?? null;
  const projectId = (r["project_id"] as string | null) ?? null;
  const createdBy = r["created_by"] as string;
  return {
    id: r["id"] as string,
    title: r["title"] as string,
    ownerId,
    projectId,
    projectKey: (r["project_key"] as string | null) ?? null,
    createdBy,
    seq: Number(r["seq"]),
    createdAt: r["created_at"] as Date,
    updatedAt: r["updated_at"] as Date,
    archivedAt: (r["archived_at"] as Date | null) ?? null,
    access: accessLevel({
      userId,
      ownerId,
      projectId,
      createdBy,
      projectRole: (r["project_role"] as string | null) ?? null,
      shareRole: (r["share_role"] as string | null) ?? null,
      globalAdmin: r["global_admin"] === true,
    }),
  };
}

/**
 * The canvas with the caller's access. No row, no access, or an archived canvas (unless includeArchived) is a 404;
 * access below `need` is a 403.
 */
export async function loadCanvas(
  sql: Sql,
  userId: string,
  rawId: string,
  need: AccessLevel,
  opts: { includeArchived?: boolean } = {},
): Promise<CanvasRow | Response> {
  const id = uuidOr404(rawId, NO_CANVAS);
  if (typeof id !== "string") return id;
  const rows =
    await sql`SELECT c.id::text AS id, c.title, c.owner_id::text AS owner_id, c.project_id::text AS project_id,
       p.key AS project_key, c.created_by::text AS created_by, c.seq, c.created_at, c.updated_at, c.archived_at,
       m.role AS project_role, s.role AS share_role,
       EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = ${userId}::text::uuid AND r.role = 'admin') AS global_admin
  FROM canvases c
  LEFT JOIN projects p ON p.id = c.project_id
  LEFT JOIN project_members m ON m.project_id = c.project_id AND m.user_id = ${userId}::text::uuid AND m.deleted_at IS NULL
  LEFT JOIN canvas_shares s ON s.canvas_id = c.id AND s.user_id = ${userId}::text::uuid
 WHERE c.id = ${id}::text::uuid`;
  const row = rows[0] as Row | undefined;
  if (!row) return notFound(NO_CANVAS);
  const canvas = canvasFromRow(row, userId);
  if (canvas.access === "none") return notFound(NO_CANVAS);
  if (canvas.archivedAt !== null && !opts.includeArchived) return notFound(NO_CANVAS);
  if (!atLeast(canvas.access, need)) {
    return forbidden(
      need === "manage"
        ? "Only the canvas owner or a project admin can do that."
        : "You can view this canvas but not change it.",
    );
  }
  return canvas;
}

/**
 * The project of a key, with the caller's role in it. A missing or deleted project, or one the caller neither
 * belongs to nor administers, is a 404.
 */
export async function projectAccess(
  sql: Sql,
  userId: string,
  key: string,
): Promise<
  { projectId: string; key: string; role: string | null; globalAdmin: boolean } | Response
> {
  const wanted = key.replace(/[a-z]/g, (ch) => ch.toUpperCase());
  const rows = await sql`SELECT p.id::text AS project_id, p.key AS project_key, m.role AS my_role,
       EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = ${userId}::text::uuid AND x.role = 'admin') AS admin
  FROM projects p
  LEFT JOIN project_members m ON m.project_id = p.id AND m.user_id = ${userId}::text::uuid AND m.deleted_at IS NULL
 WHERE p.key = ${wanted}::text AND p.deleted_at IS NULL`;
  const row = rows[0] as Row | undefined;
  if (!row) return notFound(NO_PROJECT);
  const role = (row["my_role"] as string | null) ?? null;
  const globalAdmin = row["admin"] === true;
  if (role === null && !globalAdmin) return notFound(NO_PROJECT);
  return {
    projectId: row["project_id"] as string,
    key: row["project_key"] as string,
    role,
    globalAdmin,
  };
}

/* ---------- quotas ---------- */

export type QuotaScope = "User" | "Project";

/** Bytes used by the scope's live canvases, and the scope's limit (its row, or the default). */
export async function quotaUsage(
  q: Q,
  scope: QuotaScope,
  subjectId: string,
): Promise<{ usage: number; limit: number; isDefault: boolean }> {
  const used =
    scope === "User"
      ? await q`SELECT COALESCE(sum(a.bytes), 0)::bigint AS used FROM canvas_assets a
           JOIN canvases c ON c.id = a.canvas_id
          WHERE c.owner_id = ${subjectId}::text::uuid`
      : await q`SELECT COALESCE(sum(a.bytes), 0)::bigint AS used FROM canvas_assets a
           JOIN canvases c ON c.id = a.canvas_id
          WHERE c.project_id = ${subjectId}::text::uuid`;
  const limits = await q`SELECT limit_bytes FROM storage_quotas
     WHERE scope = ${scope}::text AND subject_id = ${subjectId}::text::uuid`;
  const row = limits[0] as Row | undefined;
  const fallback = scope === "User" ? DEFAULT_USER_QUOTA_BYTES : DEFAULT_PROJECT_QUOTA_BYTES;
  return {
    usage: Number(used[0]?.["used"] ?? 0),
    limit: row ? Number(row["limit_bytes"]) : fallback,
    isDefault: row === undefined,
  };
}

/** Serialises quota checks for one subject until the transaction ends. */
export async function lockQuota(tx: Q, scope: QuotaScope, subjectId: string): Promise<void> {
  await tx`SELECT pg_advisory_xact_lock(hashtext(${`quota:${scope}:${subjectId}`}::text))`;
}

/** The quota a canvas counts against: its project, or its owner. */
export const quotaScopeOf = (c: CanvasRow): [QuotaScope, string] =>
  c.projectId ? ["Project", c.projectId] : ["User", c.ownerId as string];

/* ---------- views ---------- */

export function canvasView(c: CanvasRow) {
  return {
    id: c.id,
    title: c.title,
    home: c.projectId ? "project" : "personal",
    owner_id: c.ownerId,
    project_key: c.projectKey,
    created_by: c.createdBy,
    seq: c.seq,
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
    archived: c.archivedAt !== null,
    my_access: c.access,
  };
}

/** The public shape of a canvas asset, with its URL. `r` is a canvas_assets row. */
export function assetView(canvasId: string, r: Row) {
  const id = r["id"] as string;
  return {
    id,
    sha256: r["sha256"] as string,
    mime: r["mime"] as string,
    bytes: Number(r["bytes"]),
    width: Number(r["width"]),
    height: Number(r["height"]),
    frame_count: Number(r["frame_count"]),
    file_name: r["file_name"] as string,
    source_url: r["source_url"] as string,
    thumbs: Object.keys(r["thumb_keys"] ?? {})
      .map(Number)
      .sort((a, b) => a - b),
    url: `/v1/canvases/${canvasId}/assets/${id}`,
    created_at: (r["created_at"] as Date).toISOString(),
  };
}

/* ---------- names ---------- */

const TITLE_MAX = 200;
const FILE_NAME_MAX = 255;

/**
 * A canvas title: missing gives "Untitled canvas"; text is trimmed and must be 1 to 200 characters.
 * Anything else is null (the caller answers 400).
 */
export function cleanTitle(raw: unknown): string | null {
  if (raw === undefined || raw === null) return "Untitled canvas";
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const length = [...trimmed].length;
  return length >= 1 && length <= TITLE_MAX ? trimmed : null;
}

function hexValue(b: number): number | null {
  if (b >= 0x30 && b <= 0x39) return b - 0x30;
  if (b >= 0x61 && b <= 0x66) return b - 0x61 + 10;
  if (b >= 0x41 && b <= 0x46) return b - 0x41 + 10;
  return null;
}

/** The Worker's percent_decode (worker/src/lib.rs): `+` is a space, bad escapes pass through. */
export function percentDecode(input: string): string {
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
export function cleanFileName(raw: string | undefined): string {
  const base = (raw ?? "").split(/[\\/]/).pop()?.trim() ?? "";
  const cleaned = [...base]
    .slice(0, FILE_NAME_MAX)
    .map((c) => (/^[A-Za-z0-9]$/.test(c) || " .-_()".includes(c) ? c : "_"))
    .join("")
    .replace(/^\.+|\.+$/g, "")
    .trim();
  return cleaned === "" ? "attachment" : cleaned;
}

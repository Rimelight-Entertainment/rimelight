/**
 * Rimelight Space project write routes on the website Worker (port of project_service.rs write paths and
 * the write SQL in pg_projects.rs, plus backlog_rank.rs). Mounted under /v1 by the Space API.
 *
 * Not ported yet: attachments (upload, download and delete need R2 blob storage).
 *
 * Access follows rimelight_policy: a non-member gets 404 on a project (and its issues); viewers get 403 on writes;
 * project writes need a project admin or global admin; issue, comment, link, sprint and backlog writes need a
 * member (or global admin); comment edits are for the author (with edit rights) or a project or global admin.
 */
import type { Context } from "hono";
import { Hono } from "hono";
import type postgres from "postgres";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";
import { requireKnownAreas } from "./areas.ts";

export type Db = ReturnType<typeof getDb>["$client"];
type Q = Db | postgres.TransactionSql<{}>;
// biome-ignore lint/suspicious/noExplicitAny: postgres.js rows are untyped
type Row = Record<string, any>;

export const NAME_MAX = 120;
const STATE_NAME_MAX = 60;
const GOAL_MAX = 2000;
export const TEXT_MAX = 2000;
const SUMMARY_MAX = 255;
const DESCRIPTION_MAX = 20000;
const COMMENT_MAX = 10000;
const TAG_MAX = 40;
const TAGS_MAX = 20;
const WORK_MINUTES_MAX = 100000;
const U32_MAX = 4294967295;
const I32_MAX = 2147483647;

const PROJECT_ROLES = ["admin", "member", "viewer"];
const STATE_CATEGORIES = ["Unstarted", "Started", "Done", "Cancelled"];
const ISSUE_TYPES = ["Task", "Bug", "Feature", "Epic"];
const PRIORITIES = ["Critical", "High", "Normal", "Low"];
const LINK_KINDS = ["relates", "blocks", "duplicates"];
const SPRINT_STATES = ["Planned", "Active", "Closed"];

/* ---------- errors ---------- */

/** A request failure with its status and `{ error, message }` body. */
class Fail {
  constructor(
    readonly status: number,
    readonly body: { error: string; message: string },
  ) {}
}

/** A unique or foreign-key violation from a write. Mapped to a named 409 by `withConflict`. */
class Conflict extends Error {}

const fail = (status: number, error: string, message: string) =>
  new Fail(status, { error, message });
const notFound = (message: string) => fail(404, "not_found", message);
export const invalid = (field: string, message: string) =>
  fail(422, "invalid_field", `${field}: ${message}`);
const badRequest = (message = "The request body is not valid.") =>
  fail(400, "invalid_request", message);
const forbidden = (message: string) => fail(403, "forbidden", message);
const conflict = (code: string, message: string) => fail(409, code, message);
const noProject = () => notFound("There is no such project.");
const noIssue = () => notFound("There is no such issue.");

const serverError = () =>
  Response.json(
    { error: "server_error", message: "Something went wrong. Try again in a moment." },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );

/** Runs a route body. A `Fail` becomes its status and body; anything else is a logged 500. */
export function handle(run: (c: Context) => Promise<Response>) {
  return async (c: Context): Promise<Response> => {
    try {
      return await run(c);
    } catch (err) {
      if (err instanceof Fail) return Response.json(err.body, { status: err.status });
      console.error("space projects write failed", err);
      return serverError();
    }
  };
}

/** Maps a `Conflict` (or a raw unique or foreign-key violation) from `run` to a named 409. */
export async function withConflict<T>(
  code: string,
  message: string,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof Conflict || pgConflict(err)) throw conflict(code, message);
    throw err;
  }
}

function pgConflict(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return code === "23505" || code === "23503";
}

/* ---------- request body ---------- */

type Body = Record<string, unknown>;

/** The JSON object of the body. Non-objects and unknown fields are a 400, as serde's deny_unknown_fields. */
export async function readBody(c: Context, allowed: string[]): Promise<Body> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw badRequest();
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw badRequest();
  const body = raw as Body;
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) throw badRequest();
  }
  return body;
}

/** An optional string. Absent and null are `undefined`; any other type is a 400. */
export function optStr(body: Body, key: string): string | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") throw badRequest();
  return v;
}

export function reqStr(body: Body, key: string): string {
  const v = optStr(body, key);
  if (v === undefined) throw badRequest();
  return v;
}

function intIn(v: unknown, min: number, max: number): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw badRequest();
  return v;
}

function optInt(body: Body, key: string, min: number, max: number): number | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  return intIn(v, min, max);
}

function reqInt(body: Body, key: string, min: number, max: number): number {
  const v = body[key];
  if (v === undefined || v === null) throw badRequest();
  return intIn(v, min, max);
}

function optStrs(body: Body, key: string): string[] | undefined {
  const v = body[key];
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || !v.every((t) => typeof t === "string")) throw badRequest();
  return v as string[];
}

/* ---------- validation helpers ---------- */

export const asciiUpper = (s: string) => s.replace(/[a-z]/g, (ch) => ch.toUpperCase());
const charCount = (s: string) => Array.from(s).length;
/** A route parameter; the router always supplies it. */
const param = (c: Context, name: string): string => c.req.param(name) ?? "";
export const nowSecs = () => Math.floor(Date.now() / 1000);

/** `EMB`, `EMB2`: 2 to 10 characters, a capital letter first, then capitals or digits. */
export const validProjectKey = (key: string) => /^[A-Z][A-Z0-9]{1,9}$/.test(key);

const isUuid = (value: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);

/** `YYYY-MM-DD` with a real calendar day. */
function isIsoDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return false;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
  return day >= 1 && day <= days;
}

/** `EMB-12` into the project key and the number (at least 1). */
function parseIssueKey(raw: string): [string, number] | null {
  const trimmed = raw.trim();
  const dash = trimmed.lastIndexOf("-");
  if (dash < 0) return null;
  const project = asciiUpper(trimmed.slice(0, dash));
  const digits = trimmed.slice(dash + 1);
  if (!validProjectKey(project) || !/^[0-9]+$/.test(digits)) return null;
  const n = Number(digits);
  if (!Number.isSafeInteger(n) || n < 1 || n > U32_MAX) return null;
  return [project, n];
}

/** A UUID from a body or query value, lower case, or a 422 naming the field. */
function idArg(field: string, raw: string): string {
  const trimmed = raw.trim();
  if (!isUuid(trimmed)) throw invalid(field, "is not a valid id");
  return trimmed.toLowerCase();
}

/** A UUID path value, lower case, or a 404 that names the thing. */
function pathId(raw: string, what: string): string {
  if (!isUuid(raw)) throw notFound(`There is no such ${what}.`);
  return raw.toLowerCase();
}

/** Trimmed text within `max` characters. Empty is kept (it means "clear" in a patch). */
export function textField(
  field: string,
  value: string | undefined,
  max: number,
): string | undefined {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (charCount(v) > max) throw invalid(field, `at most ${max} characters`);
  return v;
}

/** A required trimmed text field within `max` characters. */
export function requiredField(field: string, value: string | undefined, max: number): string {
  const v = (value ?? "").trim();
  if (v === "") throw invalid(field, "is required");
  if (charCount(v) > max) throw invalid(field, `at most ${max} characters`);
  return v;
}

/** `YYYY-MM-DD`, or the empty string which clears a nullable date (returned as `null`). */
function optionalDate(field: string, raw: string | undefined): string | null | undefined {
  if (raw === undefined) return undefined;
  const v = raw.trim();
  if (v === "") return null;
  if (isIsoDate(v)) return v;
  throw invalid(field, "use the form YYYY-MM-DD");
}

/** The canonical (capitalised) spelling of a choice, matched without regard to case; refuses anything else. */
function checkIn(field: string, value: string, allowed: string[]): string {
  const match = allowed.find((a) => a.toLowerCase() === value.toLowerCase());
  if (match === undefined) throw invalid(field, `use one of: ${allowed.join(", ")}`);
  return match;
}

/** Validated tags: trimmed, no empties, no repeats, each at most TAG_MAX characters, at most TAGS_MAX in all. */
function cleanTags(raw: string[]): string[] {
  const out: string[] = [];
  for (const item of raw) {
    const tag = item.trim();
    if (tag === "" || out.includes(tag)) continue;
    if (charCount(tag) > TAG_MAX)
      throw invalid("tags", `each tag is at most ${TAG_MAX} characters`);
    out.push(tag);
  }
  if (out.length > TAGS_MAX) throw invalid("tags", `at most ${TAGS_MAX} tags`);
  return out;
}

function pushChange(
  changes: { field: string; old: unknown; new: unknown }[],
  field: string,
  oldValue: unknown,
  newValue: unknown,
): void {
  if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
    changes.push({ field, old: oldValue, new: newValue });
  }
}

const jsonText = (value: unknown): string | null =>
  value === null || value === undefined ? null : JSON.stringify(value);

/* ---------- access ---------- */

type Access = { globalAdmin: boolean; role: string | null };

const canView = (a: Access) => a.globalAdmin || PROJECT_ROLES.includes(a.role ?? "");
const canEdit = (a: Access) => a.globalAdmin || a.role === "admin" || a.role === "member";
const canManage = (a: Access) => a.globalAdmin || a.role === "admin";

function requireEdit(a: Access): void {
  if (!canEdit(a)) throw forbidden("Viewers can read this project but not change it.");
}

export function requireManage(a: Access): void {
  if (!canManage(a)) throw forbidden("Only project admins can change this.");
}

async function isAdmin(sql: Db, userId: string): Promise<boolean> {
  const rows =
    await sql`SELECT EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = ${userId}::text::uuid AND x.role = 'admin') AS admin`;
  return rows[0]?.["admin"] === true;
}

/* ---------- reads shared by the write replies ---------- */

type Caller = { id: string; email: string; display_name: string; auth0_sub: string | null };

async function workflowOf(sql: Db, projectId: string) {
  const rows = await sql`SELECT id::text AS id, name, category, position FROM workflow_states
     WHERE project_id = ${projectId}::text::uuid AND deleted_at IS NULL ORDER BY position, name`;
  return rows.map((r) => ({
    id: r["id"],
    name: r["name"],
    category: r["category"],
    position: Number(r["position"]),
  }));
}

async function membersOf(sql: Db, projectId: string) {
  const rows = await sql`SELECT u.id::text AS id, u.name, m.role FROM project_members m
     JOIN employees u ON u.id = m.user_id
     WHERE m.project_id = ${projectId}::text::uuid AND m.deleted_at IS NULL
     ORDER BY lower(u.name), u.id::text`;
  return rows.map((r) => ({ user: { id: r["id"], display_name: r["name"] }, role: r["role"] }));
}

/** The project with its workflow and members, as seen by `viewerId`. `null` when there is no such key. */
export async function projectRow(sql: Db, key: string, viewerId: string) {
  const rows = await sql`SELECT p.id::text AS id, p.key, p.name, p.description,
       p.lead_id::text AS lead_id, lu.name AS lead_name, m.role AS my_role, p.image_key
     FROM projects p
     LEFT JOIN employees lu ON lu.id = p.lead_id
     LEFT JOIN project_members m ON m.project_id = p.id AND m.user_id = ${viewerId}::text::uuid AND m.deleted_at IS NULL
     WHERE p.key = ${key}::text AND p.deleted_at IS NULL`;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row["id"] as string,
    key: row["key"] as string,
    name: row["name"] as string,
    description: row["description"] as string,
    lead: row["lead_id"]
      ? { id: row["lead_id"] as string, display_name: (row["lead_name"] as string | null) ?? "" }
      : null,
    my_role: (row["my_role"] as string | null) ?? null,
    image_url: row["image_key"] ? `/v1/projects/${row["key"]}/image` : null,
    workflow: await workflowOf(sql, row["id"]),
    members: await membersOf(sql, row["id"]),
  };
}

type ProjectView = NonNullable<Awaited<ReturnType<typeof projectRow>>>;

/** A project the caller may see, with their access. Anything else is a 404. */
export async function loadProject(
  sql: Db,
  me: Caller,
  rawKey: string,
): Promise<{ project: ProjectView; access: Access }> {
  const key = asciiUpper(rawKey.trim());
  if (!validProjectKey(key)) throw noProject();
  const project = await projectRow(sql, key, me.id);
  if (!project) throw noProject();
  const access: Access = { globalAdmin: await isAdmin(sql, me.id), role: project.my_role };
  if (!canView(access)) throw noProject();
  return { project, access };
}

const ISSUE_COLS = `i.id::text AS id, p.key AS project_key, i.number, i.summary, i.description, i.type, i.priority,
  ws.id::text AS state_id, ws.name AS state_name, ws.category AS state_category, ws.position AS state_position,
  a.id::text AS assignee_id, a.name AS assignee_name, r.id::text AS reporter_id, r.name AS reporter_name,
  i.parent_id::text AS parent_id, i.sprint_id::text AS sprint_id, sp.name AS sprint_name, sp.state AS sprint_state,
  i.estimate_points, i.due_date::text AS due_date, i.tags, i.backlog_rank,
  EXTRACT(EPOCH FROM i.created_at)::bigint AS created_at, EXTRACT(EPOCH FROM i.updated_at)::bigint AS updated_at,
  EXTRACT(EPOCH FROM i.resolved_at)::bigint AS resolved_at,
  ub.id::text AS updated_by_id, ub.name AS updated_by_name`;

const ISSUE_JOINS = `JOIN projects p ON p.id = i.project_id
  JOIN workflow_states ws ON ws.id = i.state_id
  LEFT JOIN employees a ON a.id = i.assignee_id
  JOIN employees r ON r.id = i.reporter_id
  LEFT JOIN sprints sp ON sp.id = i.sprint_id
  LEFT JOIN employees ub ON ub.id = i.updated_by`;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function issueRows(sql: Db, clause: string, params: any[], order = ""): Promise<Row[]> {
  return [
    ...(await sql.unsafe(
      `SELECT ${ISSUE_COLS} FROM issues i ${ISSUE_JOINS} WHERE ${clause} AND i.deleted_at IS NULL ${order}`,
      params,
    )),
  ];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function summaryOf(r: Row) {
  return {
    id: r["id"] as string,
    key: `${r["project_key"]}-${Number(r["number"])}`,
    summary: r["summary"] as string,
    type: r["type"] as string,
    priority: r["priority"] as string,
    state: {
      id: r["state_id"] as string,
      name: r["state_name"] as string,
      category: r["state_category"] as string,
      position: Number(r["state_position"]),
    },
    assignee: r["assignee_id"]
      ? { id: r["assignee_id"] as string, display_name: (r["assignee_name"] as string) ?? "" }
      : null,
    parent_id: (r["parent_id"] as string | null) ?? null,
    sprint_id: (r["sprint_id"] as string | null) ?? null,
    estimate_points: r["estimate_points"] == null ? null : Number(r["estimate_points"]),
    due_date: (r["due_date"] as string | null) ?? null,
    tags: (r["tags"] as string[] | null) ?? [],
    backlog_rank: r["backlog_rank"] as string,
    updated_at: Number(r["updated_at"]),
  };
}

function linkView(kind: string, outward: boolean): { direction: string; label: string } {
  const direction = outward ? "outward" : "inward";
  let label = "relates to";
  if (kind === "blocks") label = outward ? "blocks" : "is blocked by";
  else if (kind === "duplicates") label = outward ? "duplicates" : "is duplicated by";
  return { direction, label };
}

/** The issue by project id and number, as the stored fields plus parent, subtasks and links. */
async function findIssue(sql: Db, projectId: string, number: number) {
  const rows = await issueRows(sql, "i.project_id = $1::text::uuid AND i.number = $2::int", [
    projectId,
    number,
  ]);
  const r = rows[0];
  if (!r) return null;
  const id = r["id"] as string;

  let parent = null;
  if (r["parent_id"]) {
    const p = await issueRows(sql, "i.id = $1::text::uuid", [r["parent_id"]]);
    parent = p[0] ? summaryOf(p[0]) : null;
  }
  const subs = await issueRows(sql, "i.parent_id = $1::text::uuid", [id], "ORDER BY i.number");
  const linkRows: Row[] = [
    ...(await sql.unsafe(
      `SELECT l.id::text AS link_id, (l.source_id = $1::text::uuid) AS outward, l.kind, ${ISSUE_COLS}
       FROM issue_links l
       JOIN issues i ON i.id = CASE WHEN l.source_id = $1::text::uuid THEN l.target_id ELSE l.source_id END
       ${ISSUE_JOINS}
       WHERE (l.source_id = $1::text::uuid OR l.target_id = $1::text::uuid)
         AND l.deleted_at IS NULL AND i.deleted_at IS NULL
       ORDER BY l.created_at, l.id`,
      [id],
    )),
  ];
  const links = linkRows.map((row) => {
    const view = linkView(row["kind"] as string, row["outward"] === true);
    return {
      id: row["link_id"] as string,
      kind: row["kind"] as string,
      direction: view.direction,
      label: view.label,
      issue: summaryOf(row),
    };
  });

  return {
    id,
    key: `${r["project_key"]}-${Number(r["number"])}`,
    summary: r["summary"] as string,
    description: r["description"] as string,
    type: r["type"] as string,
    priority: r["priority"] as string,
    state: summaryOf(r).state,
    assignee: summaryOf(r).assignee,
    reporter: { id: r["reporter_id"] as string, display_name: r["reporter_name"] as string },
    parent,
    subtasks: subs.map(summaryOf),
    links,
    sprint: r["sprint_id"]
      ? {
          id: r["sprint_id"] as string,
          name: (r["sprint_name"] as string) ?? "",
          state: (r["sprint_state"] as string) ?? "",
        }
      : null,
    estimate_points: r["estimate_points"] == null ? null : Number(r["estimate_points"]),
    due_date: (r["due_date"] as string | null) ?? null,
    tags: (r["tags"] as string[] | null) ?? [],
    backlog_rank: r["backlog_rank"] as string,
    created_at: Number(r["created_at"]),
    updated_at: Number(r["updated_at"]),
    resolved_at: r["resolved_at"] == null ? null : Number(r["resolved_at"]),
    updated_by: r["updated_by_id"]
      ? { id: r["updated_by_id"] as string, display_name: (r["updated_by_name"] as string) ?? "" }
      : null,
    votes: 0,
    voted_by_me: false,
    starred_by_me: false,
    spent_minutes: 0,
    attachments: [] as {
      id: string;
      file_name: string;
      content_type: string;
      size_bytes: number;
      url: string;
    }[],
  };
}

type IssueView = NonNullable<Awaited<ReturnType<typeof findIssue>>>;

/** Adds the caller's votes, stars, spent time and the attachment list (attachment URLs included). */
async function viewIssue(sql: Db, issue: IssueView, viewerId: string): Promise<IssueView> {
  const social = await socialOf(sql, issue.id, viewerId);
  const atts =
    await sql`SELECT a.id::text AS id, a.file_name, a.content_type, a.size_bytes FROM issue_attachments a
     WHERE a.issue_id = ${issue.id}::text::uuid AND a.deleted_at IS NULL ORDER BY a.created_at, a.id`;
  return {
    ...issue,
    votes: social.votes,
    voted_by_me: social.voted_by_me,
    starred_by_me: social.starred_by_me,
    spent_minutes: social.spent_minutes,
    attachments: atts.map((a) => ({
      id: a["id"] as string,
      file_name: a["file_name"] as string,
      content_type: a["content_type"] as string,
      size_bytes: Number(a["size_bytes"]),
      url: `/v1/issues/${issue.key}/attachments/${a["id"]}`,
    })),
  };
}

async function socialOf(sql: Db, issueId: string, viewerId: string) {
  const rows = await sql`SELECT
      (SELECT count(*)::int FROM issue_votes v WHERE v.issue_id = ${issueId}::text::uuid) AS votes,
      EXISTS (SELECT 1 FROM issue_votes v WHERE v.issue_id = ${issueId}::text::uuid AND v.user_id = ${viewerId}::text::uuid) AS voted_by_me,
      EXISTS (SELECT 1 FROM issue_stars s WHERE s.issue_id = ${issueId}::text::uuid AND s.user_id = ${viewerId}::text::uuid) AS starred_by_me,
      (SELECT COALESCE(sum(w.minutes), 0)::bigint FROM issue_work_items w
         WHERE w.issue_id = ${issueId}::text::uuid AND w.deleted_at IS NULL) AS spent`;
  const r = rows[0];
  return {
    votes: Number(r?.["votes"] ?? 0),
    voted_by_me: r?.["voted_by_me"] === true,
    starred_by_me: r?.["starred_by_me"] === true,
    spent_minutes: Number(r?.["spent"] ?? 0),
  };
}

/** Reads an issue again after a write, as `viewerId` sees it. */
async function reloadIssue(sql: Db, viewerId: string, projectId: string, number: number) {
  const issue = await findIssue(sql, projectId, number);
  if (!issue) throw noIssue();
  return viewIssue(sql, issue, viewerId);
}

/** The issue of a key, after the project check. `null` when the project or the issue is not visible. */
async function loadIssue(sql: Db, me: Caller, rawKey: string) {
  const parsed = parseIssueKey(rawKey);
  if (!parsed) throw noIssue();
  const loaded = await loadProject(sql, me, parsed[0]);
  const issue = await findIssue(sql, loaded.project.id, parsed[1]);
  if (!issue) throw noIssue();
  return { loaded, issue };
}

export async function activePerson(sql: Db, field: string, raw: string): Promise<string> {
  const id = idArg(field, raw);
  const rows =
    await sql`SELECT u.is_active FROM employees u WHERE u.id = ${id}::text::uuid AND u.deleted_at IS NULL`;
  if (!rows[0] || rows[0]["is_active"] !== true) throw invalid(field, "is not an active person");
  return id;
}

async function memberId(sql: Db, projectId: string, field: string, raw: string): Promise<string> {
  const id = idArg(field, raw);
  const members = await membersOf(sql, projectId);
  if (!members.some((m) => m.user.id === id))
    throw invalid(field, "is not a member of this project");
  return id;
}

async function sprintIdIn(sql: Db, projectId: string, field: string, raw: string): Promise<string> {
  const id = idArg(field, raw);
  const rows =
    await sql`SELECT id::text AS id FROM sprints WHERE project_id = ${projectId}::text::uuid AND deleted_at IS NULL AND id = ${id}::text::uuid`;
  if (rows.length === 0) throw invalid(field, "is not a sprint in this project");
  return id;
}

function stateIn(workflow: { id: string }[], field: string, raw: string): string {
  const id = idArg(field, raw);
  if (!workflow.some((s) => s.id === id))
    throw invalid(field, "is not a workflow state of this project");
  return id;
}

/** The issue id and number of a key that must name an issue in this project. */
async function issueInProject(
  sql: Db,
  projectId: string,
  projectKey: string,
  field: string,
  raw: string,
): Promise<[string, number]> {
  const parsed = parseIssueKey(raw);
  if (!parsed) throw invalid(field, "use an issue key such as EMB-12");
  const [key, number] = parsed;
  if (key !== projectKey) throw invalid(field, "is an issue in another project");
  const rows = await sql`SELECT id::text AS id FROM issues i
     WHERE i.project_id = ${projectId}::text::uuid AND i.number = ${number}::int AND i.deleted_at IS NULL`;
  if (!rows[0]) throw invalid(field, "is not an issue in this project");
  return [rows[0]["id"] as string, number];
}

/** The issue ids from `id` up to its root, itself first. `null` when the issue is not in the project. */
async function parentChain(sql: Db, projectId: string, issueId: string): Promise<string[] | null> {
  const rows = await sql`WITH RECURSIVE chain (id, parent_id, depth) AS (
       SELECT i.id, i.parent_id, 0 FROM issues i
       WHERE i.id = ${issueId}::text::uuid AND i.project_id = ${projectId}::text::uuid AND i.deleted_at IS NULL
       UNION ALL
       SELECT p.id, p.parent_id, c.depth + 1 FROM chain c
       JOIN issues p ON p.id = c.parent_id
       WHERE p.deleted_at IS NULL AND c.depth < 64)
     SELECT id::text AS id FROM chain ORDER BY depth`;
  if (rows.length === 0) return null;
  return rows.map((r) => r["id"] as string);
}

async function activity(
  q: Q,
  issueId: string,
  actorId: string | null,
  kind: string,
  field: string | null,
  oldValue: unknown,
  newValue: unknown,
  now: number,
): Promise<void> {
  await q`INSERT INTO activity (issue_id, actor_id, kind, field, old_value, new_value, created_at, updated_at)
     VALUES (${issueId}::text::uuid, ${actorId}::text::uuid, ${kind}::text, ${field}::text,
             ${jsonText(oldValue)}::text::jsonb, ${jsonText(newValue)}::text::jsonb,
             to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))`;
}

/* ---------- backlog rank (port of backlog_rank.rs `between`) ---------- */

const RANK_DIGITS = "0123456789abcdef";
const RANK_MAX_EXTRA = 64;

function rankDigits(rank: string): number[] {
  return Array.from(rank, (ch) => RANK_DIGITS.indexOf(ch));
}

/** `digits` as an integer slot followed by `fraction` digits, zero padded on the right. */
function rankPadded(digits: number[], fraction: number): number[] {
  const out = Array.from({ length: fraction + 1 }, () => 0);
  digits.slice(0, fraction).forEach((d, i) => {
    out[i + 1] = d;
  });
  return out;
}

function rankCompare(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return (a[i] ?? 0) < (b[i] ?? 0) ? -1 : 1;
  }
  return 0;
}

/** (a + b) / 2 for base-16 numbers of equal length. */
function rankMidpoint(a: number[], b: number[]): number[] {
  const len = a.length;
  const sum = Array.from({ length: len }, () => 0);
  let carry = 0;
  for (let i = len - 1; i >= 0; i--) {
    const s = (a[i] ?? 0) + (b[i] ?? 0) + carry;
    sum[i] = s % 16;
    carry = Math.floor(s / 16);
  }
  sum[0] = (sum[0] ?? 0) + carry;
  const out = Array.from({ length: len }, () => 0);
  let remainder = 0;
  for (let i = 0; i < len; i++) {
    const current = remainder * 16 + (sum[i] ?? 0);
    out[i] = Math.floor(current / 2);
    remainder = current % 2;
  }
  return out;
}

function rankRender(number: number[]): string {
  const fraction = number.slice(1);
  let end = 0;
  fraction.forEach((d, i) => {
    if (d !== 0) end = i + 1;
  });
  return fraction
    .slice(0, end)
    .map((d) => RANK_DIGITS[d])
    .join("");
}

/** A rank strictly between `lower` and `upper` (null is the end). `null` when there is none. */
export function betweenRanks(lower: string | null, upper: string | null): string | null {
  const valid = (r: string) =>
    r.length > 0 && Array.from(r).every((ch) => RANK_DIGITS.includes(ch));
  if ((lower !== null && !valid(lower)) || (upper !== null && !valid(upper))) return null;
  const lowerDigits = lower === null ? [] : rankDigits(lower);
  const upperDigits = upper === null ? null : rankDigits(upper);
  const longest = Math.max(lowerDigits.length, upperDigits ? upperDigits.length : 0);
  for (let extra = 0; extra <= RANK_MAX_EXTRA; extra++) {
    const width = longest + 1 + extra;
    const lo = rankPadded(lowerDigits, width);
    let hi: number[];
    if (upperDigits) {
      hi = rankPadded(upperDigits, width);
    } else {
      // The largest rank is 1.0: integer part 1, fraction all zero.
      hi = Array.from({ length: width + 1 }, () => 0);
      hi[0] = 1;
    }
    if (rankCompare(lo, hi) >= 0) return null;
    const mid = rankMidpoint(lo, hi);
    if (rankCompare(lo, mid) < 0 && rankCompare(mid, hi) < 0) return rankRender(mid);
  }
  return null;
}

/* ---------- write helpers ---------- */

async function toggleSocial(
  sql: Db,
  table: "issue_votes" | "issue_stars",
  field: "vote" | "star",
  issueId: string,
  userId: string,
  on: boolean,
  now: number,
): Promise<void> {
  await sql.begin(async (tx) => {
    let changed: number;
    if (on) {
      const r = await tx.unsafe(
        `INSERT INTO ${table} (issue_id, user_id, created_at) VALUES ($1::text::uuid, $2::text::uuid, to_timestamp($3::bigint))
         ON CONFLICT DO NOTHING`,
        [issueId, userId, now],
      );
      changed = r.count;
    } else {
      const r = await tx.unsafe(
        `DELETE FROM ${table} WHERE issue_id = $1::text::uuid AND user_id = $2::text::uuid`,
        [issueId, userId],
      );
      changed = r.count;
    }
    if (changed > 0) {
      await activity(tx, issueId, userId, "field_changed", field, !on, on, now);
    }
  });
}

/* ---------- projects ---------- */

async function updateProject(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireManage(access);
  const body = await readBody(c, ["name", "description", "lead_id", "key"]);
  const nameRaw = optStr(body, "name");
  const descRaw = optStr(body, "description");
  const leadRaw = optStr(body, "lead_id");
  const keyRaw = optStr(body, "key");

  const name = nameRaw === undefined ? null : requiredField("name", nameRaw, NAME_MAX);
  const description = textField("description", descRaw, TEXT_MAX) ?? null;
  let setLead = false;
  let leadId: string | null = null;
  if (leadRaw !== undefined) {
    setLead = true;
    leadId = leadRaw.trim() === "" ? null : await activePerson(sql, "lead_id", leadRaw);
  }
  let newKey: string | null = null;
  if (keyRaw !== undefined) {
    const candidate = asciiUpper(keyRaw.trim());
    if (!validProjectKey(candidate)) {
      throw invalid("key", "use 2 to 10 letters or digits, starting with a letter");
    }
    newKey = candidate;
  }
  const changed = await withConflict(
    "project_key_taken",
    "Another project already uses this key.",
    () => sql`UPDATE projects SET
       name = COALESCE(${name}::text, name),
       description = COALESCE(${description}::text, description),
       lead_id = CASE WHEN ${setLead}::bool THEN ${leadId}::text::uuid ELSE lead_id END,
       key = COALESCE(${newKey}::text, key),
       updated_at = to_timestamp(${now}::bigint)
     WHERE id = ${project.id}::text::uuid AND deleted_at IS NULL`,
  );
  if (changed.count !== 1) throw noProject();
  const updated = await projectRow(sql, newKey ?? project.key, who.id);
  if (!updated) throw noProject();
  return Response.json(updated, { status: 200 });
}

async function setMember(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireManage(access);
  const body = await readBody(c, ["role"]);
  const role = checkIn("role", reqStr(body, "role"), PROJECT_ROLES);
  const userId = await activePerson(sql, "user_id", param(c, "user"));
  await sql`INSERT INTO project_members (project_id, user_id, role, created_at, updated_at)
     VALUES (${project.id}::text::uuid, ${userId}::text::uuid, ${role}::text, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
     ON CONFLICT (project_id, user_id) DO UPDATE SET
       role = EXCLUDED.role, deleted_at = NULL, updated_at = EXCLUDED.updated_at`;
  const member = (await membersOf(sql, project.id)).find((m) => m.user.id === userId);
  if (!member) throw noProject();
  return Response.json(member, { status: 200 });
}

async function removeMember(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireManage(access);
  const userId = pathId(param(c, "user"), "member");
  const memberRows =
    await sql`SELECT EXISTS (SELECT 1 FROM project_members WHERE project_id = ${project.id}::text::uuid
     AND user_id = ${userId}::text::uuid AND deleted_at IS NULL) AS member`;
  if (memberRows[0]?.["member"] !== true) throw notFound("There is no such member.");
  const openRows =
    await sql`SELECT EXISTS (SELECT 1 FROM issues i JOIN workflow_states s ON s.id = i.state_id
     WHERE i.project_id = ${project.id}::text::uuid AND i.assignee_id = ${userId}::text::uuid
       AND i.deleted_at IS NULL AND s.category NOT IN ('Done', 'Cancelled')) AS open`;
  if (openRows[0]?.["open"] === true) {
    throw conflict(
      "member_has_open_issues",
      "This person still has open issues in the project. Reassign them first.",
    );
  }
  await sql`UPDATE project_members SET deleted_at = to_timestamp(${now}::bigint), updated_at = to_timestamp(${now}::bigint)
     WHERE project_id = ${project.id}::text::uuid AND user_id = ${userId}::text::uuid AND deleted_at IS NULL`;
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/* ---------- workflow ---------- */

async function createState(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireManage(access);
  const body = await readBody(c, ["name", "category", "position"]);
  const name = reqStr(body, "name");
  const category = checkIn("category", reqStr(body, "category"), STATE_CATEGORIES);
  const position = optInt(body, "position", -I32_MAX, I32_MAX);

  const stateName = requiredField("name", name, STATE_NAME_MAX);
  const states = await workflowOf(sql, project.id);
  let pos: number;
  if (position !== undefined && position < 1) throw invalid("position", "is at least 1");
  if (position !== undefined) pos = position;
  else pos = states.reduce((max, s) => Math.max(max, s.position), 0) + 1;

  const created = await withConflict(
    "state_name_taken",
    "A state with this name already exists in the project.",
    async () => {
      const rows =
        await sql`INSERT INTO workflow_states (project_id, name, category, position, created_at, updated_at)
       VALUES (${project.id}::text::uuid, ${stateName}::text, ${category}::text, ${pos}::int,
               to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
       RETURNING id::text AS id, name, category, position`;
      const r = rows[0];
      if (!r) throw new Error("state vanished after create");
      return {
        id: r["id"] as string,
        name: r["name"] as string,
        category: r["category"] as string,
        position: Number(r["position"]),
      };
    },
  );
  return Response.json(created, { status: 201 });
}

async function updateState(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireManage(access);
  const stateId = pathId(param(c, "state"), "state");
  const body = await readBody(c, ["name", "category", "position"]);
  const nameRaw = optStr(body, "name");
  const categoryRaw = optStr(body, "category");
  const position = optInt(body, "position", -I32_MAX, I32_MAX);

  const workflow = await workflowOf(sql, project.id);
  const current = workflow.find((s) => s.id === stateId);
  if (!current) throw notFound("There is no such state.");
  const name = nameRaw === undefined ? null : requiredField("name", nameRaw, STATE_NAME_MAX);
  const category =
    categoryRaw === undefined ? undefined : checkIn("category", categoryRaw, STATE_CATEGORIES);
  if (category !== undefined) {
    const unstarted = workflow.filter((s) => s.category === "Unstarted").length;
    if (current.category === "Unstarted" && category !== "Unstarted" && unstarted <= 1) {
      throw conflict(
        "last_unstarted",
        "A project needs at least one unstarted state for new issues.",
      );
    }
  }
  if (position !== undefined && position < 1) throw invalid("position", "is at least 1");

  const updated = await withConflict(
    "state_name_taken",
    "A state with this name already exists in the project.",
    async () => {
      const rows = await sql`UPDATE workflow_states SET
         name = COALESCE(${name}::text, name),
         category = COALESCE(${category ?? null}::text, category),
         position = COALESCE(${position ?? null}::int, position),
         updated_at = to_timestamp(${now}::bigint)
       WHERE id = ${stateId}::text::uuid AND project_id = ${project.id}::text::uuid AND deleted_at IS NULL
       RETURNING id::text AS id, name, category, position`;
      const r = rows[0];
      if (!r) return null;
      return {
        id: r["id"] as string,
        name: r["name"] as string,
        category: r["category"] as string,
        position: Number(r["position"]),
      };
    },
  );
  if (!updated) throw notFound("There is no such state.");
  return Response.json(updated, { status: 200 });
}

async function deleteState(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireManage(access);
  const stateId = pathId(param(c, "state"), "state");

  const rows = await sql`SELECT category, name FROM workflow_states
     WHERE id = ${stateId}::text::uuid AND project_id = ${project.id}::text::uuid AND deleted_at IS NULL`;
  const row = rows[0];
  if (!row) throw notFound("There is no such state.");
  const category = row["category"] as string;
  const name = row["name"] as string;
  const inUse =
    await sql`SELECT EXISTS (SELECT 1 FROM issues WHERE state_id = ${stateId}::text::uuid AND deleted_at IS NULL) AS in_use`;
  if (inUse[0]?.["in_use"] === true) {
    throw conflict(
      "state_in_use",
      "Issues still use this state. Move them to another state first.",
    );
  }
  if (category === "Unstarted") {
    const count = await sql`SELECT count(*)::int AS n FROM workflow_states
       WHERE project_id = ${project.id}::text::uuid AND category = 'Unstarted' AND deleted_at IS NULL`;
    if (Number(count[0]?.["n"] ?? 0) <= 1) {
      throw conflict(
        "last_unstarted",
        "A project needs at least one unstarted state for new issues.",
      );
    }
  }
  // Rename on delete, so the name is free for a new state (the unique constraint covers deleted rows too).
  const freed = `${name} (deleted ${stateId})`;
  await sql`UPDATE workflow_states SET name = ${freed}::text, deleted_at = to_timestamp(${now}::bigint),
       updated_at = to_timestamp(${now}::bigint) WHERE id = ${stateId}::text::uuid`;
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/* ---------- issues ---------- */

async function createIssue(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireEdit(access);
  const body = await readBody(c, [
    "summary",
    "description",
    "type",
    "priority",
    "state_id",
    "assignee_id",
    "parent_id",
    "sprint_id",
    "estimate_points",
    "due_date",
    "tags",
  ]);
  const summaryRaw = reqStr(body, "summary");
  const description = optStr(body, "description");
  const typeRaw = optStr(body, "type");
  const priorityRaw = optStr(body, "priority");
  const stateRaw = optStr(body, "state_id");
  const assigneeRaw = optStr(body, "assignee_id");
  const parentRaw = optStr(body, "parent_id");
  const sprintRaw = optStr(body, "sprint_id");
  const estimate = optInt(body, "estimate_points", 0, U32_MAX);
  const dueRaw = optStr(body, "due_date");
  const tagsRaw = optStrs(body, "tags");

  const summary = requiredField("summary", summaryRaw, SUMMARY_MAX);
  const desc = textField("description", description, DESCRIPTION_MAX) ?? "";
  const issueType = checkIn("type", typeRaw ?? "Task", ISSUE_TYPES);
  const priority = checkIn("priority", priorityRaw ?? "Normal", PRIORITIES);

  let stateId: string;
  if (stateRaw !== undefined && stateRaw.trim() !== "") {
    stateId = stateIn(project.workflow, "state_id", stateRaw);
  } else {
    let first: { id: string; position: number } | null = null;
    for (const s of project.workflow) {
      if (s.category === "Unstarted" && (first === null || s.position < first.position)) first = s;
    }
    if (!first) throw conflict("no_unstarted_state", "The project has no unstarted state.");
    stateId = first.id;
  }
  const assigneeId =
    assigneeRaw !== undefined && assigneeRaw.trim() !== ""
      ? await memberId(sql, project.id, "assignee_id", assigneeRaw)
      : null;
  let parentId: string | null = null;
  if (parentRaw !== undefined && parentRaw.trim() !== "") {
    const id = idArg("parent_id", parentRaw);
    const chain = await parentChain(sql, project.id, id);
    if (!chain) throw invalid("parent_id", "is not an issue in this project");
    parentId = id;
  }
  const sprintId =
    sprintRaw !== undefined && sprintRaw.trim() !== ""
      ? await sprintIdIn(sql, project.id, "sprint_id", sprintRaw)
      : null;
  const due = optionalDate("due_date", dueRaw) ?? null;
  const tags = cleanTags(tagsRaw ?? []);
  await requireKnownAreas(sql, tags);

  const number = await sql.begin(async (tx) => {
    const numRows = await tx`UPDATE projects SET next_issue_number = next_issue_number + 1,
         updated_at = to_timestamp(${now}::bigint)
       WHERE id = ${project.id}::text::uuid AND deleted_at IS NULL
       RETURNING (next_issue_number - 1)::int AS number`;
    const n = numRows[0];
    if (!n) throw new Error("project vanished during issue create");
    const topRows = await tx`SELECT max(backlog_rank COLLATE "C") AS top FROM issues
       WHERE project_id = ${project.id}::text::uuid AND deleted_at IS NULL`;
    const top = (topRows[0]?.["top"] as string | null | undefined) ?? null;
    const rank = betweenRanks(top, null);
    if (rank === null) throw new Error("no backlog rank above the top issue");
    await tx`INSERT INTO issues (project_id, number, summary, description, type, priority, state_id,
         assignee_id, reporter_id, parent_id, sprint_id, estimate_points, due_date, tags,
         backlog_rank, created_at, updated_at)
       VALUES (${project.id}::text::uuid, ${n["number"]}::int, ${summary}::text, ${desc}::text, ${issueType}::text,
         ${priority}::text, ${stateId}::text::uuid, ${assigneeId}::text::uuid, ${who.id}::text::uuid,
         ${parentId}::text::uuid, ${sprintId}::text::uuid, ${estimate ?? null}::int, ${due}::text::date,
         ${tags}::text[], ${rank}::text, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))`;
    await tx`INSERT INTO activity (issue_id, actor_id, kind, created_at, updated_at)
       SELECT id, ${who.id}::text::uuid, 'created', to_timestamp(${now}::bigint), to_timestamp(${now}::bigint)
       FROM issues WHERE project_id = ${project.id}::text::uuid AND number = ${n["number"]}::int`;
    return Number(n["number"]);
  });
  const issue = await reloadIssue(sql, who.id, project.id, number);
  return Response.json(issue, { status: 201 });
}

async function updateIssue(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue: current } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const projectId = loaded.project.id;
  const body = await readBody(c, [
    "summary",
    "description",
    "type",
    "priority",
    "state_id",
    "assignee_id",
    "parent_id",
    "sprint_id",
    "estimate_points",
    "due_date",
    "tags",
  ]);
  const summaryRaw = optStr(body, "summary");
  const description = optStr(body, "description");
  const typeRaw = optStr(body, "type");
  const priorityRaw = optStr(body, "priority");
  const stateRaw = optStr(body, "state_id");
  const assigneeRaw = optStr(body, "assignee_id");
  const parentRaw = optStr(body, "parent_id");
  const sprintRaw = optStr(body, "sprint_id");
  // estimate_points: absent leaves it, null clears it, a number sets it.
  let estimateSet = false;
  let estimateValue: number | null = null;
  if (body["estimate_points"] !== undefined) {
    estimateSet = true;
    estimateValue = optInt(body, "estimate_points", 0, U32_MAX) ?? null;
  }
  const dueRaw = optStr(body, "due_date");
  const tagsRaw = optStrs(body, "tags");

  const values = {
    summary: current.summary,
    description: current.description,
    issue_type: current.type,
    priority: current.priority,
    state_id: current.state.id,
    assignee_id: current.assignee?.id ?? null,
    parent_id: current.parent?.id ?? null,
    sprint_id: current.sprint?.id ?? null,
    estimate_points: current.estimate_points,
    due_date: current.due_date,
    tags: current.tags,
    resolved_at: current.resolved_at,
  };

  if (summaryRaw !== undefined) values.summary = requiredField("summary", summaryRaw, SUMMARY_MAX);
  if (description !== undefined) {
    if (charCount(description) > DESCRIPTION_MAX) {
      throw invalid("description", `at most ${DESCRIPTION_MAX} characters`);
    }
    values.description = description;
  }
  if (typeRaw !== undefined) values.issue_type = checkIn("type", typeRaw, ISSUE_TYPES);
  if (priorityRaw !== undefined) values.priority = checkIn("priority", priorityRaw, PRIORITIES);
  if (stateRaw !== undefined && stateRaw.trim() !== "") {
    values.state_id = stateIn(loaded.project.workflow, "state_id", stateRaw);
  }
  if (assigneeRaw !== undefined) {
    values.assignee_id =
      assigneeRaw.trim() === "" ? null : await memberId(sql, projectId, "assignee_id", assigneeRaw);
  }
  if (parentRaw !== undefined) {
    if (parentRaw.trim() === "") {
      values.parent_id = null;
    } else {
      const id = idArg("parent_id", parentRaw);
      const chain = await parentChain(sql, projectId, id);
      if (!chain) throw invalid("parent_id", "is not an issue in this project");
      if (chain.includes(current.id))
        throw invalid("parent_id", "would make an issue its own ancestor");
      values.parent_id = id;
    }
  }
  if (sprintRaw !== undefined) {
    values.sprint_id =
      sprintRaw.trim() === "" ? null : await sprintIdIn(sql, projectId, "sprint_id", sprintRaw);
  }
  if (estimateSet) values.estimate_points = estimateValue;
  if (dueRaw !== undefined) {
    const date = optionalDate("due_date", dueRaw);
    if (date !== undefined) values.due_date = date;
  }
  if (tagsRaw !== undefined) {
    values.tags = cleanTags(tagsRaw);
    await requireKnownAreas(sql, values.tags);
  }

  // A state in a finished category stamps resolved_at once; leaving it clears it.
  const oldCategory = current.state.category;
  const newCategory = loaded.project.workflow.find((s) => s.id === values.state_id)?.category ?? "";
  const finished = (cat: string) => cat === "Done" || cat === "Cancelled";
  if (finished(newCategory)) {
    values.resolved_at = finished(oldCategory) ? current.resolved_at : now;
  } else {
    values.resolved_at = null;
  }

  const changes: { field: string; old: unknown; new: unknown }[] = [];
  pushChange(changes, "summary", current.summary, values.summary);
  pushChange(changes, "description", current.description, values.description);
  pushChange(changes, "type", current.type, values.issue_type);
  pushChange(changes, "priority", current.priority, values.priority);
  pushChange(changes, "state_id", current.state.id, values.state_id);
  pushChange(changes, "assignee_id", current.assignee?.id ?? null, values.assignee_id);
  pushChange(changes, "parent_id", current.parent?.id ?? null, values.parent_id);
  pushChange(changes, "sprint_id", current.sprint?.id ?? null, values.sprint_id);
  pushChange(changes, "estimate_points", current.estimate_points, values.estimate_points);
  pushChange(changes, "due_date", current.due_date, values.due_date);
  pushChange(changes, "tags", current.tags, values.tags);

  if (changes.length === 0 && values.resolved_at === current.resolved_at) {
    return Response.json(await viewIssue(sql, current, who.id), { status: 200 });
  }
  const number = parseIssueKey(current.key)?.[1] ?? 0;
  await sql.begin(async (tx) => {
    const changed = await tx`UPDATE issues SET
         summary = ${values.summary}::text, description = ${values.description}::text,
         type = ${values.issue_type}::text, priority = ${values.priority}::text,
         state_id = ${values.state_id}::text::uuid, assignee_id = ${values.assignee_id}::text::uuid,
         parent_id = ${values.parent_id}::text::uuid, sprint_id = ${values.sprint_id}::text::uuid,
         estimate_points = ${values.estimate_points}::int, due_date = ${values.due_date}::text::date,
         tags = ${values.tags}::text[],
         resolved_at = CASE WHEN ${values.resolved_at}::bigint IS NULL THEN NULL ELSE to_timestamp(${values.resolved_at}::bigint) END,
         updated_at = to_timestamp(${now}::bigint), updated_by = ${who.id}::text::uuid
       WHERE id = ${current.id}::text::uuid AND deleted_at IS NULL`;
    if (changed.count === 0) throw new Error("issue vanished during update");
    for (const change of changes) {
      await activity(
        tx,
        current.id,
        who.id,
        "field_changed",
        change.field,
        change.old,
        change.new,
        now,
      );
    }
  });
  const issue = await reloadIssue(sql, who.id, projectId, number);
  return Response.json(issue, { status: 200 });
}

async function deleteIssue(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const changed =
    await sql`UPDATE issues SET deleted_at = to_timestamp(${now}::bigint), updated_at = to_timestamp(${now}::bigint)
     WHERE id = ${issue.id}::text::uuid AND deleted_at IS NULL`;
  if (changed.count === 0) throw new Error("issue vanished during delete");
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

async function rankIssue(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireEdit(access);
  const body = await readBody(c, ["issue", "after", "before"]);
  const issueRaw = reqStr(body, "issue");
  const afterRaw = optStr(body, "after");
  const beforeRaw = optStr(body, "before");

  const [issueId, number] = await issueInProject(sql, project.id, project.key, "issue", issueRaw);
  let afterId: string | null = null;
  if (afterRaw !== undefined && afterRaw.trim() !== "") {
    afterId = (await issueInProject(sql, project.id, project.key, "after", afterRaw))[0];
  }
  let beforeId: string | null = null;
  if (beforeRaw !== undefined && beforeRaw.trim() !== "") {
    beforeId = (await issueInProject(sql, project.id, project.key, "before", beforeRaw))[0];
  }
  if (afterId === issueId) throw invalid("after", "cannot be the issue itself");
  if (beforeId === issueId) throw invalid("before", "cannot be the issue itself");

  await withConflict(
    "rank_conflict",
    "These neighbours are out of order, so the issue cannot go between them.",
    () => placeInBacklog(sql, project.id, issueId, afterId, beforeId, now),
  );
  const issue = await reloadIssue(sql, who.id, project.id, number);
  return Response.json(issue, { status: 200 });
}

/** Moves an issue between two neighbours in the backlog (the Rust `place_in_backlog` transaction). */
async function placeInBacklog(
  sql: Db,
  projectId: string,
  issueId: string,
  after: string | null,
  before: string | null,
  now: number,
): Promise<void> {
  await sql.begin(async (tx) => {
    const rankOf = async (id: string): Promise<string> => {
      const rows = await tx`SELECT backlog_rank FROM issues
         WHERE id = ${id}::text::uuid AND project_id = ${projectId}::text::uuid AND deleted_at IS NULL`;
      const r = rows[0];
      if (!r) throw new Error("issue not in project for rank");
      return r["backlog_rank"] as string;
    };
    await rankOf(issueId);
    const lowerBound = after === null ? null : await rankOf(after);
    const upperBound = before === null ? null : await rankOf(before);

    let lower: string | null;
    let upper: string | null;
    if (lowerBound !== null && upperBound !== null) {
      lower = lowerBound;
      upper = upperBound;
    } else if (lowerBound !== null) {
      const next = await tx`SELECT backlog_rank FROM issues
         WHERE project_id = ${projectId}::text::uuid AND id <> ${issueId}::text::uuid AND deleted_at IS NULL
           AND backlog_rank COLLATE "C" > ${lowerBound}::text
         ORDER BY backlog_rank COLLATE "C" ASC LIMIT 1`;
      lower = lowerBound;
      upper = (next[0]?.["backlog_rank"] as string | undefined) ?? null;
    } else if (upperBound !== null) {
      const previous = await tx`SELECT backlog_rank FROM issues
         WHERE project_id = ${projectId}::text::uuid AND id <> ${issueId}::text::uuid AND deleted_at IS NULL
           AND backlog_rank COLLATE "C" < ${upperBound}::text
         ORDER BY backlog_rank COLLATE "C" DESC LIMIT 1`;
      lower = (previous[0]?.["backlog_rank"] as string | undefined) ?? null;
      upper = upperBound;
    } else {
      const lowest = await tx`SELECT backlog_rank FROM issues
         WHERE project_id = ${projectId}::text::uuid AND id <> ${issueId}::text::uuid AND deleted_at IS NULL
         ORDER BY backlog_rank COLLATE "C" ASC LIMIT 1`;
      lower = null;
      upper = (lowest[0]?.["backlog_rank"] as string | undefined) ?? null;
    }
    const rank = betweenRanks(lower, upper);
    if (rank === null) throw new Conflict();
    await tx`UPDATE issues SET backlog_rank = ${rank}::text, updated_at = to_timestamp(${now}::bigint)
       WHERE id = ${issueId}::text::uuid AND project_id = ${projectId}::text::uuid AND deleted_at IS NULL`;
  });
}

async function setVote(c: Context, on: boolean): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { issue } = await loadIssue(sql, who, param(c, "id"));
  await toggleSocial(sql, "issue_votes", "vote", issue.id, who.id, on, now);
  const social = await socialOf(sql, issue.id, who.id);
  return Response.json({ votes: social.votes, voted_by_me: social.voted_by_me }, { status: 200 });
}

async function setStar(c: Context, on: boolean): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { issue } = await loadIssue(sql, who, param(c, "id"));
  await toggleSocial(sql, "issue_stars", "star", issue.id, who.id, on, now);
  const social = await socialOf(sql, issue.id, who.id);
  return Response.json({ starred_by_me: social.starred_by_me }, { status: 200 });
}

/* ---------- comments ---------- */

async function commentById(sql: Db, issueId: string, commentId: string) {
  const rows =
    await sql`SELECT c.id::text AS id, c.body, u.id::text AS author_id, u.name AS author_name,
       EXTRACT(EPOCH FROM c.created_at)::bigint AS created_at, EXTRACT(EPOCH FROM c.updated_at)::bigint AS updated_at
     FROM comments c JOIN employees u ON u.id = c.author_id
     WHERE c.id = ${commentId}::text::uuid AND c.issue_id = ${issueId}::text::uuid AND c.deleted_at IS NULL`;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r["id"] as string,
    body: r["body"] as string,
    author: { id: r["author_id"] as string, display_name: r["author_name"] as string },
    created_at: Number(r["created_at"]),
    updated_at: Number(r["updated_at"]),
  };
}

/** Loads a comment on the issue and checks the caller may change it. */
async function commentForChange(sql: Db, me: Caller, rawIssue: string, rawComment: string) {
  const { loaded, issue } = await loadIssue(sql, me, rawIssue);
  const commentId = pathId(rawComment, "comment");
  const found = await commentById(sql, issue.id, commentId);
  if (!found) throw notFound("There is no such comment.");
  if (found.author.id === me.id) {
    requireEdit(loaded.access);
  } else if (!canManage(loaded.access)) {
    throw forbidden("Only the author or a project admin can change this comment.");
  }
  return { issueId: issue.id, found };
}

async function createComment(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const body = await readBody(c, ["body"]);
  const text = requiredField("body", reqStr(body, "body"), COMMENT_MAX);
  const commentId = await sql.begin(async (tx) => {
    const rows = await tx`INSERT INTO comments (issue_id, author_id, body, created_at, updated_at)
       VALUES (${issue.id}::text::uuid, ${who.id}::text::uuid, ${text}::text, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
       RETURNING id::text AS id`;
    const id = rows[0]?.["id"] as string;
    await activity(tx, issue.id, who.id, "comment_added", null, null, null, now);
    return id;
  });
  const comment = await commentById(sql, issue.id, commentId);
  if (!comment) throw new Error("comment vanished after create");
  return Response.json(comment, { status: 201 });
}

async function updateComment(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { issueId, found } = await commentForChange(sql, who, param(c, "id"), param(c, "comment"));
  const body = await readBody(c, ["body"]);
  const text = requiredField("body", reqStr(body, "body"), COMMENT_MAX);
  await sql.begin(async (tx) => {
    const rows = await tx`SELECT body FROM comments
       WHERE id = ${found.id}::text::uuid AND issue_id = ${issueId}::text::uuid AND deleted_at IS NULL FOR UPDATE`;
    const old = rows[0]?.["body"] as string | undefined;
    if (old === undefined) throw new Error("comment vanished during update");
    await tx`UPDATE comments SET body = ${text}::text, updated_at = to_timestamp(${now}::bigint) WHERE id = ${found.id}::text::uuid`;
    await activity(tx, issueId, who.id, "field_changed", "comment", old, text, now);
  });
  const updated = await commentById(sql, issueId, found.id);
  if (!updated) throw notFound("There is no such comment.");
  return Response.json(updated, { status: 200 });
}

async function deleteComment(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { issueId, found } = await commentForChange(sql, who, param(c, "id"), param(c, "comment"));
  await sql.begin(async (tx) => {
    const rows = await tx`SELECT body FROM comments
       WHERE id = ${found.id}::text::uuid AND issue_id = ${issueId}::text::uuid AND deleted_at IS NULL FOR UPDATE`;
    const old = rows[0]?.["body"] as string | undefined;
    if (old === undefined) throw new Error("comment vanished during delete");
    await tx`UPDATE comments SET deleted_at = to_timestamp(${now}::bigint), updated_at = to_timestamp(${now}::bigint)
       WHERE id = ${found.id}::text::uuid`;
    await activity(tx, issueId, who.id, "field_changed", "comment", old, null, now);
  });
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/* ---------- links ---------- */

async function addLink(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue: source } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const body = await readBody(c, ["target", "kind"]);
  const targetRaw = reqStr(body, "target");
  const kind = checkIn("kind", reqStr(body, "kind"), LINK_KINDS);
  const parsed = parseIssueKey(targetRaw);
  if (!parsed) throw invalid("target", "use an issue key such as EMB-12");
  const [targetKey, targetNumber] = parsed;

  const unseen = () => invalid("target", "is not an issue you can see");
  let targetProjectId: string;
  try {
    targetProjectId = (await loadProject(sql, who, targetKey)).project.id;
  } catch {
    throw unseen();
  }
  const target = await findIssue(sql, targetProjectId, targetNumber);
  if (!target) throw unseen();
  if (target.id === source.id) throw invalid("target", "an issue cannot link to itself");

  await withConflict("link_exists", "These two issues are already linked that way.", () =>
    sql.begin(async (tx) => {
      // A removed link with the same ends is revived, because the unique key covers deleted rows.
      const revived =
        await tx`INSERT INTO issue_links (source_id, target_id, kind, created_at, updated_at)
         VALUES (${source.id}::text::uuid, ${target.id}::text::uuid, ${kind}::text, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
         ON CONFLICT (source_id, target_id, kind) DO UPDATE SET deleted_at = NULL, updated_at = EXCLUDED.updated_at
           WHERE issue_links.deleted_at IS NOT NULL
         RETURNING id::text AS id`;
      if (revived.length === 0) throw new Conflict();
      await activity(
        tx,
        source.id,
        who.id,
        "link_added",
        null,
        null,
        { kind, other: target.id },
        now,
      );
      await activity(
        tx,
        target.id,
        who.id,
        "link_added",
        null,
        null,
        { kind, other: source.id },
        now,
      );
    }),
  );
  const sourceNumber = parseIssueKey(source.key)?.[1] ?? 0;
  const issue = await reloadIssue(sql, who.id, loaded.project.id, sourceNumber);
  return Response.json(issue, { status: 201 });
}

async function removeLink(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const linkId = pathId(param(c, "link"), "link");
  const removed = await sql.begin(async (tx) => {
    const rows =
      await tx`UPDATE issue_links SET deleted_at = to_timestamp(${now}::bigint), updated_at = to_timestamp(${now}::bigint)
       WHERE id = ${linkId}::text::uuid AND deleted_at IS NULL
         AND (source_id = ${issue.id}::text::uuid OR target_id = ${issue.id}::text::uuid)
       RETURNING source_id::text AS source_id, target_id::text AS target_id, kind`;
    const row = rows[0];
    if (!row) return false;
    const source = row["source_id"] as string;
    const target = row["target_id"] as string;
    const kind = row["kind"] as string;
    await activity(tx, source, who.id, "link_removed", null, { kind, other: target }, null, now);
    await activity(tx, target, who.id, "link_removed", null, { kind, other: source }, null, now);
    return true;
  });
  if (!removed) throw notFound("There is no such link.");
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/* ---------- spent time ---------- */

async function workItemById(sql: Db, issueId: string, workItemId: string) {
  const rows = await sql`SELECT w.id::text AS id, w.minutes, w.spent_on::text AS spent_on, w.note,
       u.id::text AS author_id, u.name AS author_name,
       EXTRACT(EPOCH FROM w.created_at)::bigint AS created_at, EXTRACT(EPOCH FROM w.updated_at)::bigint AS updated_at
     FROM issue_work_items w JOIN employees u ON u.id = w.author_id
     WHERE w.id = ${workItemId}::text::uuid AND w.issue_id = ${issueId}::text::uuid AND w.deleted_at IS NULL`;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r["id"] as string,
    minutes: Number(r["minutes"]),
    spent_on: r["spent_on"] as string,
    note: r["note"] as string,
    author: { id: r["author_id"] as string, display_name: r["author_name"] as string },
    created_at: Number(r["created_at"]),
    updated_at: Number(r["updated_at"]),
  };
}

async function createWorkItem(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const body = await readBody(c, ["minutes", "spent_on", "note"]);
  const minutes = reqInt(body, "minutes", 0, U32_MAX);
  const spentRaw = optStr(body, "spent_on");
  const noteRaw = optStr(body, "note");

  if (minutes === 0 || minutes > WORK_MINUTES_MAX) {
    throw invalid("minutes", `use a number of minutes from 1 to ${WORK_MINUTES_MAX}`);
  }
  const today = new Date(now * 1000).toISOString().slice(0, 10);
  let spentOn: string;
  const trimmed = spentRaw === undefined ? "" : spentRaw.trim();
  if (trimmed === "") spentOn = today;
  else if (isIsoDate(trimmed)) spentOn = trimmed;
  else throw invalid("spent_on", "use the form YYYY-MM-DD");
  const note = textField("note", noteRaw, TEXT_MAX) ?? "";

  const workId = await sql.begin(async (tx) => {
    const rows =
      await tx`INSERT INTO issue_work_items (issue_id, author_id, minutes, spent_on, note, created_at, updated_at)
       VALUES (${issue.id}::text::uuid, ${who.id}::text::uuid, ${minutes}::int, ${spentOn}::text::date, ${note}::text,
               to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
       RETURNING id::text AS id`;
    const id = rows[0]?.["id"] as string;
    await activity(
      tx,
      issue.id,
      who.id,
      "field_changed",
      "work_item",
      null,
      { minutes, spent_on: spentOn },
      now,
    );
    return id;
  });
  const item = await workItemById(sql, issue.id, workId);
  if (!item) throw new Error("work item vanished after create");
  return Response.json(item, { status: 201 });
}

async function deleteWorkItem(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { loaded, issue } = await loadIssue(sql, who, param(c, "id"));
  requireEdit(loaded.access);
  const workItemId = pathId(param(c, "workItem"), "work item");
  const removed = await sql.begin(async (tx) => {
    const rows =
      await tx`UPDATE issue_work_items SET deleted_at = to_timestamp(${now}::bigint), updated_at = to_timestamp(${now}::bigint)
       WHERE id = ${workItemId}::text::uuid AND issue_id = ${issue.id}::text::uuid AND deleted_at IS NULL
       RETURNING minutes`;
    const row = rows[0];
    if (!row) return false;
    await activity(
      tx,
      issue.id,
      who.id,
      "field_changed",
      "work_item",
      { minutes: Number(row["minutes"]) },
      null,
      now,
    );
    return true;
  });
  if (!removed) throw notFound("There is no such work item.");
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

/* ---------- sprints ---------- */

const NO_SPRINT = () => notFound("There is no such sprint.");

async function sprintsOf(sql: Db, projectId: string) {
  const rows =
    await sql`SELECT id::text AS id, name, goal, start_date::text AS start_date, end_date::text AS end_date, state
     FROM sprints WHERE project_id = ${projectId}::text::uuid AND deleted_at IS NULL
     ORDER BY start_date, name, id`;
  return rows.map(sprintRow);
}

function sprintRow(r: Row) {
  return {
    id: r["id"] as string,
    name: r["name"] as string,
    goal: r["goal"] as string,
    start_date: r["start_date"] as string,
    end_date: r["end_date"] as string,
    state: r["state"] as string,
  };
}

async function createSprint(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireEdit(access);
  const body = await readBody(c, ["name", "goal", "start_date", "end_date", "state"]);
  const nameRaw = reqStr(body, "name");
  const goalRaw = optStr(body, "goal");
  const startDate = reqStr(body, "start_date");
  const endDate = reqStr(body, "end_date");
  const stateRaw = optStr(body, "state");

  const name = requiredField("name", nameRaw, NAME_MAX);
  const goal = textField("goal", goalRaw, GOAL_MAX) ?? "";
  if (!isIsoDate(startDate)) throw invalid("start_date", "use the form YYYY-MM-DD");
  if (!isIsoDate(endDate)) throw invalid("end_date", "use the form YYYY-MM-DD");
  if (endDate < startDate) throw invalid("end_date", "is before start_date");
  const state = checkIn("state", stateRaw ?? "Planned", SPRINT_STATES);

  const created = await withConflict(
    "active_sprint_exists",
    "Another sprint is already active in this project. Close it first.",
    async () => {
      const rows =
        await sql`INSERT INTO sprints (project_id, name, goal, start_date, end_date, state, created_at, updated_at)
         VALUES (${project.id}::text::uuid, ${name}::text, ${goal}::text, ${startDate}::text::date, ${endDate}::text::date,
                 ${state}::text, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
         RETURNING id::text AS id, name, goal, start_date::text AS start_date, end_date::text AS end_date, state`;
      return sprintRow(rows[0] ?? {});
    },
  );
  return Response.json(created, { status: 201 });
}

async function updateSprint(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const { project, access } = await loadProject(sql, who, param(c, "key"));
  requireEdit(access);
  const sprintId = pathId(param(c, "sprint"), "sprint");
  const sprints = await sprintsOf(sql, project.id);
  const current = sprints.find((s) => s.id === sprintId);
  if (!current) throw NO_SPRINT();

  const body = await readBody(c, [
    "name",
    "goal",
    "start_date",
    "end_date",
    "state",
    "move_unfinished_to",
  ]);
  const nameRaw = optStr(body, "name");
  const goalRaw = optStr(body, "goal");
  const startRaw = optStr(body, "start_date");
  const endRaw = optStr(body, "end_date");
  const stateRaw = optStr(body, "state");
  const moveRaw = optStr(body, "move_unfinished_to");

  const name = nameRaw === undefined ? null : requiredField("name", nameRaw, NAME_MAX);
  const goal = textField("goal", goalRaw, GOAL_MAX) ?? null;
  let startDate: string | null = null;
  if (startRaw !== undefined) {
    if (!isIsoDate(startRaw)) throw invalid("start_date", "use the form YYYY-MM-DD");
    startDate = startRaw;
  }
  let endDate: string | null = null;
  if (endRaw !== undefined) {
    if (!isIsoDate(endRaw)) throw invalid("end_date", "use the form YYYY-MM-DD");
    endDate = endRaw;
  }
  const effectiveStart = startDate ?? current.start_date;
  const effectiveEnd = endDate ?? current.end_date;
  if (effectiveEnd < effectiveStart) throw invalid("end_date", "is before start_date");
  const stateCanon = stateRaw === undefined ? undefined : checkIn("state", stateRaw, SPRINT_STATES);
  const effectiveState = stateCanon ?? current.state;
  if (stateCanon === "Active" && current.state !== "Active") {
    if (sprints.some((s) => s.state === "Active" && s.id !== sprintId)) {
      throw conflict(
        "active_sprint_exists",
        "Another sprint is already active in this project. Close it first.",
      );
    }
  }
  // undefined: not moving. null: move to the backlog. string: move to that sprint.
  let moveUnfinished: string | null | undefined;
  if (moveRaw !== undefined) {
    if (effectiveState !== "Closed") {
      throw invalid("move_unfinished_to", "is only used when the sprint is closed");
    }
    if (moveRaw === "backlog") {
      moveUnfinished = null;
    } else {
      const id = idArg("move_unfinished_to", moveRaw);
      if (id === sprintId || !sprints.some((s) => s.id === id)) {
        throw invalid("move_unfinished_to", "is not another sprint in this project");
      }
      moveUnfinished = id;
    }
  }

  const updated = await withConflict(
    "active_sprint_exists",
    "Another sprint is already active in this project. Close it first.",
    async () => {
      const found = await sql`SELECT id::text AS id FROM sprints
         WHERE id = ${sprintId}::text::uuid AND project_id = ${project.id}::text::uuid AND deleted_at IS NULL`;
      if (!found[0]) return null;
      await sql.begin(async (tx) => {
        await tx`UPDATE sprints SET
             name = COALESCE(${name}::text, name),
             goal = COALESCE(${goal}::text, goal),
             start_date = COALESCE(${startDate}::text::date, start_date),
             end_date = COALESCE(${endDate}::text::date, end_date),
             state = COALESCE(${stateCanon ?? null}::text, state),
             updated_at = to_timestamp(${now}::bigint)
           WHERE id = ${sprintId}::text::uuid AND project_id = ${project.id}::text::uuid AND deleted_at IS NULL`;
        if (moveUnfinished !== undefined) {
          await tx`UPDATE issues SET sprint_id = ${moveUnfinished}::text::uuid, updated_at = to_timestamp(${now}::bigint)
             WHERE sprint_id = ${sprintId}::text::uuid AND project_id = ${project.id}::text::uuid AND deleted_at IS NULL
               AND state_id IN (SELECT id FROM workflow_states WHERE category NOT IN ('Done', 'Cancelled'))`;
        }
      });
      const rows =
        await sql`SELECT id::text AS id, name, goal, start_date::text AS start_date, end_date::text AS end_date, state
         FROM sprints WHERE id = ${sprintId}::text::uuid AND project_id = ${project.id}::text::uuid AND deleted_at IS NULL`;
      return rows[0] ? sprintRow(rows[0]) : null;
    },
  );
  if (!updated) throw NO_SPRINT();
  return Response.json(updated, { status: 200 });
}

/* ---------- routes ---------- */

const projectsWrite = new Hono();

projectsWrite.patch("/projects/:key", handle(updateProject));
projectsWrite.put("/projects/:key/members/:user", handle(setMember));
projectsWrite.delete("/projects/:key/members/:user", handle(removeMember));
projectsWrite.post("/projects/:key/workflow", handle(createState));
projectsWrite.patch("/projects/:key/workflow/:state", handle(updateState));
projectsWrite.delete("/projects/:key/workflow/:state", handle(deleteState));
projectsWrite.post("/projects/:key/issues", handle(createIssue));
projectsWrite.patch("/issues/:id", handle(updateIssue));
projectsWrite.delete("/issues/:id", handle(deleteIssue));
projectsWrite.post("/issues/:id/comments", handle(createComment));
projectsWrite.patch("/issues/:id/comments/:comment", handle(updateComment));
projectsWrite.delete("/issues/:id/comments/:comment", handle(deleteComment));
projectsWrite.post("/issues/:id/links", handle(addLink));
projectsWrite.delete("/issues/:id/links/:link", handle(removeLink));
projectsWrite.put(
  "/issues/:id/vote",
  handle((c) => setVote(c, true)),
);
projectsWrite.delete(
  "/issues/:id/vote",
  handle((c) => setVote(c, false)),
);
projectsWrite.put(
  "/issues/:id/star",
  handle((c) => setStar(c, true)),
);
projectsWrite.delete(
  "/issues/:id/star",
  handle((c) => setStar(c, false)),
);
projectsWrite.post("/issues/:id/work-items", handle(createWorkItem));
projectsWrite.delete("/issues/:id/work-items/:workItem", handle(deleteWorkItem));
projectsWrite.post("/projects/:key/backlog/rank", handle(rankIssue));
projectsWrite.post("/projects/:key/sprints", handle(createSprint));
projectsWrite.patch("/projects/:key/sprints/:sprint", handle(updateSprint));

export default projectsWrite;

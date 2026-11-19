/**
 * Rimelight Space project read routes on the website Worker (port of the read side of project_service.rs,
 * pg_projects.rs, search.rs, rimelight_proto query.rs and rimelight_policy). Paths are relative to /v1.
 *
 * Covered: projects, members, workflow, issue list, backlog, sprints, issue search and the query language,
 * one issue, comments, activity, work items, attachments and similar issues. Writes are not here.
 *
 * Access (rimelight_policy): a non-member gets 404 on a project and its issues. A global admin
 * (`user_roles.role = 'admin'`) sees every project.
 */
import { Hono, type Context } from "hono";
import type postgres from "postgres";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

type Sql = ReturnType<typeof getDb>["$client"];
type Frag = postgres.PendingQuery<postgres.Row[]>;
type Row = postgres.Row;

const projectsRead = new Hono();

const NO_STORE = { "Cache-Control": "no-store" };
const ROLE_ADMIN = "admin";
const PROJECT_ROLES = ["admin", "member", "viewer"];
const ISSUE_TYPES = ["Task", "Bug", "Feature", "Epic"];
const PRIORITIES = ["Critical", "High", "Normal", "Low"];
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;
const U32_MAX = 4294967295;
const DAY = 86_400;
const FILTER_PARAMS = ["state", "assignee", "type", "priority", "sprint", "parent", "sort"];
const SIMILAR_WORDS_MAX = 10;
const SIMILAR_LIMIT = 5;
const VALID_PROJECT_KEY = /^[A-Z][A-Z0-9]{1,9}$/;
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/* ---------- JSON shapes and errors (Rust api_error, not_found, invalid, bad_request) ---------- */

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: NO_STORE });
const apiError = (status: number, error: string, message: string) =>
  json({ error, message }, status);
const notFound = (message: string) => apiError(404, "not_found", message);
const noProject = () => notFound("There is no such project.");
const noIssue = () => notFound("There is no such issue.");
const invalid = (field: string, message: string) =>
  apiError(422, "invalid_field", `${field}: ${message}`);
const badRequest = (message: string) => apiError(400, "invalid_request", message);
const serverFailure = (where: string, err: unknown) => {
  console.error(`space ${where} failed`, err);
  return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
};

/* ---------- ASCII helpers (Rust to_ascii_uppercase / to_ascii_lowercase) ---------- */

const asciiUpper = (s: string) => s.replace(/[a-z]/g, (ch) => ch.toUpperCase());
const asciiLower = (s: string) => s.replace(/[A-Z]/g, (ch) => ch.toLowerCase());
const isUuid = (value: string) => UUID.test(value);

/** Parses a non-negative whole number that fits a u32, or null. */
function parseU32(raw: string): number | null {
  if (!/^\+?[0-9]+$/.test(raw)) return null;
  const n = Number(raw);
  return n <= U32_MAX ? n : null;
}

/** `EMB-12` into project key and number. Null when it is not an issue key (number at least 1). */
function parseIssueKey(raw: string): { project: string; number: number } | null {
  const trimmed = raw.trim();
  const dash = trimmed.lastIndexOf("-");
  if (dash < 0) return null;
  const project = asciiUpper(trimmed.slice(0, dash));
  const digits = trimmed.slice(dash + 1);
  if (!VALID_PROJECT_KEY.test(project) || !/^[0-9]+$/.test(digits)) return null;
  const number = parseU32(digits);
  return number !== null && number >= 1 ? { project, number } : null;
}

/** A UUID query value in lower case, or a 422 naming the field. */
function idArg(field: string, raw: string): string | Response {
  const trimmed = raw.trim();
  return isUuid(trimmed) ? trimmed.toLowerCase() : invalid(field, "is not a valid id");
}

/** `limit` (1 to 100, default 50) and `cursor` (the next offset) from the query string. */
function pageWindow(c: Context): { offset: number; limit: number } | Response {
  let limit = DEFAULT_PAGE_LIMIT;
  const rawLimit = c.req.query("limit");
  if (rawLimit !== undefined) {
    const n = parseU32(rawLimit.trim());
    if (n === null || n === 0) return badRequest("limit must be a number from 1 to 100.");
    limit = Math.min(n, MAX_PAGE_LIMIT);
  }
  let offset = 0;
  const cursor = c.req.query("cursor")?.trim();
  if (cursor) {
    const n = parseU32(cursor);
    if (n === null) return badRequest("cursor is not valid.");
    offset = n;
  }
  return { offset, limit };
}

/* ---------- Viewer, project and issue loading ---------- */

type Viewer = { id: string; admin: boolean };

async function viewerOf(c: Context, sql: Sql): Promise<Viewer | Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const rows = await sql`
    SELECT EXISTS (SELECT 1 FROM user_roles ur
                    WHERE ur.user_id = ${who.id}::text::uuid AND ur.role = ${ROLE_ADMIN}) AS admin`;
  return { id: who.id, admin: rows[0]?.["admin"] === true };
}

type UserRef = { id: string; display_name: string };
type WorkflowState = { id: string; name: string; category: string; position: number };
type SprintSummary = { id: string; name: string; state: string };

type ProjectHead = {
  id: string;
  key: string;
  name: string;
  description: string;
  lead: UserRef | null;
  my_role: string | null;
  image_url: string | null;
};

/** A project the viewer may see. Anything else is a 404 (no existence leak). */
async function loadProject(
  sql: Sql,
  me: Viewer,
  raw: string,
): Promise<{ project: ProjectHead } | Response> {
  const key = asciiUpper(raw.trim());
  if (!VALID_PROJECT_KEY.test(key)) return noProject();
  const rows = await sql`
    SELECT p.id::text AS id, p.key AS key, p.name AS name, p.description AS description,
           p.lead_id::text AS lead_id, lu.name AS lead_name, m.role AS my_role, p.image_key AS image_key
      FROM projects p
      LEFT JOIN employees lu ON lu.id = p.lead_id
      LEFT JOIN project_members m ON m.project_id = p.id
                                 AND m.user_id = ${me.id}::text::uuid AND m.deleted_at IS NULL
     WHERE p.key = ${key}::text AND p.deleted_at IS NULL`;
  const row = rows[0];
  if (!row) return noProject();
  const role = row["my_role"] as string | null;
  const canView = me.admin || (role !== null && PROJECT_ROLES.includes(role));
  if (!canView) return noProject();
  return {
    project: {
      id: row["id"],
      key: row["key"],
      name: row["name"],
      description: row["description"],
      lead: row["lead_id"] ? { id: row["lead_id"], display_name: row["lead_name"] ?? "" } : null,
      my_role: role,
      image_url: row["image_key"] ? `/v1/projects/${row["key"]}/image` : null,
    },
  };
}

async function workflowOf(sql: Sql, projectId: string): Promise<WorkflowState[]> {
  const rows = await sql`
    SELECT id::text AS id, name, category, position FROM workflow_states
     WHERE project_id = ${projectId}::text::uuid AND deleted_at IS NULL
     ORDER BY position, name`;
  return rows.map((r) => ({
    id: r["id"],
    name: r["name"],
    category: r["category"],
    position: Number(r["position"]),
  }));
}

async function membersOf(sql: Sql, projectId: string) {
  const rows = await sql`
    SELECT u.id::text AS id, u.name AS name, m.role AS role
      FROM project_members m JOIN employees u ON u.id = m.user_id
     WHERE m.project_id = ${projectId}::text::uuid AND m.deleted_at IS NULL
     ORDER BY lower(u.name), u.id::text`;
  return rows.map((r) => ({ user: { id: r["id"], display_name: r["name"] }, role: r["role"] }));
}

async function sprintsOf(sql: Sql, projectId: string): Promise<Record<string, unknown>[]> {
  const rows = await sql`
    SELECT id::text AS id, name, goal, start_date::text AS start_date, end_date::text AS end_date, state
      FROM sprints
     WHERE project_id = ${projectId}::text::uuid AND deleted_at IS NULL
     ORDER BY start_date, name, id`;
  return rows.map((r) => ({
    id: r["id"],
    name: r["name"],
    goal: r["goal"],
    start_date: r["start_date"],
    end_date: r["end_date"],
    state: r["state"],
  }));
}

/* ---------- Issues ---------- */

/** One issue as read by `issueCols`, before its parent, subtasks, links and social fields are added. */
type IssueRec = {
  id: string;
  key: string;
  projectId: string;
  number: number;
  summary: string;
  description: string;
  type: string;
  priority: string;
  state: WorkflowState;
  assignee: UserRef | null;
  reporter: UserRef;
  parentId: string | null;
  sprint: SprintSummary | null;
  estimate: number | null;
  due: string | null;
  tags: string[];
  rank: string;
  created: number;
  updated: number;
  resolved: number | null;
  updatedBy: UserRef | null;
};

/** The columns of an issue read, with aliases so joined tables do not collide (28 in Rust). */
function issueCols(sql: Sql): Frag {
  return sql`i.id::text AS id, i.project_id::text AS project_id, p.key AS project_key, i.number AS number,
    i.summary AS summary, i.description AS description, i.type AS type, i.priority AS priority,
    ws.id::text AS state_id, ws.name AS state_name, ws.category AS state_category, ws.position AS state_position,
    a.id::text AS assignee_id, a.name AS assignee_name, r.id::text AS reporter_id, r.name AS reporter_name,
    i.parent_id::text AS parent_id, i.sprint_id::text AS sprint_id, sp.name AS sprint_name, sp.state AS sprint_state,
    i.estimate_points AS estimate, i.due_date::text AS due_date, i.tags AS tags, i.backlog_rank AS backlog_rank,
    EXTRACT(EPOCH FROM i.created_at)::bigint AS created_at, EXTRACT(EPOCH FROM i.updated_at)::bigint AS updated_at,
    EXTRACT(EPOCH FROM i.resolved_at)::bigint AS resolved_at,
    ub.id::text AS updated_by_id, ub.name AS updated_by_name`;
}

function issueJoins(sql: Sql): Frag {
  return sql`JOIN projects p ON p.id = i.project_id
    JOIN workflow_states ws ON ws.id = i.state_id
    LEFT JOIN employees a ON a.id = i.assignee_id
    JOIN employees r ON r.id = i.reporter_id
    LEFT JOIN sprints sp ON sp.id = i.sprint_id
    LEFT JOIN employees ub ON ub.id = i.updated_by`;
}

function readIssueRec(r: Row): IssueRec {
  const sprintId = r["sprint_id"] as string | null;
  const assigneeId = r["assignee_id"] as string | null;
  const updatedById = r["updated_by_id"] as string | null;
  return {
    id: r["id"],
    key: `${r["project_key"]}-${r["number"]}`,
    projectId: r["project_id"],
    number: Number(r["number"]),
    summary: r["summary"],
    description: r["description"],
    type: r["type"],
    priority: r["priority"],
    state: {
      id: r["state_id"],
      name: r["state_name"],
      category: r["state_category"],
      position: Number(r["state_position"]),
    },
    assignee: assigneeId ? { id: assigneeId, display_name: r["assignee_name"] ?? "" } : null,
    reporter: { id: r["reporter_id"], display_name: r["reporter_name"] },
    parentId: (r["parent_id"] as string | null) ?? null,
    sprint: sprintId
      ? { id: sprintId, name: r["sprint_name"] ?? "", state: r["sprint_state"] ?? "" }
      : null,
    estimate: r["estimate"] == null ? null : Number(r["estimate"]),
    due: (r["due_date"] as string | null) ?? null,
    tags: (r["tags"] as string[] | null) ?? [],
    rank: r["backlog_rank"],
    created: Number(r["created_at"]),
    updated: Number(r["updated_at"]),
    resolved: r["resolved_at"] == null ? null : Number(r["resolved_at"]),
    updatedBy: updatedById ? { id: updatedById, display_name: r["updated_by_name"] ?? "" } : null,
  };
}

/** The IssueSummary JSON (Rust `IssueRec::summary`). */
function summaryJson(rec: IssueRec) {
  return {
    id: rec.id,
    key: rec.key,
    summary: rec.summary,
    type: rec.type,
    priority: rec.priority,
    state: rec.state,
    assignee: rec.assignee,
    parent_id: rec.parentId,
    sprint_id: rec.sprint ? rec.sprint.id : null,
    estimate_points: rec.estimate,
    due_date: rec.due,
    tags: rec.tags,
    backlog_rank: rec.rank,
    updated_at: rec.updated,
  };
}

/** Live issues matching `where`, with `order` (may be empty). */
async function fetchIssues(sql: Sql, where: Frag, order: Frag): Promise<IssueRec[]> {
  const rows = await sql`
    SELECT ${issueCols(sql)} FROM issues i ${issueJoins(sql)}
     WHERE ${where} AND i.deleted_at IS NULL ${order}`;
  return rows.map(readIssueRec);
}

async function findIssueRec(sql: Sql, projectId: string, number: number): Promise<IssueRec | null> {
  const rows = await fetchIssues(
    sql,
    sql`i.project_id = ${projectId}::text::uuid AND i.number = ${number}::int`,
    sql``,
  );
  return rows[0] ?? null;
}

/** An issue whose project the viewer may see, with the viewer's access. Anything else is a 404. */
async function loadIssue(
  sql: Sql,
  me: Viewer,
  raw: string,
): Promise<{ projectId: string; issue: IssueRec } | Response> {
  const parsed = parseIssueKey(raw);
  if (!parsed) return noIssue();
  const loaded = await loadProject(sql, me, parsed.project);
  if (isResponse(loaded)) return loaded;
  const issue = await findIssueRec(sql, loaded.project.id, parsed.number);
  if (!issue) return noIssue();
  return { projectId: loaded.project.id, issue };
}

/** Parent, subtasks and links of an issue (Rust `find_issue`). */
async function issueDetail(sql: Sql, rec: IssueRec) {
  let parent = null;
  if (rec.parentId) {
    const found = await fetchIssues(sql, sql`i.id = ${rec.parentId}::text::uuid`, sql``);
    parent = found[0] ? summaryJson(found[0]) : null;
  }
  const subtasks = (
    await fetchIssues(sql, sql`i.parent_id = ${rec.id}::text::uuid`, sql`ORDER BY i.number`)
  ).map(summaryJson);
  const linkRows = await sql`
    SELECT l.id::text AS link_id, (l.source_id = ${rec.id}::text::uuid) AS outward, l.kind AS link_kind,
           ${issueCols(sql)}
      FROM issue_links l
      JOIN issues i ON i.id = CASE WHEN l.source_id = ${rec.id}::text::uuid THEN l.target_id ELSE l.source_id END
      ${issueJoins(sql)}
     WHERE (l.source_id = ${rec.id}::text::uuid OR l.target_id = ${rec.id}::text::uuid)
       AND l.deleted_at IS NULL AND i.deleted_at IS NULL
     ORDER BY l.created_at, l.id`;
  const links = linkRows.map((r) => {
    const outward = r["outward"] === true;
    const kind = r["link_kind"] as string;
    const [direction, label] = linkView(kind, outward);
    return {
      id: r["link_id"],
      kind,
      direction,
      label,
      issue: summaryJson(readIssueRec(r)),
    };
  });
  return { parent, subtasks, links };
}

/** Direction and label of a link as the viewer reads it (Rust `link_view`). */
function linkView(kind: string, outward: boolean): [string, string] {
  const direction = outward ? "outward" : "inward";
  let label = "relates to";
  if (kind === "blocks") label = outward ? "blocks" : "is blocked by";
  else if (kind === "duplicates") label = outward ? "duplicates" : "is duplicated by";
  return [direction, label];
}

/** Votes, stars and spent time for the viewer (Rust `issue_social`). */
async function socialOf(sql: Sql, issueId: string, viewerId: string) {
  const rows = await sql`
    SELECT (SELECT count(*) FROM issue_votes v WHERE v.issue_id = ${issueId}::text::uuid) AS votes,
           EXISTS (SELECT 1 FROM issue_votes v
                    WHERE v.issue_id = ${issueId}::text::uuid AND v.user_id = ${viewerId}::text::uuid) AS voted_by_me,
           EXISTS (SELECT 1 FROM issue_stars s
                    WHERE s.issue_id = ${issueId}::text::uuid AND s.user_id = ${viewerId}::text::uuid) AS starred_by_me,
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

/** Attachments with their download URL (`/v1/issues/{key}/attachments/{id}`). */
async function attachmentsOf(sql: Sql, issueId: string, issueKey: string) {
  const rows = await sql`
    SELECT a.id::text AS id, a.file_name AS file_name, a.content_type AS content_type, a.size_bytes AS size_bytes
      FROM issue_attachments a
     WHERE a.issue_id = ${issueId}::text::uuid AND a.deleted_at IS NULL
     ORDER BY a.created_at, a.id`;
  return rows.map((r) => ({
    id: r["id"],
    file_name: r["file_name"],
    content_type: r["content_type"],
    size_bytes: Number(r["size_bytes"]),
    url: `/v1/issues/${issueKey}/attachments/${r["id"]}`,
  }));
}

/* ---------- Issue list and the search query language ---------- */

type Scope = { viewer: string; allProjects: boolean; projectId: string | null };

/** `WHERE` for the caller's scope over `p` (the projects join). */
function scopeFrag(sql: Sql, scope: Scope): Frag {
  const parts: Frag[] = [sql`p.deleted_at IS NULL`];
  if (scope.projectId) parts.push(sql`p.id = ${scope.projectId}::text::uuid`);
  if (!scope.allProjects) {
    parts.push(sql`EXISTS (SELECT 1 FROM project_members sm WHERE sm.project_id = p.id
                            AND sm.user_id = ${scope.viewer}::text::uuid AND sm.deleted_at IS NULL)`);
  }
  return joinWith(sql, parts, "AND");
}

function joinWith(sql: Sql, parts: Frag[], op: "AND" | "OR" | ","): Frag {
  return parts.reduce((acc, part) => {
    if (op === "AND") return sql`${acc} AND ${part}`;
    if (op === "OR") return sql`${acc} OR ${part}`;
    return sql`${acc}, ${part}`;
  });
}

/** Sort order for an issue list (Rust `IssueSort`). */
type ListSort = "number" | "-number" | "rank" | "priority" | "updated";

function listOrder(sql: Sql, sort: ListSort): Frag {
  switch (sort) {
    case "number":
      return sql`ORDER BY i.number ASC`;
    case "-number":
      return sql`ORDER BY i.number DESC`;
    case "rank":
      return sql`ORDER BY i.backlog_rank COLLATE "C" ASC, i.number ASC`;
    case "priority":
      return sql`ORDER BY CASE i.priority WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 WHEN 'Normal' THEN 2 ELSE 3 END ASC, i.number ASC`;
    case "updated":
      return sql`ORDER BY i.updated_at DESC, i.number DESC`;
  }
}

/** One page of issues: at most `limit` items, and a cursor when more remain (Rust `page_of`). */
async function issuePage(sql: Sql, where: Frag, order: Frag, offset: number, limit: number) {
  const rows = await sql`
    SELECT ${issueCols(sql)} FROM issues i ${issueJoins(sql)}
     WHERE ${where} ${order}
     LIMIT ${limit + 1}::bigint OFFSET ${offset}::bigint`;
  const recs = rows.map(readIssueRec).map(summaryJson);
  if (recs.length > limit) {
    return { items: recs.slice(0, limit), next_cursor: String(offset + limit) };
  }
  return { items: recs, next_cursor: null };
}

/* Query language (rimelight_proto query.rs). */

type Span = { start: number; end: number };

/** A parse, or name-resolution, error. `display` matches the Rust `Display` text (with the column). */
class QueryError extends Error {
  span: Span;
  constructor(message: string, span: Span) {
    super(message);
    this.span = span;
  }
}

const spanTo = (a: Span, b: Span): Span => ({ start: a.start, end: Math.max(b.end, a.start) });

function displayError(err: QueryError): string {
  const first = err.span.start + 1;
  const last = Math.max(err.span.end, first);
  return last <= first
    ? `${err.message} (column ${first})`
    : `${err.message} (columns ${first}-${last})`;
}

const invalidQuery = (err: QueryError) =>
  json(
    {
      error: "invalid_query",
      message: displayError(err),
      span: { start: err.span.start, end: err.span.end },
    },
    400,
  );

type Value = { text: string; quoted: boolean; span: Span };
type Spanned<T> = { value: T; span: Span };
type CalDate = { year: number; month: number; day: number };
type Tok =
  | { k: "word"; text: string }
  | { k: "quoted"; text: string }
  | { k: "colon" }
  | { k: "comma" }
  | { k: "range" };
type Token = { tok: Tok; span: Span };

const FIELD_NAMES = [
  "project",
  "state",
  "assignee",
  "reporter",
  "type",
  "priority",
  "sprint",
  "tag",
  "parent",
  "created",
  "updated",
  "resolved",
  "estimate",
  "has",
] as const;
type FieldName = (typeof FIELD_NAMES)[number];

type StateRef = { k: "name"; name: string } | { k: "category"; unresolved: boolean };
type DateExpr = { k: "day"; d: CalDate } | { k: "today" } | { k: "ago"; n: number };
type DateItem = { k: "day"; e: DateExpr } | { k: "range"; a: DateExpr; b: DateExpr };
type NumItem =
  | { k: "exact"; n: number }
  | { k: "less"; n: number }
  | { k: "lesseq"; n: number }
  | { k: "more"; n: number }
  | { k: "moreeq"; n: number }
  | { k: "between"; lo: number; hi: number };
type DateField = "created" | "updated" | "resolved";
type HasKind = "assignee" | "estimate" | "sprint" | "subtasks" | "links";

type Body =
  | { k: "text"; v: Value }
  | { k: "tag"; vs: Value[] }
  | { k: "project"; vs: Value[] }
  | { k: "state"; vs: Spanned<StateRef>[] }
  | { k: "assignee"; vs: Value[] }
  | { k: "reporter"; vs: Value[] }
  | { k: "type"; vs: Value[] }
  | { k: "priority"; vs: Value[] }
  | { k: "sprint"; vs: Value[] }
  | { k: "parent"; vs: Value[] }
  | { k: "date"; field: DateField; items: Spanned<DateItem>[] }
  | { k: "estimate"; items: Spanned<NumItem>[] }
  | { k: "has"; items: Spanned<HasKind>[] };

type Clause = { negated: boolean; span: Span; body: Body };
type SortField = "priority" | "updated" | "created" | "resolved" | "estimate" | "state" | "key";
type SortKey = { field: SortField; descending: boolean; span: Span };
type Query = { clauses: Clause[]; sort: SortKey[] };

type Item = { k: "single"; v: Value } | { k: "range"; a: Value; b: Value };

function lex(input: string): Token[] {
  const chars = Array.from(input);
  const out: Token[] = [];
  let i = 0;
  while (i < chars.length) {
    const c = chars[i] ?? "";
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    const start = i;
    if (c === '"') {
      let close = -1;
      for (let j = i + 1; j < chars.length; j++) {
        if (chars[j] === '"') {
          close = j;
          break;
        }
      }
      if (close < 0) {
        throw new QueryError("A quoted phrase is missing its closing quote", {
          start,
          end: chars.length,
        });
      }
      const text = chars.slice(i + 1, close).join("");
      i = close + 1;
      out.push({ tok: { k: "quoted", text }, span: { start, end: i } });
    } else if (c === ":") {
      i += 1;
      out.push({ tok: { k: "colon" }, span: { start, end: i } });
    } else if (c === ",") {
      i += 1;
      out.push({ tok: { k: "comma" }, span: { start, end: i } });
    } else if (c === "." && chars[i + 1] === ".") {
      i += 2;
      out.push({ tok: { k: "range" }, span: { start, end: i } });
    } else {
      while (i < chars.length) {
        const ch = chars[i] ?? "";
        const rangeHere = ch === "." && chars[i + 1] === "." && i > start;
        if (/\s/.test(ch) || ch === ":" || ch === "," || ch === '"' || rangeHere) break;
        i += 1;
      }
      out.push({
        tok: { k: "word", text: chars.slice(start, i).join("") },
        span: { start, end: i },
      });
    }
  }
  return out;
}

function fieldFromName(name: string): FieldName | null {
  const lower = asciiLower(name);
  return (FIELD_NAMES as readonly string[]).includes(lower) ? (lower as FieldName) : null;
}

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 0; i < a.length; i++) {
    const cur = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      cur.push(Math.min((prev[j] ?? 0) + cost, (prev[j + 1] ?? 0) + 1, (cur[j] ?? 0) + 1));
    }
    prev = cur;
  }
  return prev[b.length] ?? 0;
}

function unknownFieldMessage(word: string): string {
  const lower = asciiLower(word);
  let best: { d: number; name: string } | null = null;
  for (const name of FIELD_NAMES) {
    const d = editDistance(lower, name);
    if (d <= 2 && (best === null || d < best.d)) best = { d, name };
  }
  const suggestion = best ? `. Did you mean \`${best.name}\`?` : "";
  return `Unknown field \`${word}\`${suggestion} Fields: ${FIELD_NAMES.join(", ")}`;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private readonly end: number;

  constructor(tokens: Token[], end: number) {
    this.tokens = tokens;
    this.end = end;
  }

  private done(): boolean {
    return this.pos >= this.tokens.length;
  }

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  private here(): Span {
    const t = this.peek();
    return t ? t.span : { start: this.end, end: this.end };
  }

  private static isWord(t: Token | undefined, word: string): boolean {
    return t?.tok.k === "word" && asciiLower(t.tok.text) === word;
  }

  private static kindIs(t: Token | undefined, k: Tok["k"]): boolean {
    return t?.tok.k === k;
  }

  private atSort(): boolean {
    return (
      Parser.isWord(this.peek(), "sort") &&
      Parser.isWord(this.peek(1), "by") &&
      Parser.kindIs(this.peek(2), "colon")
    );
  }

  run(): Query {
    const query: Query = { clauses: [], sort: [] };
    while (!this.done()) {
      if (this.atSort()) query.sort.push(...this.sort());
      else query.clauses.push(this.clause());
    }
    return query;
  }

  private sort(): SortKey[] {
    const keyword = this.here();
    this.pos += 3;
    const keys: SortKey[] = [];
    for (;;) {
      const t = this.peek();
      if (t?.tok.k !== "word") {
        throw new QueryError("Expected a sort field after `sort by:`", t ? t.span : keyword);
      }
      const word = t.tok.text;
      const field = sortFieldFromName(word);
      if (!field) {
        throw new QueryError(
          `Unknown sort field \`${word}\`. Use priority, updated, created, resolved, estimate, state or key`,
          t.span,
        );
      }
      this.pos += 1;
      let descending = false;
      let last = t.span;
      const dir = this.peek();
      if (
        dir?.tok.k === "word" &&
        (asciiLower(dir.tok.text) === "desc" || asciiLower(dir.tok.text) === "asc")
      ) {
        descending = asciiLower(dir.tok.text) === "desc";
        last = dir.span;
        this.pos += 1;
      }
      keys.push({ field, descending, span: spanTo(t.span, last) });
      if (Parser.kindIs(this.peek(), "comma")) this.pos += 1;
      else break;
    }
    return keys;
  }

  private clause(): Clause {
    let negated = false;
    let first = this.here();
    if (Parser.isWord(this.peek(), "not") && !Parser.kindIs(this.peek(1), "colon")) {
      negated = true;
      this.pos += 1;
      if (this.done()) throw new QueryError("`not` needs a term after it", first);
    }
    const t = this.peek();
    if (t?.tok.k === "word" && t.tok.text.startsWith("-")) {
      const rest = t.tok.text.slice(1);
      if (rest === "") throw new QueryError("`-` needs a term after it", t.span);
      negated = !negated;
      first = t.span;
      this.tokens[this.pos] = {
        tok: { k: "word", text: rest },
        span: { start: t.span.start + 1, end: t.span.end },
      };
    }
    const [body, last] = this.body();
    return { negated, span: spanTo(first, last), body };
  }

  private body(): [Body, Span] {
    const t = this.peek();
    if (!t) throw new QueryError("Expected a search term", this.here());
    if (t.tok.k === "quoted") {
      this.pos += 1;
      return [{ k: "text", v: { text: t.tok.text, quoted: true, span: t.span } }, t.span];
    }
    if (t.tok.k === "word") {
      const word = t.tok.text;
      if (Parser.kindIs(this.peek(1), "colon")) {
        const field = fieldFromName(word);
        if (!field) throw new QueryError(unknownFieldMessage(word), t.span);
        this.pos += 2;
        return this.fieldBody(field, t.span);
      }
      if (word.startsWith("#")) {
        const tag = word.slice(1);
        if (tag === "") throw new QueryError("`#` needs a tag name after it", t.span);
        this.pos += 1;
        const value: Value = {
          text: tag,
          quoted: false,
          span: { start: t.span.start + 1, end: t.span.end },
        };
        return [{ k: "tag", vs: [value] }, t.span];
      }
      this.pos += 1;
      return [{ k: "text", v: { text: word, quoted: false, span: t.span } }, t.span];
    }
    if (t.tok.k === "colon")
      throw new QueryError("Unexpected `:` with no field name before it", t.span);
    if (t.tok.k === "comma") throw new QueryError("Unexpected `,`", t.span);
    throw new QueryError("Unexpected `..`", t.span);
  }

  private fieldBody(field: FieldName, fieldSpan: Span): [Body, Span] {
    const colonSpan = { start: fieldSpan.end, end: fieldSpan.end + 1 };
    const items: [Item, Span][] = [];
    for (;;) {
      const first = this.value();
      if (!first) {
        throw new QueryError(`Expected a value after \`${field}:\``, this.missingSpan(colonSpan));
      }
      let item: Item;
      let itemSpan: Span;
      if (Parser.kindIs(this.peek(), "range")) {
        this.pos += 1;
        const second = this.value();
        if (!second)
          throw new QueryError("Expected a value after `..`", this.missingSpan(first.span));
        itemSpan = spanTo(first.span, second.span);
        item = { k: "range", a: first, b: second };
      } else {
        itemSpan = first.span;
        item = { k: "single", v: first };
      }
      items.push([item, itemSpan]);
      if (Parser.kindIs(this.peek(), "comma")) this.pos += 1;
      else break;
    }
    const last = items[items.length - 1]?.[1] ?? fieldSpan;
    const span = spanTo(fieldSpan, last);
    const onlyItems = items.map(([item, s]) => ({ item, span: s }));
    let body: Body;
    switch (field) {
      case "project":
        body = { k: "project", vs: singles(field, onlyItems, checkProject) };
        break;
      case "state":
        body = { k: "state", vs: statesOf(onlyItems) };
        break;
      case "assignee":
        body = { k: "assignee", vs: singles(field, onlyItems, (v) => v) };
        break;
      case "reporter":
        body = { k: "reporter", vs: singles(field, onlyItems, (v) => v) };
        break;
      case "type":
        body = {
          k: "type",
          vs: singles(field, onlyItems, (v) => checkChoice(v, "type", ISSUE_TYPES)),
        };
        break;
      case "priority":
        body = {
          k: "priority",
          vs: singles(field, onlyItems, (v) => checkChoice(v, "priority", PRIORITIES)),
        };
        break;
      case "sprint":
        body = { k: "sprint", vs: singles(field, onlyItems, (v) => v) };
        break;
      case "parent":
        body = { k: "parent", vs: singles(field, onlyItems, checkIssueKey) };
        break;
      case "tag":
        body = {
          k: "tag",
          vs: singles(field, onlyItems, (v) => {
            const text = v.text.startsWith("#") ? v.text.slice(1) : v.text;
            if (text === "") throw new QueryError("A tag needs a name", v.span);
            return { ...v, text };
          }),
        };
        break;
      case "created":
      case "updated":
      case "resolved":
        body = { k: "date", field, items: datesOf(onlyItems) };
        break;
      case "estimate":
        body = { k: "estimate", items: estimatesOf(onlyItems) };
        break;
      case "has":
        body = { k: "has", items: hasKindsOf(onlyItems) };
        break;
    }
    return [body, span];
  }

  private missingSpan(after: Span): Span {
    const t = this.peek();
    return t ? t.span : { start: after.end, end: after.end };
  }

  /** One value: a phrase, or unquoted words joined by spaces (stops before a field, `-`, `not`, `sort by:`). */
  private value(): Value | null {
    const t = this.peek();
    if (!t) return null;
    if (t.tok.k === "quoted") {
      this.pos += 1;
      return { text: t.tok.text, quoted: true, span: t.span };
    }
    if (t.tok.k !== "word") return null;
    this.pos += 1;
    let text = t.tok.text;
    let last = t.span;
    for (;;) {
      const next = this.peek();
      if (next?.tok.k !== "word") break;
      const word = next.tok.text;
      const followedByColon = Parser.kindIs(this.peek(1), "colon");
      const sortFollows =
        asciiLower(word) === "sort" &&
        Parser.isWord(this.peek(1), "by") &&
        Parser.kindIs(this.peek(2), "colon");
      if (followedByColon || sortFollows || word.startsWith("-") || asciiLower(word) === "not")
        break;
      text = `${text} ${word}`;
      last = next.span;
      this.pos += 1;
    }
    return { text, quoted: false, span: spanTo(t.span, last) };
  }
}

function sortFieldFromName(name: string): SortField | null {
  switch (asciiLower(name)) {
    case "priority":
      return "priority";
    case "updated":
      return "updated";
    case "created":
      return "created";
    case "resolved":
      return "resolved";
    case "estimate":
      return "estimate";
    case "state":
      return "state";
    case "key":
    case "number":
      return "key";
    default:
      return null;
  }
}

/** Single values only: a range is refused for this field. */
function singles(
  field: string,
  items: { item: Item; span: Span }[],
  check: (v: Value) => Value,
): Value[] {
  return items.map(({ item }) => {
    if (item.k === "range")
      throw new QueryError(`\`${field}:\` does not take a range`, item.b.span);
    return check(item.v);
  });
}

function checkProject(v: Value): Value {
  const key = asciiUpper(v.text);
  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(key)) {
    throw new QueryError(
      `\`${v.text}\` is not a project key. Use letters and digits, such as EMB`,
      v.span,
    );
  }
  return { ...v, text: key };
}

function checkChoice(v: Value, what: string, allowed: string[]): Value {
  const lower = asciiLower(v.text);
  const canonical = allowed.find((a) => asciiLower(a) === lower);
  if (canonical === undefined) {
    throw new QueryError(`\`${v.text}\` is not a ${what}. Use ${allowed.join(", ")}`, v.span);
  }
  return { ...v, text: canonical };
}

/** `EMB-12`: the project part is checked after upper-casing (as check_project), the number must be 1 or more. */
function checkIssueKey(v: Value): Value {
  const bad = () => new QueryError("Expected an issue key such as EMB-12", v.span);
  const dash = v.text.lastIndexOf("-");
  if (dash < 0) throw bad();
  const project = asciiUpper(v.text.slice(0, dash));
  const number = v.text.slice(dash + 1);
  if (!VALID_PROJECT_KEY.test(project)) throw bad();
  const n = /^[0-9]+$/.test(number) ? parseU32(number) : null;
  if (n === null || n < 1) throw bad();
  return { ...v, text: `${project}-${number}` };
}

function statesOf(items: { item: Item; span: Span }[]): Spanned<StateRef>[] {
  return singles("state", items, (v) => v).map((v) => {
    if (v.text.startsWith("#")) {
      const name = v.text.slice(1);
      const lower = asciiLower(name);
      if (lower !== "unresolved" && lower !== "resolved") {
        throw new QueryError(
          `\`${v.text}\` is not a state category. Use #Unresolved or #Resolved, or a state name`,
          v.span,
        );
      }
      return { value: { k: "category", unresolved: lower === "unresolved" }, span: v.span };
    }
    return { value: { k: "name", name: v.text }, span: v.span };
  });
}

/** `YYYY-MM-DD` with a real calendar day, or null. */
function parseCalDate(text: string): CalDate | null {
  const parts = text.split("-");
  if (parts.length !== 3) return null;
  const [y = "", m = "", d = ""] = parts;
  if (y.length !== 4 || m.length !== 2 || d.length !== 2) return null;
  if (!/^[0-9]+$/.test(y + m + d)) return null;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Days since 1970-01-01 (proleptic Gregorian, UTC). */
function unixDay(d: CalDate): number {
  const t = new Date(0);
  t.setUTCFullYear(d.year, d.month - 1, d.day);
  return Math.floor(t.getTime() / (DAY * 1000));
}

function fromUnixDay(days: number): CalDate {
  const t = new Date(days * DAY * 1000);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

function parseDateExpr(v: Value): DateExpr {
  const text = v.text;
  if (asciiLower(text) === "today") return { k: "today" };
  if (text.startsWith("-") && text.endsWith("d")) {
    const digits = text.slice(1, -1);
    if (/^[0-9]+$/.test(digits) && parseU32(digits) !== null)
      return { k: "ago", n: Number(digits) };
  }
  const d = parseCalDate(text);
  if (!d) {
    throw new QueryError(
      `\`${text}\` is not a date. Use YYYY-MM-DD, today, or -Nd such as -7d`,
      v.span,
    );
  }
  return { k: "day", d };
}

function datesOf(items: { item: Item; span: Span }[]): Spanned<DateItem>[] {
  return items.map(({ item, span }) => {
    if (item.k === "single") return { value: { k: "day", e: parseDateExpr(item.v) }, span };
    return { value: { k: "range", a: parseDateExpr(item.a), b: parseDateExpr(item.b) }, span };
  });
}

function parseNumber(text: string, span: Span): number {
  const t = text.trim();
  const n = /^\+?[0-9]+$/.test(t) ? parseU32(t) : null;
  if (n === null) {
    throw new QueryError(`\`${t}\` is not a number. Use 5, >3, <=2 or 2 .. 5`, span);
  }
  return n;
}

function estimatesOf(items: { item: Item; span: Span }[]): Spanned<NumItem>[] {
  return items.map(({ item, span }) => {
    if (item.k === "range") {
      const lo = parseNumber(item.a.text, item.a.span);
      const hi = parseNumber(item.b.text, item.b.span);
      if (lo > hi) throw new QueryError("The range starts above where it ends", span);
      return { value: { k: "between", lo, hi }, span };
    }
    const text = item.v.text.trim();
    const op = [">=", "<=", ">", "<", "="].find((o) => text.startsWith(o));
    const n = parseNumber(op ? text.slice(op.length) : text, item.v.span);
    let value: NumItem;
    if (op === ">=") value = { k: "moreeq", n };
    else if (op === "<=") value = { k: "lesseq", n };
    else if (op === ">") value = { k: "more", n };
    else if (op === "<") value = { k: "less", n };
    else value = { k: "exact", n };
    return { value, span };
  });
}

function hasKindsOf(items: { item: Item; span: Span }[]): Spanned<HasKind>[] {
  return singles("has", items, (v) => v).map((v) => {
    const lower = asciiLower(v.text);
    if (!["assignee", "estimate", "sprint", "subtasks", "links"].includes(lower)) {
      throw new QueryError(
        `\`${v.text}\` is not a \`has:\` kind. Use assignee, estimate, sprint, subtasks or links`,
        v.span,
      );
    }
    return { value: lower as HasKind, span: v.span };
  });
}

/** Parses a query. A blank query is valid and matches everything. */
function parseQuery(input: string): Query {
  const tokens = lex(input);
  return new Parser(tokens, Array.from(input).length).run();
}

/* Resolution against the caller's data (search.rs). */

type Person = { id: string; email: string | null; name: string };
type Known = { projects: string[]; states: string[]; sprints: string[]; people: Person[] };

type Leaf =
  | { k: "text"; t: string }
  | { k: "tag"; t: string }
  | { k: "project"; key: string }
  | { k: "state"; name: string }
  | { k: "category"; unresolved: boolean }
  | { k: "assignee"; id: string | null }
  | { k: "reporter"; id: string }
  | { k: "type"; t: string }
  | { k: "priority"; p: string }
  | { k: "sprint"; name: string }
  | { k: "sprintCurrent" }
  | { k: "parent"; key: string; number: number }
  | { k: "date"; field: DateField; from: number; until: number }
  | { k: "estimate"; min: number | null; max: number | null }
  | { k: "has"; kind: HasKind };

type Pred =
  | { k: "all"; ps: Pred[] }
  | { k: "any"; ps: Pred[] }
  | { k: "not"; p: Pred }
  | { k: "leaf"; l: Leaf };

type Plan = { filter: Pred; sort: SortKey[] };

function unknownName(what: string, v: Value): QueryError {
  return new QueryError(`No ${what} named \`${v.text}\` in the projects you can search`, v.span);
}

function planQuery(query: Query, known: Known, viewer: string, now: number): Plan {
  const today = fromUnixDay(Math.floor(now / 86_400));
  const clauses = query.clauses.map((clause): Pred => {
    const pred = clausePred(clause.body, known, viewer, today);
    return clause.negated ? { k: "not", p: pred } : pred;
  });
  return { filter: { k: "all", ps: clauses }, sort: query.sort };
}

function clausePred(body: Body, known: Known, viewer: string, today: CalDate): Pred {
  const leaves: Pred[] = [];
  switch (body.k) {
    case "text":
      leaves.push({ k: "leaf", l: { k: "text", t: body.v.text.toLowerCase() } });
      break;
    case "tag":
      for (const v of body.vs) leaves.push({ k: "leaf", l: { k: "tag", t: v.text.toLowerCase() } });
      break;
    case "project":
      for (const v of body.vs) {
        if (!known.projects.includes(v.text)) throw unknownName("project", v);
        leaves.push({ k: "leaf", l: { k: "project", key: v.text } });
      }
      break;
    case "state":
      for (const { value, span } of body.vs) {
        if (value.k === "category") {
          leaves.push({ k: "leaf", l: { k: "category", unresolved: value.unresolved } });
          continue;
        }
        const lower = value.name.toLowerCase();
        if (!known.states.includes(lower)) {
          throw new QueryError(
            `No workflow state named \`${value.name}\` in the projects you can search`,
            span,
          );
        }
        leaves.push({ k: "leaf", l: { k: "state", name: lower } });
      }
      break;
    case "assignee":
      leaves.push(...peopleLeaves(body.vs, known, viewer, true));
      break;
    case "reporter":
      leaves.push(...peopleLeaves(body.vs, known, viewer, false));
      break;
    case "type":
      for (const v of body.vs) leaves.push({ k: "leaf", l: { k: "type", t: v.text } });
      break;
    case "priority":
      for (const v of body.vs) leaves.push({ k: "leaf", l: { k: "priority", p: v.text } });
      break;
    case "sprint":
      for (const v of body.vs) {
        if (asciiLower(v.text) === "current") {
          leaves.push({ k: "leaf", l: { k: "sprintCurrent" } });
          continue;
        }
        const name = v.text.toLowerCase();
        if (!known.sprints.includes(name)) throw unknownName("sprint", v);
        leaves.push({ k: "leaf", l: { k: "sprint", name } });
      }
      break;
    case "parent":
      for (const v of body.vs) {
        const dash = v.text.lastIndexOf("-");
        if (dash < 0) throw unknownName("issue", v);
        const number = parseU32(v.text.slice(dash + 1));
        if (number === null) throw unknownName("issue", v);
        const key = v.text.slice(0, dash);
        if (!known.projects.includes(key)) {
          throw new QueryError(
            `No project named \`${key}\` in the projects you can search`,
            v.span,
          );
        }
        leaves.push({ k: "leaf", l: { k: "parent", key, number } });
      }
      break;
    case "date":
      for (const { value, span } of body.items) {
        leaves.push({ k: "leaf", l: dateLeaf(body.field, value, span, today) });
      }
      break;
    case "estimate":
      for (const { value } of body.items) {
        let min: number | null;
        let max: number | null;
        switch (value.k) {
          case "exact":
            [min, max] = [value.n, value.n];
            break;
          case "less":
            [min, max] = [null, value.n - 1];
            break;
          case "lesseq":
            [min, max] = [null, value.n];
            break;
          case "more":
            [min, max] = [value.n + 1, null];
            break;
          case "moreeq":
            [min, max] = [value.n, null];
            break;
          case "between":
            [min, max] = [value.lo, value.hi];
            break;
        }
        leaves.push({ k: "leaf", l: { k: "estimate", min, max } });
      }
      break;
    case "has":
      for (const { value } of body.items) leaves.push({ k: "leaf", l: { k: "has", kind: value } });
      break;
  }
  return { k: "any", ps: leaves };
}

function peopleLeaves(vs: Value[], known: Known, viewer: string, allowUnassigned: boolean): Pred[] {
  const out: Pred[] = [];
  for (const v of vs) {
    const lower = v.text.toLowerCase();
    if (lower === "me") {
      out.push({
        k: "leaf",
        l: allowUnassigned ? { k: "assignee", id: viewer } : { k: "reporter", id: viewer },
      });
      continue;
    }
    if (allowUnassigned && lower === "unassigned") {
      out.push({ k: "leaf", l: { k: "assignee", id: null } });
      continue;
    }
    const matches = known.people.filter((p) => p.name === lower || p.email === lower);
    if (matches.length === 0) throw unknownName("person", v);
    for (const p of matches) {
      out.push({
        k: "leaf",
        l: allowUnassigned ? { k: "assignee", id: p.id } : { k: "reporter", id: p.id },
      });
    }
  }
  return out;
}

function dayStart(expr: DateExpr, today: CalDate): number {
  if (expr.k === "day") return unixDay(expr.d) * DAY;
  if (expr.k === "today") return unixDay(today) * DAY;
  return (unixDay(today) - expr.n) * DAY;
}

function dateLeaf(field: DateField, item: DateItem, span: Span, today: CalDate): Leaf {
  let from: number;
  let until: number;
  if (item.k === "day") {
    from = dayStart(item.e, today);
    until = from + DAY;
  } else {
    const start = dayStart(item.a, today);
    const end = dayStart(item.b, today);
    if (start > end) throw new QueryError("The date range ends before it starts", span);
    from = start;
    until = end + DAY;
  }
  return { k: "date", field, from, until };
}

/* Known names within the scope (pg_projects search_context). */

async function searchContext(sql: Sql, scope: Scope): Promise<Known> {
  const projectRows =
    await sql`SELECT p.key AS key FROM projects p WHERE ${scopeFrag(sql, scope)} ORDER BY p.key`;
  const stateRows = await sql`
    SELECT DISTINCT lower(ws.name) AS name FROM workflow_states ws
      JOIN projects p ON p.id = ws.project_id
     WHERE ws.deleted_at IS NULL AND ${scopeFrag(sql, scope)}`;
  const sprintRows = await sql`
    SELECT DISTINCT lower(sp.name) AS name FROM sprints sp
      JOIN projects p ON p.id = sp.project_id
     WHERE sp.deleted_at IS NULL AND ${scopeFrag(sql, scope)}`;
  const peopleRows = await sql`
    SELECT DISTINCT u.id::text AS id, lower(u.email) AS email, lower(u.name) AS name
      FROM project_members m
      JOIN projects p ON p.id = m.project_id
      JOIN employees u ON u.id = m.user_id
     WHERE m.deleted_at IS NULL AND u.deleted_at IS NULL AND ${scopeFrag(sql, scope)}`;
  return {
    projects: projectRows.map((r) => r["key"]),
    states: stateRows.map((r) => r["name"]),
    sprints: sprintRows.map((r) => r["name"]),
    people: peopleRows.map((r) => ({ id: r["id"], email: r["email"], name: r["name"] })),
  };
}

/* Predicate and sort as SQL. Every value is a bound parameter; only fixed keywords are literal. */

function likeContains(term: string): string {
  return `%${term.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

function leafSql(sql: Sql, leaf: Leaf): Frag {
  switch (leaf.k) {
    case "text": {
      const pattern = likeContains(leaf.t);
      return sql`(i.summary ILIKE ${pattern} OR i.description ILIKE ${pattern})`;
    }
    case "tag": {
      const t = leaf.t;
      return sql`EXISTS (SELECT 1 FROM unnest(i.tags) AS tg WHERE lower(tg) = ${t})`;
    }
    case "project": {
      const key = leaf.key;
      return sql`p.key = ${key}`;
    }
    case "state": {
      const name = leaf.name;
      return sql`lower(ws.name) = ${name}`;
    }
    case "category": {
      const states = leaf.unresolved ? ["Unstarted", "Started"] : ["Done", "Cancelled"];
      return sql`ws.category = ANY(${states}::text[])`;
    }
    case "assignee":
      if (leaf.id === null) return sql`i.assignee_id IS NULL`;
      return sql`i.assignee_id = ${leaf.id}::text::uuid`;
    case "reporter": {
      const id = leaf.id;
      return sql`i.reporter_id = ${id}::text::uuid`;
    }
    case "type": {
      const t = leaf.t;
      return sql`i.type = ${t}`;
    }
    case "priority": {
      const p = leaf.p;
      return sql`i.priority = ${p}`;
    }
    case "sprint": {
      const name = leaf.name;
      return sql`lower(sp.name) = ${name}`;
    }
    case "sprintCurrent":
      return sql`sp.state = 'Active'`;
    case "parent": {
      const key = leaf.key;
      const number = leaf.number;
      return sql`i.parent_id IN (SELECT pi.id FROM issues pi JOIN projects pp ON pp.id = pi.project_id
                 WHERE pp.key = ${key} AND pi.number = ${number}::int AND pi.deleted_at IS NULL)`;
    }
    case "date": {
      const col =
        leaf.field === "created"
          ? sql`i.created_at`
          : leaf.field === "updated"
            ? sql`i.updated_at`
            : sql`i.resolved_at`;
      const { from, until } = leaf;
      return sql`(EXTRACT(EPOCH FROM ${col})::bigint >= ${from}::bigint AND EXTRACT(EPOCH FROM ${col})::bigint < ${until}::bigint)`;
    }
    case "estimate": {
      const parts: Frag[] = [sql`i.estimate_points IS NOT NULL`];
      if (leaf.min !== null) parts.push(sql`i.estimate_points >= ${leaf.min}::bigint`);
      if (leaf.max !== null) parts.push(sql`i.estimate_points <= ${leaf.max}::bigint`);
      return sql`(${joinWith(sql, parts, "AND")})`;
    }
    case "has":
      switch (leaf.kind) {
        case "assignee":
          return sql`i.assignee_id IS NOT NULL`;
        case "estimate":
          return sql`i.estimate_points IS NOT NULL`;
        case "sprint":
          return sql`i.sprint_id IS NOT NULL`;
        case "subtasks":
          return sql`EXISTS (SELECT 1 FROM issues ch WHERE ch.parent_id = i.id AND ch.deleted_at IS NULL)`;
        case "links":
          return sql`EXISTS (SELECT 1 FROM issue_links il WHERE (il.source_id = i.id OR il.target_id = i.id)
                       AND il.deleted_at IS NULL)`;
      }
  }
}

function predSql(sql: Sql, pred: Pred): Frag {
  switch (pred.k) {
    case "all":
      return pred.ps.length === 0
        ? sql`TRUE`
        : sql`(${joinWith(
            sql,
            pred.ps.map((p) => predSql(sql, p)),
            "AND",
          )})`;
    case "any":
      return pred.ps.length === 0
        ? sql`FALSE`
        : sql`(${joinWith(
            sql,
            pred.ps.map((p) => predSql(sql, p)),
            "OR",
          )})`;
    case "not":
      return sql`NOT COALESCE(${predSql(sql, pred.p)}, FALSE)`;
    case "leaf":
      return leafSql(sql, pred.l);
  }
}

/** ORDER BY for the sort keys, then project key and number. Nullable columns sort last. */
function orderSql(sql: Sql, sort: SortKey[]): Frag {
  const parts: Frag[] = sort.map((key) => {
    const dir = key.descending ? sql`DESC` : sql`ASC`;
    switch (key.field) {
      case "priority":
        return sql`CASE i.priority WHEN 'Critical' THEN 4 WHEN 'High' THEN 3 WHEN 'Normal' THEN 2 ELSE 1 END ${dir}`;
      case "updated":
        return sql`i.updated_at ${dir}`;
      case "created":
        return sql`i.created_at ${dir}`;
      case "resolved":
        return sql`i.resolved_at ${dir} NULLS LAST`;
      case "estimate":
        return sql`i.estimate_points ${dir} NULLS LAST`;
      case "state":
        return sql`ws.position ${dir}`;
      case "key":
        return sql`p.key ${dir}, i.number ${dir}`;
    }
  });
  parts.push(sql`p.key ASC`, sql`i.number ASC`);
  return sql`ORDER BY ${joinWith(sql, parts, ",")}`;
}

/** Resolves `q` in the scope and returns one page (Rust `run_search`). */
async function runSearch(c: Context, sql: Sql, scope: Scope): Promise<Response> {
  const window = pageWindow(c);
  if (window instanceof Response) return window;
  let plan: Plan;
  let where: Frag;
  try {
    const query = parseQuery(c.req.query("q") ?? "");
    const known = await searchContext(sql, scope);
    plan = planQuery(query, known, scope.viewer, Math.floor(Date.now() / 1000));
    where = sql`${scopeFrag(sql, scope)} AND i.deleted_at IS NULL AND ${predSql(sql, plan.filter)}`;
  } catch (err) {
    if (err instanceof QueryError) return invalidQuery(err);
    throw err;
  }
  const order = orderSql(sql, plan.sort);
  return json(await issuePage(sql, where, order, window.offset, window.limit));
}

/** The structured issue-list filters (Rust `issue_query`). */
async function issueListQuery(
  c: Context,
  sql: Sql,
  projectId: string,
  projectKey: string,
): Promise<{ where: Frag; order: Frag; offset: number; limit: number } | Response> {
  const param = (name: string) => {
    const v = c.req.query(name)?.trim();
    return v ? v : undefined;
  };
  let stateId: string | undefined;
  const stateRaw = param("state");
  if (stateRaw !== undefined) {
    const id = idArg("state", stateRaw);
    if (id instanceof Response) return id;
    const workflow = await workflowOf(sql, projectId);
    if (!workflow.some((s) => s.id === id))
      return invalid("state", "is not a workflow state of this project");
    stateId = id;
  }
  let assigneeId: string | undefined;
  const assigneeRaw = param("assignee");
  if (assigneeRaw !== undefined) {
    const id = idArg("assignee", assigneeRaw);
    if (id instanceof Response) return id;
    assigneeId = id;
  }
  let issueType: string | undefined;
  const typeRaw = param("type");
  if (typeRaw !== undefined) {
    issueType = ISSUE_TYPES.find((t) => asciiLower(t) === asciiLower(typeRaw));
    if (issueType === undefined) return invalid("type", `use one of: ${ISSUE_TYPES.join(", ")}`);
  }
  let priority: string | undefined;
  const priorityRaw = param("priority");
  if (priorityRaw !== undefined) {
    priority = PRIORITIES.find((p) => asciiLower(p) === asciiLower(priorityRaw));
    if (priority === undefined) return invalid("priority", `use one of: ${PRIORITIES.join(", ")}`);
  }
  let sprintId: string | undefined;
  let backlogOnly = false;
  const sprintRaw = param("sprint");
  if (sprintRaw === "none") {
    backlogOnly = true;
  } else if (sprintRaw !== undefined) {
    const id = idArg("sprint", sprintRaw);
    if (id instanceof Response) return id;
    sprintId = id;
  }
  let parentId: string | undefined;
  const parentRaw = param("parent");
  if (parentRaw !== undefined) {
    const parsed = parseIssueKey(parentRaw);
    if (!parsed) return invalid("parent", "use an issue key such as EMB-12");
    if (parsed.project !== projectKey) return invalid("parent", "is an issue in another project");
    const parent = await findIssueRec(sql, projectId, parsed.number);
    if (!parent) return invalid("parent", "is not an issue in this project");
    parentId = parent.id;
  }
  const sortRaw = c.req.query("sort") ?? "number";
  const sorts: ListSort[] = ["number", "-number", "rank", "priority", "updated"];
  if (!(sorts as string[]).includes(sortRaw)) {
    return invalid("sort", "use number, -number, rank, priority or updated");
  }
  const window = pageWindow(c);
  if (window instanceof Response) return window;

  let where = sql`i.project_id = ${projectId}::text::uuid AND i.deleted_at IS NULL`;
  if (stateId) where = sql`${where} AND i.state_id = ${stateId}::text::uuid`;
  if (assigneeId) where = sql`${where} AND i.assignee_id = ${assigneeId}::text::uuid`;
  if (issueType) where = sql`${where} AND i.type = ${issueType}`;
  if (priority) where = sql`${where} AND i.priority = ${priority}`;
  if (parentId) where = sql`${where} AND i.parent_id = ${parentId}::text::uuid`;
  if (backlogOnly) where = sql`${where} AND i.sprint_id IS NULL`;
  if (sprintId) where = sql`${where} AND i.sprint_id = ${sprintId}::text::uuid`;
  return {
    where,
    order: listOrder(sql, sortRaw as ListSort),
    offset: window.offset,
    limit: window.limit,
  };
}

/** Up to five live issues whose summary holds the most of the summary's words (Rust `similar_issues`). */
function similarWords(summary: string): string[] {
  const words: string[] = [];
  for (const raw of summary.split(/[^A-Za-z0-9]+/)) {
    const word = asciiLower(raw);
    if (word.length >= 2 && !words.includes(word)) words.push(word);
    if (words.length === SIMILAR_WORDS_MAX) break;
  }
  return words;
}

/* ---------- Routes ---------- */

/** GET /projects: the caller's projects, or every project for a global admin. */
projectsRead.get("/projects", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const rows = await sql`
      SELECT p.id::text AS id, p.key AS key, p.name AS name, p.lead_id::text AS lead_id,
             lu.name AS lead_name, m.role AS my_role, p.image_key AS image_key
        FROM projects p
        LEFT JOIN employees lu ON lu.id = p.lead_id
        LEFT JOIN project_members m ON m.project_id = p.id
                                   AND m.user_id = ${me.id}::text::uuid AND m.deleted_at IS NULL
       WHERE p.deleted_at IS NULL AND (NOT ${!me.admin}::bool OR m.role IS NOT NULL)
       ORDER BY p.key`;
    return json(
      rows.map((r) => ({
        id: r["id"],
        key: r["key"],
        name: r["name"],
        lead: r["lead_id"] ? { id: r["lead_id"], display_name: r["lead_name"] ?? "" } : null,
        my_role: r["my_role"],
        image_url: r["image_key"] ? `/v1/projects/${r["key"]}/image` : null,
      })),
    );
  } catch (err) {
    return serverFailure("GET /projects", err);
  }
});

/** GET /projects/:key: the project with its workflow and members. */
projectsRead.get("/projects/:key", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    const workflow = await workflowOf(sql, loaded.project.id);
    const members = await membersOf(sql, loaded.project.id);
    return json({ ...loaded.project, workflow, members });
  } catch (err) {
    return serverFailure("GET /projects/:key", err);
  }
});

projectsRead.get("/projects/:key/members", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    return json(await membersOf(sql, loaded.project.id));
  } catch (err) {
    return serverFailure("GET /projects/:key/members", err);
  }
});

projectsRead.get("/projects/:key/workflow", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    return json(await workflowOf(sql, loaded.project.id));
  } catch (err) {
    return serverFailure("GET /projects/:key/workflow", err);
  }
});

/** GET /projects/:key/issues: filters and sort, or `q` (search) on its own. */
projectsRead.get("/projects/:key/issues", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    const project = loaded.project;
    if (c.req.query("q") !== undefined) {
      const structured = FILTER_PARAMS.some((name) => {
        const v = c.req.query(name);
        return v !== undefined && v.trim() !== "";
      });
      if (structured) return badRequest("Use q on its own, or the filter parameters, not both.");
      return runSearch(c, sql, { viewer: me.id, allProjects: true, projectId: project.id });
    }
    const query = await issueListQuery(c, sql, project.id, project.key);
    if (isResponse(query)) return query;
    return json(await issuePage(sql, query.where, query.order, query.offset, query.limit));
  } catch (err) {
    return serverFailure("GET /projects/:key/issues", err);
  }
});

/** GET /projects/:key/backlog: issues with no sprint, in rank order. */
projectsRead.get("/projects/:key/backlog", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    const window = pageWindow(c);
    if (window instanceof Response) return window;
    const where = sql`i.project_id = ${loaded.project.id}::text::uuid AND i.deleted_at IS NULL AND i.sprint_id IS NULL`;
    return json(await issuePage(sql, where, listOrder(sql, "rank"), window.offset, window.limit));
  } catch (err) {
    return serverFailure("GET /projects/:key/backlog", err);
  }
});

projectsRead.get("/projects/:key/sprints", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    return json(await sprintsOf(sql, loaded.project.id));
  } catch (err) {
    return serverFailure("GET /projects/:key/sprints", err);
  }
});

/** GET /projects/:key/issues/similar?summary=: up to five live issues sharing the most words. */
projectsRead.get("/projects/:key/issues/similar", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const loaded = await loadProject(sql, me, c.req.param("key"));
    if (isResponse(loaded)) return loaded;
    const words = similarWords(c.req.query("summary") ?? "");
    if (words.length === 0) return json([]);
    const patterns = words.map((w) => `%${w}%`);
    const candidates = await fetchIssues(
      sql,
      sql`i.project_id = ${loaded.project.id}::text::uuid AND i.summary ILIKE ANY(${patterns}::text[])`,
      sql`ORDER BY i.updated_at DESC`,
    );
    const scored = candidates
      .map((rec) => {
        const text = asciiLower(rec.summary);
        return { score: words.filter((w) => text.includes(w)).length, rec };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || b.rec.updated - a.rec.updated);
    return json(scored.slice(0, SIMILAR_LIMIT).map((s) => summaryJson(s.rec)));
  } catch (err) {
    return serverFailure("GET /projects/:key/issues/similar", err);
  }
});

/** GET /issues/search?q=: every project the caller may view (every project for a global admin). */
projectsRead.get("/issues/search", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    return runSearch(c, sql, { viewer: me.id, allProjects: me.admin, projectId: null });
  } catch (err) {
    return serverFailure("GET /issues/search", err);
  }
});

/** GET /issues/:id: one issue with its parent, subtasks, links, the viewer's social fields and attachments. */
projectsRead.get("/issues/:id", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const found = await loadIssue(sql, me, c.req.param("id"));
    if (isResponse(found)) return found;
    const rec = found.issue;
    const detail = await issueDetail(sql, rec);
    const social = await socialOf(sql, rec.id, me.id);
    const attachments = await attachmentsOf(sql, rec.id, rec.key);
    return json({
      id: rec.id,
      key: rec.key,
      summary: rec.summary,
      description: rec.description,
      type: rec.type,
      priority: rec.priority,
      state: rec.state,
      assignee: rec.assignee,
      reporter: rec.reporter,
      parent: detail.parent,
      subtasks: detail.subtasks,
      links: detail.links,
      sprint: rec.sprint,
      estimate_points: rec.estimate,
      due_date: rec.due,
      tags: rec.tags,
      backlog_rank: rec.rank,
      created_at: rec.created,
      updated_at: rec.updated,
      resolved_at: rec.resolved,
      updated_by: rec.updatedBy,
      ...social,
      attachments,
    });
  } catch (err) {
    return serverFailure("GET /issues/:id", err);
  }
});

projectsRead.get("/issues/:id/comments", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const found = await loadIssue(sql, me, c.req.param("id"));
    if (isResponse(found)) return found;
    const rows = await sql`
      SELECT c.id::text AS id, c.body AS body, u.id::text AS author_id, u.name AS author_name,
             EXTRACT(EPOCH FROM c.created_at)::bigint AS created_at,
             EXTRACT(EPOCH FROM c.updated_at)::bigint AS updated_at
        FROM comments c JOIN employees u ON u.id = c.author_id
       WHERE c.issue_id = ${found.issue.id}::text::uuid AND c.deleted_at IS NULL
       ORDER BY c.created_at, c.id`;
    return json(
      rows.map((r) => ({
        id: r["id"],
        body: r["body"],
        author: { id: r["author_id"], display_name: r["author_name"] },
        created_at: Number(r["created_at"]),
        updated_at: Number(r["updated_at"]),
      })),
    );
  } catch (err) {
    return serverFailure("GET /issues/:id/comments", err);
  }
});

projectsRead.get("/issues/:id/activity", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const found = await loadIssue(sql, me, c.req.param("id"));
    if (isResponse(found)) return found;
    const rows = await sql`
      SELECT a.id::text AS id, a.kind AS kind, a.field AS field,
             a.old_value::text AS old_value, a.new_value::text AS new_value,
             u.id::text AS actor_id, u.name AS actor_name,
             EXTRACT(EPOCH FROM a.created_at)::bigint AS created_at
        FROM activity a LEFT JOIN employees u ON u.id = a.actor_id
       WHERE a.issue_id = ${found.issue.id}::text::uuid
       ORDER BY a.created_at, a.id`;
    return json(
      rows.map((r) => ({
        id: r["id"],
        kind: r["kind"],
        field: r["field"] ?? null,
        old_value: parseJsonColumn(r["old_value"] as string | null),
        new_value: parseJsonColumn(r["new_value"] as string | null),
        actor: r["actor_id"] ? { id: r["actor_id"], display_name: r["actor_name"] ?? "" } : null,
        created_at: Number(r["created_at"]),
      })),
    );
  } catch (err) {
    return serverFailure("GET /issues/:id/activity", err);
  }
});

/** A stored JSON text as a value, or null when absent or not JSON (Rust `parse_json_column`). */
function parseJsonColumn(text: string | null): unknown {
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

projectsRead.get("/issues/:id/work-items", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const found = await loadIssue(sql, me, c.req.param("id"));
    if (isResponse(found)) return found;
    const rows = await sql`
      SELECT w.id::text AS id, w.minutes AS minutes, w.spent_on::text AS spent_on, w.note AS note,
             u.id::text AS author_id, u.name AS author_name,
             EXTRACT(EPOCH FROM w.created_at)::bigint AS created_at,
             EXTRACT(EPOCH FROM w.updated_at)::bigint AS updated_at
        FROM issue_work_items w JOIN employees u ON u.id = w.author_id
       WHERE w.issue_id = ${found.issue.id}::text::uuid AND w.deleted_at IS NULL
       ORDER BY w.created_at, w.id`;
    return json(
      rows.map((r) => ({
        id: r["id"],
        minutes: Number(r["minutes"]),
        spent_on: r["spent_on"],
        note: r["note"],
        author: { id: r["author_id"], display_name: r["author_name"] },
        created_at: Number(r["created_at"]),
        updated_at: Number(r["updated_at"]),
      })),
    );
  } catch (err) {
    return serverFailure("GET /issues/:id/work-items", err);
  }
});

projectsRead.get("/issues/:id/attachments", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewerOf(c, sql);
    if (isResponse(me)) return me;
    const found = await loadIssue(sql, me, c.req.param("id"));
    if (isResponse(found)) return found;
    return json(await attachmentsOf(sql, found.issue.id, found.issue.key));
  } catch (err) {
    return serverFailure("GET /issues/:id/attachments", err);
  }
});

export default projectsRead;

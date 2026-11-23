/**
 * Access rules and shared helpers for the Rimelight Space content routes (CMS.3, decision 0049).
 * Pages belong to a project, a team, a department or the company. Pure functions here are unit tested
 * (test/space-content.test.ts); the SQL helpers follow canvas-access.ts.
 *
 * Page access (pageAccessLevel):
 * - Project scope: global admins and project admins manage; project members edit; project viewers view;
 *   anyone else has no access (a 404).
 * - Team and Department scope: every employee views; members of that team or department (employees.team_id
 *   or employees.department_id equal to the scope id) edit; global admins manage.
 * - Company scope: every employee views; global admins manage; users with user_roles.role = 'content_editor'
 *   edit.
 *
 * Draft access (canOpenDraft): the author and the draft's members may open the draft, and only while they
 * still have edit on the page. A reviewer (manage on the page) may read the comments of an InReview draft
 * (canReviewDraft); that is how reviewers see what they are approving.
 *
 * Block filter (filterBlocks): applied to every read of published content. A block is dropped when its
 * allowedRoles is set and the caller has none of them, when its requiredPermission is set and the caller does
 * not hold it, and, for the public audience, when its visibility is "internal". Children are filtered the same
 * way. An empty or missing allowedRoles or requiredPermission is no restriction.
 */
import {
  type AccessLevel,
  atLeast,
  forbidden,
  notFound,
  type Row,
  type Sql,
  UUID,
  uuidOr404,
} from "../canvas-access.ts";

export type { Sql } from "../canvas-access.ts";

export const NO_PAGE = "There is no such page.";
export const NO_DRAFT = "There is no such draft.";

export type ContentScope = "Project" | "Team" | "Department" | "Company";
export type Audience = "employee" | "public";

/* ---------- page access (pure) ---------- */

export type PageFacts = {
  scopeKind: ContentScope;
  scopeId: string | null;
  globalAdmin: boolean;
  contentEditor: boolean;
  projectRole: string | null; // caller's project_members.role ('admin' | 'member' | 'viewer') or null
  teamId: string | null; // caller's employees.team_id
  departmentId: string | null; // caller's employees.department_id
};

/** What the caller may do with a page in a scope. See the file comment for the rules. */
export function pageAccessLevel(f: PageFacts): AccessLevel {
  if (f.scopeKind === "Project") {
    if (f.globalAdmin || f.projectRole === "admin") return "manage";
    if (f.projectRole === "member") return "edit";
    if (f.projectRole === "viewer") return "view";
    return "none";
  }
  if (f.scopeKind === "Team" || f.scopeKind === "Department") {
    if (f.globalAdmin) return "manage";
    const mine = f.scopeKind === "Team" ? f.teamId : f.departmentId;
    if (f.scopeId !== null && mine === f.scopeId) return "edit";
    return "view";
  }
  if (f.globalAdmin) return "manage";
  if (f.contentEditor) return "edit";
  return "view";
}

/* ---------- draft access (pure) ---------- */

export type DraftFacts = { authorId: string; memberIds: string[]; status: string };

/** The author or a member may open the draft, and only with edit on the page. */
export function canOpenDraft(userId: string, draft: DraftFacts, pageLevel: AccessLevel): boolean {
  const involved = draft.authorId === userId || draft.memberIds.includes(userId);
  return involved && atLeast(pageLevel, "edit");
}

/** Reviewers (manage on the page) may read an InReview draft's comments without being members. */
export function canReviewDraft(draft: DraftFacts, pageLevel: AccessLevel): boolean {
  return draft.status === "InReview" && atLeast(pageLevel, "manage");
}

/* ---------- block filter (pure) ---------- */

/** The block fields the filter reads. Other fields pass through untouched. */
export type ContentBlock = {
  allowedRoles?: string[];
  requiredPermission?: string;
  visibility?: string;
  children?: ContentBlock[];
  [key: string]: unknown;
};

/** The blocks a caller may see, recursing into children. Pure. */
export function filterBlocks(
  blocks: ContentBlock[],
  callerRoles: string[],
  audience: Audience,
): ContentBlock[] {
  const out: ContentBlock[] = [];
  for (const block of blocks) {
    if (block.allowedRoles && block.allowedRoles.length > 0) {
      if (!block.allowedRoles.some((role) => callerRoles.includes(role))) continue;
    }
    if (block.requiredPermission && !callerRoles.includes(block.requiredPermission)) continue;
    if (audience === "public" && block.visibility === "internal") continue;
    const kept: ContentBlock = { ...block };
    if (Array.isArray(block.children)) {
      kept.children = filterBlocks(block.children, callerRoles, audience);
    }
    out.push(kept);
  }
  return out;
}

/* ---------- SQL helpers ---------- */

/** The caller's facts for a scope. A missing or inactive employee has no facts, so no access. */
async function callerFacts(
  sql: Sql,
  userId: string,
  scopeKind: ContentScope,
  scopeId: string | null,
): Promise<PageFacts | null> {
  const rows = await sql`SELECT
       EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = ${userId}::text::uuid AND r.role = 'admin') AS global_admin,
       EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = ${userId}::text::uuid AND r.role = 'content_editor') AS content_editor,
       (SELECT m.role FROM project_members m
         WHERE m.project_id = ${scopeId}::text::uuid AND m.user_id = ${userId}::text::uuid AND m.deleted_at IS NULL) AS project_role,
       e.team_id::text AS team_id,
       e.department_id::text AS department_id
     FROM employees e
     WHERE e.id = ${userId}::text::uuid AND e.is_active AND e.deleted_at IS NULL`;
  const row = rows[0] as Row | undefined;
  if (!row) return null;
  return {
    scopeKind,
    scopeId,
    globalAdmin: row["global_admin"] === true,
    contentEditor: row["content_editor"] === true,
    projectRole: (row["project_role"] as string | null) ?? null,
    teamId: (row["team_id"] as string | null) ?? null,
    departmentId: (row["department_id"] as string | null) ?? null,
  };
}

/** What the caller may do with pages in a scope (the page need not exist yet). */
export async function pageAccess(
  sql: Sql,
  userId: string,
  page: { scopeKind: ContentScope; scopeId: string | null },
): Promise<AccessLevel> {
  const facts = await callerFacts(sql, userId, page.scopeKind, page.scopeId);
  if (!facts) return "none";
  return pageAccessLevel(facts);
}

/** The caller's role names (user_roles), the input to filterBlocks. */
export async function callerRoles(sql: Sql, userId: string): Promise<string[]> {
  const rows = await sql`SELECT role FROM user_roles WHERE user_id = ${userId}::text::uuid`;
  return rows.map((r) => r["role"] as string);
}

export type PageRow = {
  id: string;
  slug: string;
  type: string;
  title: unknown;
  description: unknown;
  scopeKind: ContentScope;
  scopeId: string | null;
  visibility: "Internal" | "Public";
  status: string;
  publishedVersionId: string | null;
  content: { blocks?: ContentBlock[]; properties?: Record<string, unknown> } | null;
  createdAt: string;
  updatedAt: string;
};

/** A page row (ids as text, timestamps as ISO strings). `r` is a pages row from pageSelect. */
export function pageFromRow(r: Row): PageRow {
  return {
    id: r["id"] as string,
    slug: r["slug"] as string,
    type: r["type"] as string,
    title: r["title"],
    description: r["description"] ?? null,
    scopeKind: r["scope_kind"] as ContentScope,
    scopeId: (r["scope_id"] as string | null) ?? null,
    visibility: r["visibility"] as "Internal" | "Public",
    status: r["status"] as string,
    publishedVersionId: (r["published_version_id"] as string | null) ?? null,
    content: (r["content"] as PageRow["content"]) ?? null,
    createdAt: new Date(r["created_at"] as string | Date).toISOString(),
    updatedAt: new Date(r["updated_at"] as string | Date).toISOString(),
  };
}

/** The page with the caller's access. Missing or no access is a 404; access below `need` is a 403. */
export async function loadPage(
  sql: Sql,
  userId: string,
  rawId: string,
  need: AccessLevel,
): Promise<{ page: PageRow; access: AccessLevel } | Response> {
  const id = uuidOr404(rawId, NO_PAGE);
  if (typeof id !== "string") return id;
  const rows = await sql`SELECT id::text AS id, slug, type, title, description, scope_kind,
       scope_id::text AS scope_id, visibility, status, published_version_id::text AS published_version_id,
       content, created_at, updated_at
     FROM pages WHERE id = ${id}::text::uuid AND deleted_at IS NULL`;
  const row = rows[0] as Row | undefined;
  if (!row) return notFound(NO_PAGE);
  const page = pageFromRow(row);
  const access = await pageAccess(sql, userId, {
    scopeKind: page.scopeKind,
    scopeId: page.scopeId,
  });
  if (access === "none") return notFound(NO_PAGE);
  if (!atLeast(access, need)) {
    return forbidden(
      need === "manage"
        ? "Only a page manager can do that."
        : "You can view this page but not change it.",
    );
  }
  return { page, access };
}

/** A draft with its page scope and members. */
export type DraftRow = {
  id: string;
  pageId: string;
  authorId: string;
  status: string;
  versionId: string | null;
  summary: string | null;
  members: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  scopeKind: ContentScope;
  scopeId: string | null;
};

export function draftFacts(d: DraftRow): DraftFacts {
  return { authorId: d.authorId, memberIds: d.members, status: d.status };
}

export function draftView(d: DraftRow) {
  return {
    id: d.id,
    page_id: d.pageId,
    author_id: d.authorId,
    status: d.status,
    version_id: d.versionId,
    summary: d.summary,
    members: d.members,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
    closed_at: d.closedAt,
  };
}

/** A draft by id, or a 404 when there is no such draft. Visibility is checked by the caller. */
export async function loadDraft(sql: Sql, rawId: string): Promise<DraftRow | Response> {
  const id = uuidOr404(rawId, NO_DRAFT);
  if (typeof id !== "string") return id;
  const rows =
    await sql`SELECT d.id::text AS id, d.page_id::text AS page_id, d.author_id::text AS author_id,
       d.status, d.version_id::text AS version_id, d.summary, d.created_at, d.updated_at, d.closed_at,
       p.scope_kind, p.scope_id::text AS scope_id
     FROM content_drafts d
     JOIN pages p ON p.id = d.page_id
     WHERE d.id = ${id}::text::uuid AND p.deleted_at IS NULL`;
  const row = rows[0] as Row | undefined;
  if (!row) return notFound(NO_DRAFT);
  const members = await sql`SELECT user_id::text AS user_id FROM content_draft_members
     WHERE draft_id = ${id}::text::uuid ORDER BY added_at, user_id`;
  const iso = (v: unknown) => new Date(v as string | Date).toISOString();
  return {
    id: row["id"] as string,
    pageId: row["page_id"] as string,
    authorId: row["author_id"] as string,
    status: row["status"] as string,
    versionId: (row["version_id"] as string | null) ?? null,
    summary: (row["summary"] as string | null) ?? null,
    members: members.map((m) => m["user_id"] as string),
    createdAt: iso(row["created_at"]),
    updatedAt: iso(row["updated_at"]),
    closedAt: row["closed_at"] == null ? null : iso(row["closed_at"]),
    scopeKind: row["scope_kind"] as ContentScope,
    scopeId: (row["scope_id"] as string | null) ?? null,
  };
}

/** The page's access for the caller, for a draft's page. */
export async function draftPageAccess(
  sql: Sql,
  userId: string,
  draft: DraftRow,
): Promise<AccessLevel> {
  return pageAccess(sql, userId, { scopeKind: draft.scopeKind, scopeId: draft.scopeId });
}

/** Reads a request body's field as a UUID string (lower-cased), or null. */
export function uuidField(value: unknown): string | null {
  return typeof value === "string" && UUID.test(value) ? value.toLowerCase() : null;
}

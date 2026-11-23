/**
 * Rimelight Space content routes, part 3 (CMS.3, decision 0049): approving and rejecting a pending page version.
 * Approve and reject need manage on the page. When the approvals reach the template's minApprovals, the stored
 * draft is merged and published (content-drafts.ts), and that pending version becomes the published one.
 */
import { Hono } from "hono";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import {
  apiError,
  forbidden,
  json,
  notFound,
  type Row,
  type Sql,
  uuidOr404,
} from "../canvas-access.ts";
import {
  callerRoles,
  type ContentScope,
  draftView,
  loadDraft,
  pageAccess,
} from "./content-access.ts";
import { publishStaged, stageDraft } from "./content-drafts.ts";

const NO_VERSION = "There is no such version.";

type ApprovalRules = {
  minApprovals: number;
  allowSelfApproval: boolean;
  requiredRolesForApproval: string[];
};

/** The template's approval rules for a page. Defaults match the template default: one approval, self allowed. */
async function rulesOf(sql: Sql, pageId: string): Promise<ApprovalRules> {
  const rows = await sql`SELECT t.approval_rules FROM pages p
     LEFT JOIN page_templates t ON t.id = p.template_id
     WHERE p.id = ${pageId}::text::uuid`;
  const raw = rows[0]?.["approval_rules"] as unknown;
  const parsed = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  const rules = (parsed ?? {}) as Record<string, unknown>;
  const min = typeof rules["minApprovals"] === "number" ? Math.floor(rules["minApprovals"]) : 1;
  const required = Array.isArray(rules["requiredRolesForApproval"])
    ? (rules["requiredRolesForApproval"] as unknown[]).filter(
        (r): r is string => typeof r === "string",
      )
    : [];
  return {
    minApprovals: Math.max(min, 1),
    allowSelfApproval: rules["allowSelfApproval"] !== false,
    requiredRolesForApproval: required,
  };
}

/** A pending or other version with its page's scope. Missing is a 404. */
async function loadVersion(
  sql: Sql,
  rawId: string,
): Promise<
  | {
      id: string;
      pageId: string;
      status: string;
      createdBy: string;
      scopeKind: ContentScope;
      scopeId: string | null;
    }
  | Response
> {
  const id = uuidOr404(rawId, NO_VERSION);
  if (typeof id !== "string") return id;
  const rows =
    await sql`SELECT v.id::text AS id, v.page_id::text AS page_id, v.status, v.created_by,
       p.scope_kind, p.scope_id::text AS scope_id
     FROM page_versions v
     JOIN pages p ON p.id = v.page_id
     WHERE v.id = ${id}::text::uuid AND p.deleted_at IS NULL`;
  const row = rows[0] as Row | undefined;
  if (!row) return notFound(NO_VERSION);
  return {
    id: row["id"] as string,
    pageId: row["page_id"] as string,
    status: row["status"] as string,
    createdBy: row["created_by"] as string,
    scopeKind: row["scope_kind"] as ContentScope,
    scopeId: (row["scope_id"] as string | null) ?? null,
  };
}

const review = new Hono();

/** POST /v1/content/versions/:id/approve: record the caller's approval; publish when enough people have approved. */
review.post("/content/versions/:id/approve", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const version = await loadVersion(sql, c.req.param("id"));
    if (version instanceof Response) return version;
    const access = await pageAccess(sql, who.id, {
      scopeKind: version.scopeKind,
      scopeId: version.scopeId,
    });
    if (access === "none") return notFound(NO_VERSION);
    if (access !== "manage") return forbidden("Only a page manager can approve a change.");
    if (version.status !== "pending")
      return apiError(409, "conflict", "This version is not waiting for approval.");

    const rules = await rulesOf(sql, version.pageId);
    if (!rules.allowSelfApproval && version.createdBy === who.id) {
      return forbidden("The template does not let you approve your own change.");
    }
    if (rules.requiredRolesForApproval.length > 0) {
      const roles = await callerRoles(sql, who.id);
      if (!rules.requiredRolesForApproval.some((role) => roles.includes(role))) {
        return forbidden("Your role cannot approve this change.");
      }
    }

    await sql`INSERT INTO page_version_approvals (version_id, user_id, user_role)
       VALUES (${version.id}::text::uuid, ${who.id}::text, 'manage')`;
    const approvers = await sql`SELECT DISTINCT user_id FROM page_version_approvals
       WHERE version_id = ${version.id}::text::uuid ORDER BY user_id`;
    const ids = approvers.map((r) => r["user_id"] as string);
    await sql`UPDATE page_versions SET approved_by = ${JSON.stringify(ids)}::jsonb
       WHERE id = ${version.id}::text::uuid`;

    if (ids.length < rules.minApprovals) {
      return json({
        status: "pending",
        approvals: ids.length,
        required: rules.minApprovals,
        version_id: version.id,
      });
    }

    const draftRows = await sql`SELECT id::text AS id FROM content_drafts
       WHERE version_id = ${version.id}::text::uuid AND status = 'InReview'`;
    const draftId = draftRows[0]?.["id"] as string | undefined;
    if (!draftId)
      return apiError(409, "conflict", "The draft for this version is no longer in review.");
    const draft = await loadDraft(sql, draftId);
    if (draft instanceof Response) return draft;

    const staged = await stageDraft(draft);
    const published = await publishStaged(sql, draft, staged, {
      summary: draft.summary,
      existingVersionId: version.id,
    });
    return json({
      status: "published",
      version_id: published,
      draft: draftView({ ...draft, status: "Published" }),
    });
  } catch (err) {
    console.error("space POST /content/versions/:id/approve failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/versions/:id/reject: the version is rejected and its draft goes back to Open. Manage only. */
review.post("/content/versions/:id/reject", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const version = await loadVersion(sql, c.req.param("id"));
    if (version instanceof Response) return version;
    const access = await pageAccess(sql, who.id, {
      scopeKind: version.scopeKind,
      scopeId: version.scopeId,
    });
    if (access === "none") return notFound(NO_VERSION);
    if (access !== "manage") return forbidden("Only a page manager can reject a change.");
    if (version.status !== "pending")
      return apiError(409, "conflict", "This version is not waiting for approval.");

    await sql`UPDATE page_versions SET status = 'rejected' WHERE id = ${version.id}::text::uuid`;
    await sql`UPDATE content_drafts SET status = 'Open', updated_at = now()
       WHERE version_id = ${version.id}::text::uuid AND status = 'InReview'`;
    return json({ status: "rejected", version_id: version.id });
  } catch (err) {
    console.error("space POST /content/versions/:id/reject failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default review;

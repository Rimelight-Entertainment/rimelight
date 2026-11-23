/**
 * Rimelight Space content routes, part 4 (CMS.3, decision 0049): comments on a page, or on a draft.
 * Comments are rows, not part of the Loro document (design section 8). A comment on a draft is visible only to
 * the people who may open that draft, plus reviewers while it is InReview. Each change tells the page's main room
 * and, for a draft comment, the draft room, so open editors see it live (notifyDoc in content-live.ts).
 */
import { Hono } from "hono";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import {
  apiError,
  atLeast,
  badRequest,
  forbidden,
  iso,
  json,
  notFound,
  readBody,
  type Row,
  type Sql,
  type AccessLevel,
  uuidOr404,
} from "../canvas-access.ts";
import {
  canOpenDraft,
  canReviewDraft,
  draftFacts,
  type DraftRow,
  loadDraft,
  loadPage,
  NO_DRAFT,
  uuidField,
} from "./content-access.ts";
import { notifyDoc } from "./content-live.ts";

const NO_COMMENT = "There is no such comment.";
const BODY_MAX = 10000;

type CommentRow = {
  id: string;
  pageId: string;
  draftId: string | null;
  blockId: string | null;
  anchor: unknown;
  parentId: string | null;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
};

function commentFromRow(r: Row): CommentRow {
  return {
    id: r["id"] as string,
    pageId: r["page_id"] as string,
    draftId: (r["draft_id"] as string | null) ?? null,
    blockId: (r["block_id"] as string | null) ?? null,
    anchor: r["anchor"] ?? null,
    parentId: (r["parent_id"] as string | null) ?? null,
    authorId: r["author_id"] as string,
    authorName: r["author_name"] as string,
    body: r["body"] as string,
    createdAt: iso(r["created_at"]),
    updatedAt: iso(r["updated_at"]),
    resolvedAt: r["resolved_at"] == null ? null : iso(r["resolved_at"]),
    resolvedBy: (r["resolved_by"] as string | null) ?? null,
  };
}

function commentView(c: CommentRow) {
  return {
    id: c.id,
    page_id: c.pageId,
    draft_id: c.draftId,
    block_id: c.blockId,
    anchor: c.anchor,
    parent_id: c.parentId,
    author_id: c.authorId,
    author_name: c.authorName,
    body: c.body,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
    resolved: c.resolvedAt !== null,
    resolved_at: c.resolvedAt,
    resolved_by: c.resolvedBy,
  };
}

const COMMENT_SELECT = `SELECT c.id::text AS id, c.page_id::text AS page_id, c.draft_id::text AS draft_id,
    c.block_id, c.anchor, c.parent_id::text AS parent_id, c.author_id::text AS author_id, e.name AS author_name,
    c.body, c.created_at, c.updated_at, c.resolved_at, c.resolved_by::text AS resolved_by
  FROM content_comments c
  JOIN employees e ON e.id = c.author_id`;

async function loadComment(sql: Sql, rawId: string): Promise<CommentRow | Response> {
  const id = uuidOr404(rawId, NO_COMMENT);
  if (typeof id !== "string") return id;
  const rows = await sql.unsafe(
    `${COMMENT_SELECT} WHERE c.id = $1::uuid AND c.deleted_at IS NULL`,
    [id],
  );
  const row = rows[0] as Row | undefined;
  if (!row) return notFound(NO_COMMENT);
  return commentFromRow(row);
}

/** The draft a comment belongs to, if the caller may see it (open it, or review it). Otherwise null. */
async function visibleDraft(
  sql: Sql,
  userId: string,
  draftId: string,
  pageId: string,
  access: AccessLevel,
): Promise<DraftRow | null> {
  const draft = await loadDraft(sql, draftId);
  if (draft instanceof Response) return null;
  if (draft.pageId !== pageId) return null;
  const facts = draftFacts(draft);
  if (canOpenDraft(userId, facts, access) || canReviewDraft(facts, access)) return draft;
  return null;
}

/** A comment the caller may see, with the page access. Need is the access the action requires. */
async function visibleComment(
  sql: Sql,
  userId: string,
  rawId: string,
  need: AccessLevel,
): Promise<{ comment: CommentRow; access: AccessLevel } | Response> {
  const comment = await loadComment(sql, rawId);
  if (comment instanceof Response) return comment;
  const page = await loadPage(sql, userId, comment.pageId, "view");
  if (page instanceof Response) return page;
  if (comment.draftId) {
    const draft = await visibleDraft(sql, userId, comment.draftId, comment.pageId, page.access);
    if (!draft) return notFound(NO_COMMENT);
  }
  if (!atLeast(page.access, need)) {
    return forbidden("You can view this comment but not change it.");
  }
  return { comment, access: page.access };
}

/** Tells the open rooms that comments changed: the page's main room, and the draft room for a draft comment. */
async function notifyComments(pageId: string, draftId: string | null): Promise<void> {
  const rooms = [`main:${pageId}`];
  if (draftId) rooms.push(`draft:${draftId}`);
  for (const room of rooms) {
    try {
      await notifyDoc(room, { type: "comments" });
    } catch (err) {
      console.error("space content room notify failed", room, err);
    }
  }
}

/** The body text: trimmed, 1 to 10000 characters. Null when it is not valid. */
function cleanBody(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const length = Array.from(trimmed).length;
  return length >= 1 && length <= BODY_MAX ? trimmed : null;
}

const comments = new Hono();

/** GET /v1/content/pages/:id/comments?draftId=: the page's comments, or one draft's, that the caller may see. */
comments.get("/content/pages/:id/comments", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const page = await loadPage(sql, who.id, c.req.param("id"), "view");
    if (page instanceof Response) return page;

    const draftParam = c.req.query("draftId");
    let draftId: string | null = null;
    if (draftParam !== undefined && draftParam !== "") {
      draftId = uuidField(draftParam);
      if (draftId === null) return badRequest("draftId is a draft id.");
      const draft = await visibleDraft(sql, who.id, draftId, page.page.id, page.access);
      if (!draft) return notFound(NO_DRAFT);
    }

    const rows = await sql.unsafe(
      `${COMMENT_SELECT} WHERE c.page_id = $1::uuid AND c.deleted_at IS NULL
         AND c.draft_id IS NOT DISTINCT FROM $2::uuid
       ORDER BY c.created_at, c.id`,
      [page.page.id, draftId],
    );
    return json({ comments: rows.map((r) => commentView(commentFromRow(r as Row))) });
  } catch (err) {
    console.error("space GET /content/pages/:id/comments failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/pages/:id/comments {draftId?, blockId?, anchor?, parentId?, body}: 201 with the comment. */
comments.post("/content/pages/:id/comments", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const page = await loadPage(sql, who.id, c.req.param("id"), "view");
    if (page instanceof Response) return page;
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");

    const text = cleanBody(body["body"]);
    if (text === null) return badRequest("body is 1 to 10000 characters.");

    let draftId: string | null = null;
    if (body["draftId"] !== undefined && body["draftId"] !== null) {
      draftId = uuidField(body["draftId"]);
      if (draftId === null) return badRequest("draftId is a draft id.");
      const draft = await visibleDraft(sql, who.id, draftId, page.page.id, page.access);
      if (!draft) return notFound(NO_DRAFT);
    }

    let blockId: string | null = null;
    if (body["blockId"] !== undefined && body["blockId"] !== null) {
      if (typeof body["blockId"] !== "string" || body["blockId"].length > 200) {
        return badRequest("blockId is a block id.");
      }
      blockId = body["blockId"];
    }

    let anchor: string | null = null;
    if (body["anchor"] !== undefined && body["anchor"] !== null) {
      if (typeof body["anchor"] !== "object" || Array.isArray(body["anchor"])) {
        return badRequest("anchor is an object.");
      }
      anchor = JSON.stringify(body["anchor"]);
    }

    let parentId: string | null = null;
    if (body["parentId"] !== undefined && body["parentId"] !== null) {
      parentId = uuidField(body["parentId"]);
      if (parentId === null) return badRequest("parentId is a comment id.");
      const parents = await sql`SELECT 1 FROM content_comments
         WHERE id = ${parentId}::text::uuid AND page_id = ${page.page.id}::text::uuid
           AND draft_id IS NOT DISTINCT FROM ${draftId}::text::uuid AND deleted_at IS NULL`;
      if (parents.length === 0) return notFound(NO_COMMENT);
    }

    const inserted = await sql`INSERT INTO content_comments
         (page_id, draft_id, block_id, anchor, parent_id, author_id, body)
       VALUES (${page.page.id}::text::uuid, ${draftId}::text::uuid, ${blockId}::text,
         ${anchor}::jsonb, ${parentId}::text::uuid, ${who.id}::text::uuid, ${text}::text)
       RETURNING id::text AS id`;
    const created = await loadComment(sql, inserted[0]?.["id"] as string);
    if (created instanceof Response) return created;
    await notifyComments(page.page.id, draftId);
    return json(commentView(created), 201);
  } catch (err) {
    console.error("space POST /content/pages/:id/comments failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PATCH /v1/content/comments/:id {body}: the author edits the text. */
comments.patch("/content/comments/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await visibleComment(sql, who.id, c.req.param("id"), "view");
    if (found instanceof Response) return found;
    if (found.comment.authorId !== who.id)
      return forbidden("Only the author can edit this comment.");
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const text = cleanBody(body["body"]);
    if (text === null) return badRequest("body is 1 to 10000 characters.");

    await sql`UPDATE content_comments SET body = ${text}::text, updated_at = now()
       WHERE id = ${found.comment.id}::text::uuid`;
    const updated = await loadComment(sql, found.comment.id);
    if (updated instanceof Response) return updated;
    await notifyComments(updated.pageId, updated.draftId);
    return json(commentView(updated));
  } catch (err) {
    console.error("space PATCH /content/comments/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/comments/:id/resolve: mark the thread resolved. Edit on the page. */
comments.post("/content/comments/:id/resolve", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await visibleComment(sql, who.id, c.req.param("id"), "edit");
    if (found instanceof Response) return found;
    await sql`UPDATE content_comments SET resolved_at = now(), resolved_by = ${who.id}::text::uuid,
         updated_at = now()
       WHERE id = ${found.comment.id}::text::uuid`;
    const updated = await loadComment(sql, found.comment.id);
    if (updated instanceof Response) return updated;
    await notifyComments(updated.pageId, updated.draftId);
    return json(commentView(updated));
  } catch (err) {
    console.error("space POST /content/comments/:id/resolve failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/comments/:id/reopen: reopen a resolved thread. Edit on the page. */
comments.post("/content/comments/:id/reopen", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await visibleComment(sql, who.id, c.req.param("id"), "edit");
    if (found instanceof Response) return found;
    await sql`UPDATE content_comments SET resolved_at = NULL, resolved_by = NULL, updated_at = now()
       WHERE id = ${found.comment.id}::text::uuid`;
    const updated = await loadComment(sql, found.comment.id);
    if (updated instanceof Response) return updated;
    await notifyComments(updated.pageId, updated.draftId);
    return json(commentView(updated));
  } catch (err) {
    console.error("space POST /content/comments/:id/reopen failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/content/comments/:id: soft delete by the author or a page manager. */
comments.delete("/content/comments/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await visibleComment(sql, who.id, c.req.param("id"), "view");
    if (found instanceof Response) return found;
    if (found.comment.authorId !== who.id && found.access !== "manage") {
      return forbidden("Only the author or a page manager can delete this comment.");
    }
    await sql`UPDATE content_comments SET deleted_at = now(), updated_at = now()
       WHERE id = ${found.comment.id}::text::uuid`;
    await notifyComments(found.comment.pageId, found.comment.draftId);
    return json({ deleted: true, id: found.comment.id });
  } catch (err) {
    console.error("space DELETE /content/comments/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default comments;

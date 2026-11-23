/**
 * Rimelight Space content routes, part 2 (CMS.3, decision 0049): author drafts, their members, discard, and publish.
 * A draft is a Loro fork of the page's main document. Publishing merges the draft's changes into main through the
 * DocRoom Durable Objects (content-live.ts). If the page's template has approval rules, the merge is previewed and
 * stored as a pending page_versions row instead, and content-review.ts finishes it when enough people approve.
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
  type Sql,
} from "../canvas-access.ts";
import {
  canOpenDraft,
  type DraftRow,
  draftFacts,
  draftPageAccess,
  draftView,
  loadDraft,
  loadPage,
  NO_DRAFT,
  pageAccess,
  uuidField,
} from "./content-access.ts";
import { docRoomStub } from "./content-live.ts";

export type RoomStub = ReturnType<typeof docRoomStub>;

/** The two rooms a publish works on, with the draft's updates the main document has not seen. */
export type Staged = { main: RoomStub; room: RoomStub; bytes: Uint8Array };

/** Starts both rooms and exports the draft's changes since main's version vector. */
export async function stageDraft(draft: DraftRow): Promise<Staged> {
  const main = docRoomStub(`main:${draft.pageId}`);
  const room = docRoomStub(`draft:${draft.id}`);
  await main.init({ kind: "main", pageId: draft.pageId });
  await room.init({ kind: "draft", pageId: draft.pageId, draftId: draft.id });
  const vv = await main.versionVector();
  const bytes = await room.exportUpdatesSince(vv);
  return { main, room, bytes };
}

/** A page's approval rules: the template's, or none. jsonb may arrive as text or as an object. */
export async function minApprovalsOf(sql: Sql, pageId: string): Promise<number> {
  const rows = await sql`SELECT t.approval_rules FROM pages p
     LEFT JOIN page_templates t ON t.id = p.template_id
     WHERE p.id = ${pageId}::text::uuid`;
  const raw = rows[0]?.["approval_rules"] as unknown;
  const rules = typeof raw === "string" ? (JSON.parse(raw) as Record<string, unknown>) : raw;
  const min = (rules as { minApprovals?: unknown } | null | undefined)?.minApprovals;
  return typeof min === "number" && min > 0 ? Math.floor(min) : 0;
}

/** The title in a merged meta map, as jsonb text, or null when there is none. */
export function titleJsonOf(meta: unknown): string | null {
  const title = (meta as { title?: unknown } | null | undefined)?.title;
  return typeof title === "object" && title !== null ? JSON.stringify(title) : null;
}

/** Writes a page_versions row for the page as it is now, numbered after the last one. Returns its id. */
export async function insertVersion(
  sql: Sql,
  pageId: string,
  status: "pending" | "published",
  content: unknown,
  titleJson: string | null,
  createdBy: string,
  summary: string | null,
): Promise<string> {
  const contentJson = JSON.stringify(content);
  const rows =
    await sql`INSERT INTO page_versions (page_id, version_number, status, slug, type, title,
       description, tags, author_ids, bylines, content, created_by, change_summary, approved_at)
     SELECT p.id,
       (SELECT COALESCE(MAX(v.version_number), 0) + 1 FROM page_versions v WHERE v.page_id = p.id),
       ${status}::text, p.slug, p.type, COALESCE(${titleJson}::jsonb, p.title), p.description,
       p.tags, p.author_ids, p.bylines, ${contentJson}::jsonb, ${createdBy}::text, ${summary}::text,
       ${status === "published" ? new Date() : null}::timestamptz
     FROM pages p WHERE p.id = ${pageId}::text::uuid
     RETURNING id::text AS id`;
  return rows[0]?.["id"] as string;
}

/**
 * Sends a draft for approval: the previewed merge is stored as a pending version and the draft is InReview.
 * Main and the pages row are unchanged.
 */
export async function sendForReview(
  sql: Sql,
  draft: DraftRow,
  staged: Staged,
  summary: string | null,
): Promise<string> {
  const preview = await staged.main.previewMerge(staged.bytes);
  const versionId = await insertVersion(
    sql,
    draft.pageId,
    "pending",
    preview.content,
    titleJsonOf(preview.meta),
    draft.authorId,
    summary,
  );
  await sql`UPDATE content_drafts SET status = 'InReview', version_id = ${versionId}::text::uuid,
       summary = ${summary}::text, updated_at = now()
     WHERE id = ${draft.id}::text::uuid`;
  return versionId;
}

/**
 * Merges a staged draft into main and publishes it: main is converted to JSON, the page's content, title and
 * published version are updated, the room is closed and the draft is marked Published. With existingVersionId
 * (an approved pending version), that version becomes the published one instead of a new row.
 */
export async function publishStaged(
  sql: Sql,
  draft: DraftRow,
  staged: Staged,
  opts: { summary: string | null; existingVersionId?: string | null },
): Promise<string> {
  await staged.main.importUpdates(staged.bytes);
  const snap = await staged.main.snapshotJson();
  const titleJson = titleJsonOf(snap.meta);
  const contentJson = JSON.stringify(snap.content);

  let versionId: string;
  if (opts.existingVersionId) {
    const rows =
      await sql`UPDATE page_versions SET status = 'published', content = ${contentJson}::jsonb,
         title = COALESCE(${titleJson}::jsonb, title), approved_at = now()
       WHERE id = ${opts.existingVersionId}::text::uuid
       RETURNING id::text AS id`;
    versionId = rows[0]?.["id"] as string;
  } else {
    versionId = await insertVersion(
      sql,
      draft.pageId,
      "published",
      snap.content,
      titleJson,
      draft.authorId,
      opts.summary,
    );
  }

  await sql`UPDATE pages SET content = ${contentJson}::jsonb,
       title = COALESCE(${titleJson}::jsonb, title),
       published_version_id = ${versionId}::text::uuid,
       status = 'published', updated_at = now()
     WHERE id = ${draft.pageId}::text::uuid`;
  await staged.room.close("published");
  await sql`UPDATE content_drafts SET status = 'Published', version_id = ${versionId}::text::uuid,
       summary = COALESCE(${opts.summary}::text, summary), closed_at = now(), updated_at = now()
     WHERE id = ${draft.id}::text::uuid`;
  return versionId;
}

/** A draft the caller may open (author or member, with edit on the page). Otherwise 404, or 403 if involved. */
export async function openableDraft(
  sql: Sql,
  userId: string,
  rawId: string,
): Promise<{ draft: DraftRow } | Response> {
  const draft = await loadDraft(sql, rawId);
  if (draft instanceof Response) return draft;
  const level = await draftPageAccess(sql, userId, draft);
  if (!canOpenDraft(userId, draftFacts(draft), level)) {
    const involved = draft.authorId === userId || draft.members.includes(userId);
    return involved ? forbidden("You can view this draft but not change it.") : notFound(NO_DRAFT);
  }
  return { draft };
}

const drafts = new Hono();

/** POST /v1/content/pages/:id/drafts: the caller's open (or in review) draft on the page, created if there is none. */
drafts.post("/content/pages/:id/drafts", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "edit");
    if (found instanceof Response) return found;
    const pageId = found.page.id;

    const existing = await sql`SELECT id::text AS id FROM content_drafts
       WHERE page_id = ${pageId}::text::uuid AND author_id = ${who.id}::text::uuid
         AND status IN ('Open', 'InReview')`;
    let draftId = existing[0]?.["id"] as string | undefined;
    let created = false;
    if (!draftId) {
      const inserted = await sql`INSERT INTO content_drafts (page_id, author_id)
         VALUES (${pageId}::text::uuid, ${who.id}::text::uuid)
         ON CONFLICT (page_id, author_id) WHERE status IN ('Open', 'InReview') DO NOTHING
         RETURNING id::text AS id`;
      draftId = inserted[0]?.["id"] as string | undefined;
      created = draftId !== undefined;
      if (!draftId) {
        const again = await sql`SELECT id::text AS id FROM content_drafts
           WHERE page_id = ${pageId}::text::uuid AND author_id = ${who.id}::text::uuid
             AND status IN ('Open', 'InReview')`;
        draftId = again[0]?.["id"] as string;
      }
    }
    const draft = await loadDraft(sql, draftId);
    if (draft instanceof Response) return draft;
    return json(draftView(draft), created ? 201 : 200);
  } catch (err) {
    console.error("space POST /content/pages/:id/drafts failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** GET /v1/content/pages/:id/drafts: the open drafts on the page the caller can open. */
drafts.get("/content/pages/:id/drafts", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "view");
    if (found instanceof Response) return found;
    if (found.access !== "edit" && found.access !== "manage") return json({ drafts: [] });

    const rows = await sql`SELECT d.id::text AS id FROM content_drafts d
       WHERE d.page_id = ${found.page.id}::text::uuid AND d.status IN ('Open', 'InReview')
         AND (d.author_id = ${who.id}::text::uuid
              OR EXISTS (SELECT 1 FROM content_draft_members m
                          WHERE m.draft_id = d.id AND m.user_id = ${who.id}::text::uuid))
       ORDER BY d.updated_at DESC, d.id`;
    const list: ReturnType<typeof draftView>[] = [];
    for (const r of rows) {
      const draft = await loadDraft(sql, r["id"] as string);
      if (!(draft instanceof Response)) list.push(draftView(draft));
    }
    return json({ drafts: list });
  } catch (err) {
    console.error("space GET /content/pages/:id/drafts failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/drafts/:id/members {userId}: invite a person who may edit the page. Author only. */
drafts.post("/content/drafts/:id/members", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await openableDraft(sql, who.id, c.req.param("id"));
    if (found instanceof Response) return found;
    const { draft } = found;
    if (draft.authorId !== who.id) return forbidden("Only the author can invite people.");
    if (draft.status !== "Open" && draft.status !== "InReview") {
      return apiError(409, "conflict", "This draft is closed.");
    }
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const userId = uuidField(body["userId"]);
    if (userId === null) return badRequest("userId is the id of a person.");
    if (userId === draft.authorId) return badRequest("The author is already on the draft.");

    const people = await sql`SELECT id::text AS id FROM employees
       WHERE id = ${userId}::text::uuid AND is_active AND deleted_at IS NULL`;
    if (people.length === 0) return notFound("There is no such person.");
    const level = await pageAccess(sql, userId, {
      scopeKind: draft.scopeKind,
      scopeId: draft.scopeId,
    });
    if (level !== "edit" && level !== "manage") {
      return badRequest("That person cannot edit this page.");
    }

    await sql`INSERT INTO content_draft_members (draft_id, user_id)
       VALUES (${draft.id}::text::uuid, ${userId}::text::uuid)
       ON CONFLICT (draft_id, user_id) DO NOTHING`;
    const updated = await loadDraft(sql, draft.id);
    if (updated instanceof Response) return updated;
    return json(draftView(updated));
  } catch (err) {
    console.error("space POST /content/drafts/:id/members failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/content/drafts/:id/members/:userId: take a person off the draft. Author only. */
drafts.delete("/content/drafts/:id/members/:userId", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await openableDraft(sql, who.id, c.req.param("id"));
    if (found instanceof Response) return found;
    const { draft } = found;
    if (draft.authorId !== who.id) return forbidden("Only the author can remove people.");
    const userId = uuidField(c.req.param("userId"));
    if (userId === null) return notFound("There is no such person on this draft.");
    await sql`DELETE FROM content_draft_members
       WHERE draft_id = ${draft.id}::text::uuid AND user_id = ${userId}::text::uuid`;
    const updated = await loadDraft(sql, draft.id);
    if (updated instanceof Response) return updated;
    return json(draftView(updated));
  } catch (err) {
    console.error("space DELETE /content/drafts/:id/members/:userId failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/drafts/:id/discard: close the draft without publishing. Author only. */
drafts.post("/content/drafts/:id/discard", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await openableDraft(sql, who.id, c.req.param("id"));
    if (found instanceof Response) return found;
    const { draft } = found;
    if (draft.authorId !== who.id) return forbidden("Only the author can discard a draft.");
    if (draft.status !== "Open" && draft.status !== "InReview") {
      return apiError(409, "conflict", "This draft is already closed.");
    }
    await sql`UPDATE content_drafts SET status = 'Discarded', closed_at = now(), updated_at = now()
       WHERE id = ${draft.id}::text::uuid`;
    if (draft.versionId) {
      await sql`UPDATE page_versions SET status = 'rejected'
         WHERE id = ${draft.versionId}::text::uuid AND status = 'pending'`;
    }
    try {
      await docRoomStub(`draft:${draft.id}`).close("discarded");
    } catch (err) {
      console.error("space draft room close after discard failed", err);
    }
    const updated = await loadDraft(sql, draft.id);
    if (updated instanceof Response) return updated;
    return json(draftView(updated));
  } catch (err) {
    console.error("space POST /content/drafts/:id/discard failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * POST /v1/content/drafts/:id/publish {summary}: the author or a member publishes. With approval rules on the
 * page's template, the draft goes to review (201 with the pending version); otherwise it is published now.
 */
drafts.post("/content/drafts/:id/publish", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await openableDraft(sql, who.id, c.req.param("id"));
    if (found instanceof Response) return found;
    const { draft } = found;
    if (draft.status !== "Open") {
      return apiError(
        409,
        "conflict",
        draft.status === "InReview"
          ? "This draft is already waiting for approval."
          : "This draft is closed.",
      );
    }
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const rawSummary = typeof body["summary"] === "string" ? body["summary"].trim() : "";
    if (Array.from(rawSummary).length > 1000)
      return badRequest("summary is at most 1000 characters.");
    const summary = rawSummary === "" ? null : rawSummary;

    const staged = await stageDraft(draft);
    const minApprovals = await minApprovalsOf(sql, draft.pageId);
    if (minApprovals > 0) {
      const versionId = await sendForReview(sql, draft, staged, summary);
      return json({ status: "in_review", version_id: versionId, draft_id: draft.id }, 201);
    }
    const versionId = await publishStaged(sql, draft, staged, { summary });
    return json({ status: "published", version_id: versionId, draft_id: draft.id }, 201);
  } catch (err) {
    console.error("space POST /content/drafts/:id/publish failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default drafts;

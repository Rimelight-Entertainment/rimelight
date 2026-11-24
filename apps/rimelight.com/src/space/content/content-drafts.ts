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
  type AccessLevel,
  apiError,
  badRequest,
  forbidden,
  json,
  notFound,
  readBody,
  type Row,
  type Sql,
} from "../canvas-access.ts";
import {
  canOpenDraft,
  type ContentScope,
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
import { parseDraftListQuery, selectDrafts } from "./content-drafts-logic.ts";

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

/**
 * The caller's open (or in review) draft on a page, created if there is none. The caller must already have edit on
 * the page (the route checks it with loadPage). `created` is false when the draft existed.
 */
export async function openDraft(
  sql: Sql,
  caller: { id: string },
  pageId: string,
): Promise<{ draft: DraftRow; created: boolean } | Response> {
  const existing = await sql`SELECT id::text AS id FROM content_drafts
     WHERE page_id = ${pageId}::text::uuid AND author_id = ${caller.id}::text::uuid
       AND status IN ('Open', 'InReview')`;
  let draftId = existing[0]?.["id"] as string | undefined;
  let created = false;
  if (!draftId) {
    const inserted = await sql`INSERT INTO content_drafts (page_id, author_id)
       VALUES (${pageId}::text::uuid, ${caller.id}::text::uuid)
       ON CONFLICT (page_id, author_id) WHERE status IN ('Open', 'InReview') DO NOTHING
       RETURNING id::text AS id`;
    draftId = inserted[0]?.["id"] as string | undefined;
    created = draftId !== undefined;
    if (!draftId) {
      const again = await sql`SELECT id::text AS id FROM content_drafts
         WHERE page_id = ${pageId}::text::uuid AND author_id = ${caller.id}::text::uuid
           AND status IN ('Open', 'InReview')`;
      draftId = again[0]?.["id"] as string;
    }
  }
  const draft = await loadDraft(sql, draftId);
  if (draft instanceof Response) return draft;
  return { draft, created };
}

export type PublishResult = {
  status: "in_review" | "published";
  version_id: string;
  draft_id: string;
};

/**
 * Publishes a draft the caller may open: the author or a member. With approval rules on the page's template, the
 * draft goes to review (status in_review, the pending version); otherwise it is published now. Returns a Response
 * for every refusal (404, 403, 409). Shared by the publish route and the MCP publish_draft tool.
 */
export async function publishDraft(
  sql: Sql,
  caller: { id: string },
  draftId: string,
  summary: string | null,
): Promise<PublishResult | Response> {
  const found = await openableDraft(sql, caller.id, draftId);
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

  const staged = await stageDraft(draft);
  const minApprovals = await minApprovalsOf(sql, draft.pageId);
  if (minApprovals > 0) {
    const versionId = await sendForReview(sql, draft, staged, summary);
    return { status: "in_review", version_id: versionId, draft_id: draft.id };
  }
  const versionId = await publishStaged(sql, draft, staged, { summary });
  return { status: "published", version_id: versionId, draft_id: draft.id };
}

const drafts = new Hono();

const iso = (v: unknown) => new Date(v as string | Date).toISOString();

/**
 * GET /v1/content/drafts?status=Open|InReview&role=mine|member|reviewer: the drafts on pages the caller may view,
 * each once, with the roles it has for the caller. No status means both; no role means all three roles.
 */
drafts.get("/content/drafts", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const query = parseDraftListQuery(c.req.query("status"), c.req.query("role"));
  if (!query.ok) return badRequest(query.message);
  try {
    const sql = getSql();
    const rows =
      await sql`SELECT d.id::text AS id, d.page_id::text AS page_id, d.author_id::text AS author_id,
         d.status, d.version_id::text AS version_id, d.summary, d.updated_at,
         p.slug, p.type, p.title, p.visibility, p.scope_kind, p.scope_id::text AS scope_id
       FROM content_drafts d
       JOIN pages p ON p.id = d.page_id
       WHERE p.deleted_at IS NULL AND d.status IN ('Open', 'InReview')
       ORDER BY d.updated_at DESC, d.id`;
    const memberRows = await sql`SELECT m.draft_id::text AS draft_id, m.user_id::text AS user_id
       FROM content_draft_members m
       JOIN content_drafts d ON d.id = m.draft_id
       WHERE d.status IN ('Open', 'InReview')
       ORDER BY m.added_at, m.user_id`;
    const members = new Map<string, string[]>();
    for (const m of memberRows as Row[]) {
      const list = members.get(m["draft_id"]) ?? [];
      list.push(m["user_id"]);
      members.set(m["draft_id"], list);
    }

    const candidates = (rows as Row[]).map((r) => ({
      id: r["id"] as string,
      pageId: r["page_id"] as string,
      authorId: r["author_id"] as string,
      status: r["status"] as string,
      memberIds: members.get(r["id"]) ?? [],
      versionId: (r["version_id"] as string | null) ?? null,
      summary: (r["summary"] as string | null) ?? null,
      updatedAt: iso(r["updated_at"]),
      slug: r["slug"] as string,
      type: r["type"] as string,
      title: r["title"],
      visibility: r["visibility"] as string,
      scopeKind: r["scope_kind"] as ContentScope,
      scopeId: (r["scope_id"] as string | null) ?? null,
    }));

    // Access is per scope: one check for each scope among the candidates.
    const access = new Map<string, AccessLevel>();
    for (const d of candidates) {
      const key = `${d.scopeKind}:${d.scopeId ?? ""}`;
      if (!access.has(key)) {
        access.set(
          key,
          await pageAccess(sql, who.id, { scopeKind: d.scopeKind, scopeId: d.scopeId }),
        );
      }
    }
    const levelOf = (d: (typeof candidates)[number]) =>
      access.get(`${d.scopeKind}:${d.scopeId ?? ""}`) ?? "none";

    const selected = selectDrafts(candidates, who.id, query, levelOf);
    return json({
      drafts: selected.map(({ draft: d, roles }) => ({
        id: d.id,
        status: d.status,
        roles,
        page: {
          id: d.pageId,
          title: d.title,
          slug: d.slug,
          type: d.type,
          scope: { kind: d.scopeKind, id: d.scopeId },
          visibility: d.visibility,
        },
        authorId: d.authorId,
        versionId: d.versionId,
        summary: d.summary,
        members: d.memberIds,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (err) {
    console.error("space GET /content/drafts failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/pages/:id/drafts: the caller's open (or in review) draft on the page, created if there is none. */
drafts.post("/content/pages/:id/drafts", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const found = await loadPage(sql, who.id, c.req.param("id"), "edit");
    if (found instanceof Response) return found;
    const opened = await openDraft(sql, who, found.page.id);
    if (opened instanceof Response) return opened;
    return json(draftView(opened.draft), opened.created ? 201 : 200);
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
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    const rawSummary = typeof body["summary"] === "string" ? body["summary"].trim() : "";
    if (Array.from(rawSummary).length > 1000)
      return badRequest("summary is at most 1000 characters.");
    const summary = rawSummary === "" ? null : rawSummary;

    const result = await publishDraft(sql, who, c.req.param("id"), summary);
    if (result instanceof Response) return result;
    return json(result, 201);
  } catch (err) {
    console.error("space POST /content/drafts/:id/publish failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default drafts;

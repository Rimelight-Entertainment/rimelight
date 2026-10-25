import { and, asc, desc, eq, inArray, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import type { BaseBlock } from "../core/types/blocks";
import type { BylineCredit } from "../core/types/bylines";
import type { EntryStatus, Localized } from "../core/types/pages";
import type { ResolvedCollection } from "../core/collections/types";
import {
  defaultProperties,
  instantiateInitialBlocks,
  resolveLabel,
} from "../core/collections/define";
import { validateProperties } from "../core/collections/validate";
import { cloneBlock, normalizeBlocks } from "../core/blocks/tree";
import { validateServerBlockPayload } from "../auth/editor-guards";
import { diffPageSnapshots, type PageVersionDiff } from "../core/diff";
import type { PageVersion } from "../core/types/versioning";
import { generatePreviewToken } from "../core/preview";
import {
  CmsError,
  SYSTEM_ACTOR,
  isAdmin,
  json,
  notFound,
  requireRole,
  slugify,
  type CmsActor,
  type CmsContext,
} from "./context";
import { getCollection } from "./collections";
import { getTemplate } from "./templates";
import { indexEntry, removeEntryFromIndex } from "./search";

// ─── Shapes ──────────────────────────────────────────────────────────────────

export interface EntryContent {
  blocks: BaseBlock[];
  properties: Record<string, any>;
}

/** An entry as the admin API and dashboard see it. */
export interface Entry {
  id: string;
  collection: string;
  slug: string;
  status: EntryStatus;
  title: Localized;
  description: Localized | null;
  tags: Localized[];
  bylines: BylineCredit[];
  authorIds: string[];
  templateId: string | null;
  templateVersion: number;
  /** Published content (what readers see). */
  published: EntryContent;
  /** Working copy; equals `published` when there are no unpublished changes. */
  draft: EntryContent;
  hasUnpublishedChanges: boolean;
  draftUpdatedAt: Date | null;
  draftUpdatedBy: string | null;
  publishedVersionId: string | null;
  postedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type EntrySummary = Omit<Entry, "published" | "draft"> & {
  excerptTitle: string;
  published?: EntryContent;
};

export type PageVersionRow = PageVersion & { approvals?: number; required?: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LOCK_TTL_MS = 5 * 60 * 1000;

function content(raw: unknown): EntryContent {
  const c = json<any>(raw, {});
  return { blocks: normalizeBlocks(c?.blocks), properties: c?.properties ?? {} };
}

const date = (v: unknown): Date | null =>
  v == null ? null : v instanceof Date ? v : new Date(v as any);

function toSummary(row: any): EntrySummary {
  const title = json<Localized>(row.title, { en: "" });
  return {
    id: row.id,
    collection: row.type,
    slug: row.slug,
    status: row.status as EntryStatus,
    title,
    description: json(row.description, null),
    tags: json(row.tags, []),
    bylines: json(row.bylines, []),
    authorIds: json(row.authorIds, []),
    templateId: row.templateId ?? null,
    templateVersion: row.templateVersion ?? 1,
    hasUnpublishedChanges: false,
    draftUpdatedAt: null,
    draftUpdatedBy: null,
    publishedVersionId: row.publishedVersionId ?? null,
    postedAt: date(row.postedAt),
    scheduledAt: date(row.scheduledAt),
    createdAt: date(row.createdAt)!,
    updatedAt: date(row.updatedAt),
    deletedAt: date(row.deletedAt),
    excerptTitle: resolveLabel(title) || row.slug,
  };
}

function toEntry(row: any, draftRow: any): Entry {
  const published = content(row.content);
  const draft = draftRow ? content(draftRow.content) : published;
  const { excerptTitle: _, ...summary } = toSummary(row);
  return {
    ...summary,
    published,
    draft,
    hasUnpublishedChanges: !!draftRow && JSON.stringify(draft) !== JSON.stringify(published),
    draftUpdatedAt: draftRow ? date(draftRow.updatedAt) : null,
    draftUpdatedBy: draftRow?.updatedBy ?? null,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export interface ListEntriesOptions {
  collection?: string;
  status?: EntryStatus | EntryStatus[];
  /** Matches title or slug. */
  q?: string;
  /** Only entries whose slug starts with this prefix (wiki/doc trees). */
  slugPrefix?: string;
  taxonomy?: { taxonomy: string; term: string };
  includeDeleted?: boolean;
  orderBy?: "updated" | "created" | "posted" | "title" | "slug" | "type";
  /** Attach the published `{ blocks, properties }` to each summary (avoids N+1 lookups). */
  includeContent?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListEntriesResult {
  entries: EntrySummary[];
  total: number;
}

export async function listEntries(
  ctx: CmsContext,
  opts: ListEntriesOptions = {},
): Promise<ListEntriesResult> {
  const p = ctx.t.pages;
  const where: SQL[] = [];
  if (!opts.includeDeleted) where.push(isNull(p.deletedAt));
  if (opts.collection) where.push(eq(p.type, opts.collection));
  if (opts.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    where.push(inArray(p.status, statuses));
  }
  if (opts.slugPrefix) where.push(sql`${p.slug} like ${`${opts.slugPrefix}%`}`);
  if (opts.q) {
    const pattern = `%${opts.q.toLowerCase()}%`;
    where.push(
      or(
        sql`lower(cast(${p.title} as text)) like ${pattern}`,
        sql`lower(${p.slug}) like ${pattern}`,
      )!,
    );
  }
  if (opts.taxonomy) {
    const { taxonomyTerms: tt, pageTaxonomyTerms: ptt } = ctx.t;
    where.push(
      sql`${p.id} in (select ${ptt.pageId} from ${ptt} inner join ${tt} on ${tt.id} = ${ptt.termId} where ${tt.taxonomy} = ${opts.taxonomy.taxonomy} and ${tt.slug} = ${opts.taxonomy.term})`,
    );
  }

  const order = {
    updated: [desc(sql`coalesce(${p.updatedAt}, ${p.createdAt})`)],
    created: [desc(p.createdAt)],
    // Never-published entries (no postedAt) go last, not first (Postgres sorts NULLs first on DESC).
    posted: [sql`${p.postedAt} desc nulls last`, desc(p.createdAt)],
    title: [asc(sql`cast(${p.title} as text)`)],
    slug: [asc(p.slug)],
    type: [asc(p.type), desc(sql`coalesce(${p.updatedAt}, ${p.createdAt})`)],
  }[opts.orderBy ?? "updated"];

  const filter = where.length ? and(...where) : undefined;
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 500);
  const [rows, total] = await Promise.all([
    ctx.db
      .select()
      .from(p)
      .where(filter)
      .orderBy(...order)
      .limit(limit)
      .offset(opts.offset ?? 0),
    ctx.db
      .select({ n: sql<number>`count(*)` })
      .from(p)
      .where(filter),
  ]);

  // Flag entries with pending draft changes in one query.
  const ids = rows.map((r: any) => r.id);
  const drafts = ids.length
    ? await ctx.db
        .select({ pageId: ctx.t.pageDrafts.pageId, content: ctx.t.pageDrafts.content })
        .from(ctx.t.pageDrafts)
        .where(inArray(ctx.t.pageDrafts.pageId, ids))
    : [];
  const draftMap = new Map(drafts.map((d: any) => [d.pageId, d]));

  return {
    entries: rows.map((r: any) => {
      const s = toSummary(r);
      const d: any = draftMap.get(r.id);
      s.hasUnpublishedChanges =
        !!d && JSON.stringify(content(d.content)) !== JSON.stringify(content(r.content));
      return opts.includeContent ? { ...s, published: content(r.content) } : s;
    }),
    total: Number(total[0]?.n ?? 0),
  };
}

async function findRow(ctx: CmsContext, idOrSlug: string, collection?: string) {
  const p = ctx.t.pages;
  if (UUID.test(idOrSlug)) {
    const byId = await ctx.db.select().from(p).where(eq(p.id, idOrSlug)).limit(1);
    if (byId[0]) return byId[0];
  }
  const where = [eq(p.slug, idOrSlug), isNull(p.deletedAt)];
  if (collection) where.push(eq(p.type, collection));
  const bySlug = await ctx.db
    .select()
    .from(p)
    .where(and(...where))
    .limit(1);
  return bySlug[0] ?? null;
}

async function draftRow(ctx: CmsContext, id: string) {
  const rows = await ctx.db
    .select()
    .from(ctx.t.pageDrafts)
    .where(eq(ctx.t.pageDrafts.pageId, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEntry(
  ctx: CmsContext,
  idOrSlug: string,
  collection?: string,
): Promise<Entry> {
  const row = await findRow(ctx, idOrSlug, collection);
  if (!row) throw notFound("Entry");
  return toEntry(row, await draftRow(ctx, row.id));
}

// ─── Create / update / delete ────────────────────────────────────────────────

export interface CreateEntryInput {
  collection: string;
  title: Localized | string;
  slug?: string;
  description?: Localized | string | null;
  templateId?: string | null;
  blocks?: BaseBlock[];
  properties?: Record<string, any>;
  tags?: Localized[];
  bylines?: BylineCredit[];
}

const localized = (
  v: Localized | string | null | undefined,
  fallback?: Localized,
): Localized | null => (v == null ? (fallback ?? null) : typeof v === "string" ? { en: v } : v);

async function assertSlugFree(ctx: CmsContext, slug: string, exceptId?: string) {
  const p = ctx.t.pages;
  const where = [eq(p.slug, slug), isNull(p.deletedAt)];
  if (exceptId) where.push(ne(p.id, exceptId));
  const clash = await ctx.db
    .select({ id: p.id })
    .from(p)
    .where(and(...where))
    .limit(1);
  if (clash[0]) throw new CmsError(409, `Slug "${slug}" is already in use`);
}

function checkSlug(collection: ResolvedCollection, slug: string) {
  if (!slug) throw new CmsError(422, "Slug is required");
  if (slug.includes("/") && !collection.features.hierarchical) {
    throw new CmsError(422, `"${collection.slug}" entries cannot have nested slugs`);
  }
}

export async function createEntry(
  ctx: CmsContext,
  actor: CmsActor,
  input: CreateEntryInput,
): Promise<Entry> {
  const collection = await getCollection(ctx, input.collection);
  if (collection.kind === "singleton") {
    const existing = await listEntries(ctx, { collection: collection.slug, limit: 1 });
    if (existing.total > 0)
      throw new CmsError(409, `"${collection.slug}" is a singleton and already has an entry`);
  }

  const title = localized(input.title, { en: "Untitled" })!;
  const slug = slugify(input.slug || resolveLabel(title));
  checkSlug(collection, slug);
  await assertSlugFree(ctx, slug);

  let blocks = input.blocks ? normalizeBlocks(input.blocks) : null;
  let properties: Record<string, any> = { ...defaultProperties(collection), ...input.properties };
  let templateVersion = 1;

  if (input.templateId) {
    const template = await getTemplate(ctx, input.templateId);
    requireRole(
      actor,
      template.rolePermissions?.whoCanCreate?.length
        ? template.rolePermissions.whoCanCreate
        : template.allowedRoles,
      "create from this template",
    );
    templateVersion = template.version;
    blocks ??= template.initialBlocks.map(cloneBlock);
    properties = { ...template.defaultProperties, ...properties };
  }
  blocks ??= instantiateInitialBlocks(collection);
  if (blocks.length === 0 && collection.features.blocks) {
    blocks = [ctx.blocks.create("ParagraphBlock")];
  }

  const errors = validateProperties(collection, properties, { partial: true });
  if (errors.length) throw new CmsError(422, "Invalid properties", errors);

  const now = new Date();
  const body = { blocks, properties };
  const [row] = await ctx.db
    .insert(ctx.t.pages)
    .values({
      slug,
      type: collection.slug,
      status: "draft",
      templateId: input.templateId ?? null,
      templateVersion,
      title,
      description: localized(input.description ?? null),
      tags: input.tags ?? [],
      authorIds: [actor.userId],
      bylines: input.bylines ?? [],
      // Readers never see draft entries (status filter), so seeding `content` is safe and keeps
      // the NOT NULL column satisfied.
      content: body,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  await ctx.db.insert(ctx.t.pageDrafts).values({
    pageId: row.id,
    content: body,
    updatedBy: actor.userId,
    updatedAt: now,
  });
  return getEntry(ctx, row.id);
}

export interface UpdateEntryMetaInput {
  slug?: string;
  title?: Localized | string;
  description?: Localized | string | null;
  tags?: Localized[];
  bylines?: BylineCredit[];
  collection?: string;
}

/** Metadata changes apply immediately (they are not part of the draft/publish cycle). */
export async function updateEntryMeta(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  input: UpdateEntryMetaInput,
): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  const patch: Record<string, any> = { updatedAt: new Date() };
  if (input.collection !== undefined && input.collection !== entry.collection) {
    await getCollection(ctx, input.collection);
    patch["type"] = input.collection;
  }
  if (input.slug !== undefined) {
    const collection = await getCollection(ctx, input.collection ?? entry.collection);
    const slug = slugify(input.slug);
    checkSlug(collection, slug);
    await assertSlugFree(ctx, slug, entry.id);
    patch["slug"] = slug;
  }
  if (input.title !== undefined) patch["title"] = localized(input.title);
  if (input.description !== undefined) patch["description"] = localized(input.description);
  if (input.tags !== undefined) patch["tags"] = input.tags;
  if (input.bylines !== undefined) patch["bylines"] = input.bylines;
  await ctx.db.update(ctx.t.pages).set(patch).where(eq(ctx.t.pages.id, entry.id));
  const updated = await getEntry(ctx, entry.id);
  if (updated.status === "published") await indexEntry(ctx, updated);
  return updated;
}

export async function deleteEntry(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
): Promise<{ success: true }> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  await ctx.db
    .update(ctx.t.pages)
    .set({ deletedAt: new Date(), status: "archived" })
    .where(eq(ctx.t.pages.id, entry.id));
  await removeEntryFromIndex(ctx, entry.id);
  return { success: true };
}

export async function restoreEntry(ctx: CmsContext, actor: CmsActor, id: string): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  await assertSlugFree(ctx, entry.slug, entry.id);
  await ctx.db
    .update(ctx.t.pages)
    .set({ deletedAt: null, status: "draft", updatedAt: new Date() })
    .where(eq(ctx.t.pages.id, entry.id));
  return getEntry(ctx, entry.id);
}

export async function duplicateEntry(ctx: CmsContext, actor: CmsActor, id: string): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  let slug = `${entry.slug}-copy`;
  for (let i = 2; ; i++) {
    const clash = await findRow(ctx, slug);
    if (!clash || clash.deletedAt) break;
    slug = `${entry.slug}-copy-${i}`;
  }
  const title = Object.fromEntries(Object.entries(entry.title).map(([k, v]) => [k, `${v} (copy)`]));
  return createEntry(ctx, actor, {
    collection: entry.collection,
    title,
    slug,
    description: entry.description,
    blocks: structuredClone(entry.draft.blocks),
    properties: structuredClone(entry.draft.properties),
    tags: entry.tags,
    bylines: entry.bylines,
  });
}

// ─── Permissions ─────────────────────────────────────────────────────────────

async function assertCanEdit(ctx: CmsContext, actor: CmsActor, entry: Entry) {
  if (isAdmin(actor)) return;
  if (entry.templateId) {
    const template = await getTemplate(ctx, entry.templateId).catch(() => null);
    if (template) requireRole(actor, template.rolePermissions?.whoCanEdit, "edit this entry");
  }
}

// ─── Drafts & locks ──────────────────────────────────────────────────────────

export interface LockState {
  locked: boolean;
  ownedByActor: boolean;
  userId?: string;
  userName?: string;
  expiresAt?: Date;
}

export async function getLock(
  ctx: CmsContext,
  actor: CmsActor,
  entryId: string,
): Promise<LockState> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.pageDraftLocks)
    .where(eq(ctx.t.pageDraftLocks.pageId, entryId))
    .limit(1);
  const lock = rows[0];
  if (!lock || date(lock.expiresAt)! < new Date()) return { locked: false, ownedByActor: false };
  return {
    locked: true,
    ownedByActor: lock.lockedByUserId === actor.userId,
    userId: lock.lockedByUserId,
    userName: lock.lockedByUserName,
    expiresAt: date(lock.expiresAt)!,
  };
}

/** Acquire or refresh the edit lock. `force` (admins) steals a lock held by someone else. */
export async function acquireLock(
  ctx: CmsContext,
  actor: CmsActor,
  entryId: string,
  { force = false }: { force?: boolean } = {},
): Promise<LockState> {
  const current = await getLock(ctx, actor, entryId);
  if (current.locked && !current.ownedByActor && !(force && isAdmin(actor))) return current;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);
  const values = {
    pageId: entryId,
    lockedByUserId: actor.userId,
    lockedByUserName: actor.name ?? actor.userId,
    acquiredAt: now,
    expiresAt,
  };
  await ctx.db
    .insert(ctx.t.pageDraftLocks)
    .values(values)
    .onConflictDoUpdate({ target: ctx.t.pageDraftLocks.pageId, set: values });
  return {
    locked: true,
    ownedByActor: true,
    userId: actor.userId,
    userName: values.lockedByUserName,
    expiresAt,
  };
}

export async function releaseLock(
  ctx: CmsContext,
  actor: CmsActor,
  entryId: string,
): Promise<{ success: true }> {
  await ctx.db
    .delete(ctx.t.pageDraftLocks)
    .where(
      and(
        eq(ctx.t.pageDraftLocks.pageId, entryId),
        eq(ctx.t.pageDraftLocks.lockedByUserId, actor.userId),
      ),
    );
  return { success: true };
}

export interface SaveDraftInput {
  blocks?: BaseBlock[];
  properties?: Record<string, any>;
}

/**
 * Saves the working copy. Enforces the edit lock, templated-block guards, block nesting rules and
 * property types. Readers are unaffected until publish.
 */
export async function saveDraft(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  input: SaveDraftInput,
): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);

  const lock = await getLock(ctx, actor, entry.id);
  if (lock.locked && !lock.ownedByActor) {
    throw new CmsError(409, `${lock.userName ?? "Another user"} is editing this entry`);
  }

  const next: EntryContent = {
    blocks: input.blocks ? normalizeBlocks(input.blocks) : entry.draft.blocks,
    properties: input.properties ?? entry.draft.properties,
  };

  const guard = validateServerBlockPayload(entry.draft.blocks, next.blocks, actor);
  if (!guard.valid) throw new CmsError(403, guard.reason ?? "Forbidden block change");

  const collection = await getCollection(ctx, entry.collection);
  const nesting = validateNesting(ctx, collection, next.blocks);
  if (nesting) throw new CmsError(422, nesting);
  const errors = validateProperties(collection, next.properties, { partial: true });
  if (errors.length) throw new CmsError(422, "Invalid properties", errors);

  const now = new Date();
  await ctx.db
    .insert(ctx.t.pageDrafts)
    .values({ pageId: entry.id, content: next, updatedBy: actor.userId, updatedAt: now })
    .onConflictDoUpdate({
      target: ctx.t.pageDrafts.pageId,
      set: { content: next, updatedBy: actor.userId, updatedAt: now },
    });
  await ctx.db.update(ctx.t.pages).set({ updatedAt: now }).where(eq(ctx.t.pages.id, entry.id));
  if (lock.ownedByActor) await acquireLock(ctx, actor, entry.id); // refresh TTL
  return getEntry(ctx, entry.id);
}

export async function discardDraft(ctx: CmsContext, actor: CmsActor, id: string): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  if (entry.status === "draft" && !entry.publishedVersionId) {
    throw new CmsError(400, "This entry has never been published; there is nothing to revert to");
  }
  await ctx.db.delete(ctx.t.pageDrafts).where(eq(ctx.t.pageDrafts.pageId, entry.id));
  return getEntry(ctx, entry.id);
}

/** Returns an error message if a block is placed somewhere its parent doesn't allow. */
function validateNesting(
  ctx: CmsContext,
  collection: ResolvedCollection,
  blocks: BaseBlock[],
): string | null {
  const check = (
    list: BaseBlock[],
    parentType: string | null,
    depthOf: Record<string, number>,
  ): string | null => {
    const allowed = ctx.blocks.allowedChildren(
      parentType,
      parentType ? undefined : collection.allowedBlocks,
    );
    for (const b of list) {
      // Unknown block types (e.g. removed custom blocks) are preserved, not rejected.
      if (ctx.blocks.has(b.type) && !allowed.some((d) => d.type === b.type)) {
        return `${b.type} is not allowed ${parentType ? `inside ${parentType}` : "at the top level"}`;
      }
      const depth = (depthOf[b.type] ?? 0) + 1;
      const max = ctx.blocks.get(b.type)?.maxNesting;
      if (max && depth > max) return `${b.type} can't be nested more than ${max} levels deep`;
      if (b.children?.length) {
        const nested = check(b.children, b.type, { ...depthOf, [b.type]: depth });
        if (nested) return nested;
      }
    }
    return null;
  };
  return check(blocks, null, {});
}

// ─── Workflow: review, approve, publish ──────────────────────────────────────

async function workflowFor(ctx: CmsContext, entry: Entry) {
  const collection = await getCollection(ctx, entry.collection);
  const template = entry.templateId
    ? await getTemplate(ctx, entry.templateId).catch(() => null)
    : null;
  const rules = template?.approvalRules ?? {};
  return {
    minApprovals: Math.max(rules.minApprovals ?? 0, collection.workflow.minApprovals),
    allowSelfApproval: (rules.allowSelfApproval ?? true) && collection.workflow.allowSelfApproval,
    reviewerRoles: template?.rolePermissions?.whoCanReview?.length
      ? template.rolePermissions.whoCanReview
      : (rules.requiredRolesForApproval ?? collection.workflow.requiredRolesForApproval),
  };
}

async function nextVersionNumber(ctx: CmsContext, entryId: string) {
  const v = ctx.t.pageVersions;
  const rows = await ctx.db
    .select({ n: v.versionNumber })
    .from(v)
    .where(eq(v.pageId, entryId))
    .orderBy(desc(v.versionNumber))
    .limit(1);
  return (rows[0]?.n ?? 0) + 1;
}

async function snapshotVersion(
  ctx: CmsContext,
  actor: CmsActor,
  entry: Entry,
  body: EntryContent,
  status: "pending" | "published",
  changeSummary?: string,
) {
  const [version] = await ctx.db
    .insert(ctx.t.pageVersions)
    .values({
      pageId: entry.id,
      versionNumber: await nextVersionNumber(ctx, entry.id),
      status,
      slug: entry.slug,
      type: entry.collection,
      title: entry.title,
      description: entry.description,
      tags: entry.tags,
      authorIds: entry.authorIds,
      bylines: entry.bylines,
      content: body,
      createdBy: actor.userId,
      approvedBy: [],
      changeSummary: changeSummary ?? null,
      createdAt: new Date(),
    })
    .returning();
  return version;
}

/** Freezes the current draft as a pending version for reviewers. */
export async function requestReview(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  changeSummary?: string,
): Promise<PageVersionRow> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  return snapshotVersion(ctx, actor, entry, entry.draft, "pending", changeSummary);
}

export async function approveVersion(
  ctx: CmsContext,
  actor: CmsActor,
  versionId: string,
): Promise<PageVersionRow> {
  const version = await getVersion(ctx, versionId);
  if (version.status !== "pending" && version.status !== "approved") {
    throw new CmsError(400, `Version is ${version.status}`);
  }
  const entry = await getEntry(ctx, version.pageId);
  const wf = await workflowFor(ctx, entry);
  requireRole(actor, wf.reviewerRoles, "review this entry");
  if (!wf.allowSelfApproval && version.createdBy === actor.userId && !isAdmin(actor)) {
    throw new CmsError(403, "You cannot approve your own changes");
  }

  const a = ctx.t.pageVersionApprovals;
  const existing = await ctx.db
    .select()
    .from(a)
    .where(and(eq(a.versionId, versionId), eq(a.userId, actor.userId)))
    .limit(1);
  if (!existing[0]) {
    await ctx.db.insert(a).values({
      versionId,
      userId: actor.userId,
      userRole: actor.roles[0] ?? "member",
      approvedAt: new Date(),
    });
  }
  const approvals = await ctx.db.select().from(a).where(eq(a.versionId, versionId));
  const approvers = approvals.map((x: any) => x.userId as string);
  const effective = wf.allowSelfApproval
    ? approvers
    : approvers.filter((u: string) => u !== version.createdBy);
  const status = effective.length >= wf.minApprovals ? "approved" : "pending";
  await ctx.db
    .update(ctx.t.pageVersions)
    .set({ approvedBy: approvers, approvedAt: new Date(), status })
    .where(eq(ctx.t.pageVersions.id, versionId));
  return {
    ...(await getVersion(ctx, versionId)),
    approvals: effective.length,
    required: wf.minApprovals,
  };
}

export async function rejectVersion(
  ctx: CmsContext,
  actor: CmsActor,
  versionId: string,
  reason?: string,
): Promise<PageVersionRow> {
  const version = await getVersion(ctx, versionId);
  const entry = await getEntry(ctx, version.pageId);
  const wf = await workflowFor(ctx, entry);
  requireRole(actor, wf.reviewerRoles, "review this entry");
  await ctx.db
    .update(ctx.t.pageVersions)
    .set({ status: "rejected" })
    .where(eq(ctx.t.pageVersions.id, versionId));
  if (reason) await addComment(ctx, actor, versionId, reason);
  return getVersion(ctx, versionId);
}

export interface PublishInput {
  /** Publish a specific approved version instead of the current draft. */
  versionId?: string;
  changeSummary?: string;
}

/**
 * Publishes the draft (or an approved version). When the collection/template requires approvals,
 * non-admins can only publish a version that has collected them.
 */
export async function publishEntry(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  input: PublishInput = {},
): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  const wf = await workflowFor(ctx, entry);
  const needsApproval = wf.minApprovals > 0 && !isAdmin(actor);

  let version: any;
  if (input.versionId) {
    version = await getVersion(ctx, input.versionId);
    if (version.pageId !== entry.id) throw new CmsError(400, "Version belongs to another entry");
    if (needsApproval && version.status !== "approved") {
      throw new CmsError(
        403,
        `This version needs ${wf.minApprovals} approval(s) before publishing`,
      );
    }
    await ctx.db
      .update(ctx.t.pageVersions)
      .set({ status: "published" })
      .where(eq(ctx.t.pageVersions.id, version.id));
  } else {
    if (needsApproval) {
      throw new CmsError(
        403,
        `Publishing requires ${wf.minApprovals} approval(s). Request a review first.`,
      );
    }
    version = await snapshotVersion(
      ctx,
      actor,
      entry,
      entry.draft,
      "published",
      input.changeSummary,
    );
    await ctx.db.insert(ctx.t.pageVersionApprovals).values({
      versionId: version.id,
      userId: actor.userId,
      userRole: actor.roles[0] ?? "member",
      approvedAt: new Date(),
    });
  }

  const body = content(version.content);
  const now = new Date();
  await ctx.db
    .update(ctx.t.pages)
    .set({
      content: body,
      status: "published",
      scheduledAt: null,
      publishedVersionId: version.id,
      postedAt: entry.postedAt ?? now,
      updatedAt: now,
    })
    .where(eq(ctx.t.pages.id, entry.id));
  // The draft now matches what's live.
  await ctx.db.delete(ctx.t.pageDrafts).where(eq(ctx.t.pageDrafts.pageId, entry.id));

  const published = await getEntry(ctx, entry.id);
  await indexEntry(ctx, published);
  return published;
}

export async function unpublishEntry(ctx: CmsContext, actor: CmsActor, id: string): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  // Keep the live content as the draft so nothing is lost.
  if (!(await draftRow(ctx, entry.id))) {
    await ctx.db.insert(ctx.t.pageDrafts).values({
      pageId: entry.id,
      content: entry.published,
      updatedBy: actor.userId,
      updatedAt: new Date(),
    });
  }
  await ctx.db
    .update(ctx.t.pages)
    .set({ status: "draft", scheduledAt: null, updatedAt: new Date() })
    .where(eq(ctx.t.pages.id, entry.id));
  await removeEntryFromIndex(ctx, entry.id);
  return getEntry(ctx, entry.id);
}

export async function scheduleEntry(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  at: Date | string | null,
): Promise<Entry> {
  const entry = await getEntry(ctx, id);
  await assertCanEdit(ctx, actor, entry);
  const collection = await getCollection(ctx, entry.collection);
  if (!collection.features.scheduled)
    throw new CmsError(400, `"${collection.slug}" does not support scheduling`);
  if (at === null) {
    await ctx.db
      .update(ctx.t.pages)
      .set({ status: entry.publishedVersionId ? "published" : "draft", scheduledAt: null })
      .where(eq(ctx.t.pages.id, entry.id));
    return getEntry(ctx, entry.id);
  }
  const when = new Date(at);
  if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() - 60_000) {
    throw new CmsError(422, "Schedule time must be in the future");
  }
  const wf = await workflowFor(ctx, entry);
  if (wf.minApprovals > 0 && !isAdmin(actor)) {
    throw new CmsError(403, "Entries that require approval can only be scheduled by admins");
  }
  // Already-published entries stay live; the scheduled draft replaces them at `when`.
  await ctx.db
    .update(ctx.t.pages)
    .set({
      status: entry.status === "published" ? "published" : "scheduled",
      scheduledAt: when,
      updatedAt: new Date(),
    })
    .where(eq(ctx.t.pages.id, entry.id));
  return getEntry(ctx, entry.id);
}

/** Publishes every entry whose `scheduled_at` has passed. Called by the cron handler. */
export async function publishDueEntries(
  ctx: CmsContext,
  now: Date = new Date(),
): Promise<{ published: string[]; failed: { id: string; error: string }[] }> {
  const p = ctx.t.pages;
  const due = await ctx.db
    .select({ id: p.id })
    .from(p)
    .where(and(isNull(p.deletedAt), lte(p.scheduledAt, now)))
    .limit(100);
  const published: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const { id } of due) {
    try {
      await publishEntry(ctx, SYSTEM_ACTOR, id, { changeSummary: "Scheduled publish" });
      published.push(id);
    } catch (err) {
      failed.push({ id, error: String((err as Error).message ?? err) });
    }
  }
  return { published, failed };
}

// ─── Versions ────────────────────────────────────────────────────────────────

export async function listVersions(
  ctx: CmsContext,
  entryId?: string,
  limit = 50,
): Promise<PageVersionRow[]> {
  const v = ctx.t.pageVersions;
  const query = ctx.db
    .select({
      id: v.id,
      pageId: v.pageId,
      versionNumber: v.versionNumber,
      status: v.status,
      title: v.title,
      slug: v.slug,
      type: v.type,
      createdBy: v.createdBy,
      approvedBy: v.approvedBy,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    })
    .from(v);
  const rows = await (entryId ? query.where(eq(v.pageId, entryId)) : query)
    .orderBy(desc(v.createdAt))
    .limit(limit);
  return rows.map((r: any) => ({
    ...r,
    title: json(r.title, {}),
    approvedBy: json(r.approvedBy, []),
  }));
}

export async function getVersion(ctx: CmsContext, versionId: string): Promise<PageVersionRow> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.pageVersions)
    .where(eq(ctx.t.pageVersions.id, versionId))
    .limit(1);
  if (!rows[0]) throw notFound("Version");
  const r = rows[0];
  return {
    ...r,
    title: json(r.title, {}),
    description: json(r.description, null),
    approvedBy: json<string[]>(r.approvedBy, []),
    content: content(r.content),
  };
}

/** Pending/approved versions awaiting action, newest first (the review queue). */
export async function reviewQueue(ctx: CmsContext): Promise<PageVersionRow[]> {
  const v = ctx.t.pageVersions;
  const rows = await ctx.db
    .select({
      id: v.id,
      pageId: v.pageId,
      versionNumber: v.versionNumber,
      status: v.status,
      title: v.title,
      slug: v.slug,
      type: v.type,
      createdBy: v.createdBy,
      approvedBy: v.approvedBy,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    })
    .from(v)
    .where(inArray(v.status, ["pending", "approved"]))
    .orderBy(desc(v.createdAt))
    .limit(100);
  return rows.map((r: any) => ({
    ...r,
    title: json(r.title, {}),
    approvedBy: json(r.approvedBy, []),
  }));
}

/** Restores a version's content into the draft (does not publish). */
export async function rollbackToVersion(
  ctx: CmsContext,
  actor: CmsActor,
  versionId: string,
): Promise<Entry> {
  const version = await getVersion(ctx, versionId);
  return saveDraft(ctx, actor, version.pageId, version.content);
}

export async function diffEntry(
  ctx: CmsContext,
  entryId: string,
  from?: string | number,
  to?: string | number,
): Promise<PageVersionDiff> {
  const entry = await getEntry(ctx, entryId);
  const v = ctx.t.pageVersions;
  const load = async (ref: string | number | undefined, fallback: EntryContent) => {
    if (ref === undefined || ref === "") return { ...entry, content: fallback };
    const n = Number(ref);
    const where = Number.isInteger(n)
      ? and(eq(v.pageId, entry.id), eq(v.versionNumber, n))
      : eq(v.id, String(ref));
    const rows = await ctx.db.select().from(v).where(where).limit(1);
    if (!rows[0]) throw notFound(`Version ${ref}`);
    return { ...rows[0], title: json(rows[0].title, {}), content: content(rows[0].content) };
  };
  const a = await load(from, entry.published);
  const b = await load(to, entry.draft);
  return diffPageSnapshots(a, b);
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function addComment(
  ctx: CmsContext,
  actor: CmsActor,
  versionId: string,
  body: string,
  blockId?: string,
): Promise<any> {
  await getVersion(ctx, versionId);
  if (!body.trim()) throw new CmsError(422, "Comment is empty");
  const [row] = await ctx.db
    .insert(ctx.t.pageVersionComments)
    .values({
      versionId,
      userId: actor.userId,
      userRole: actor.roles[0] ?? "member",
      content: body.trim(),
      blockId: blockId ?? null,
      createdAt: new Date(),
    })
    .returning();
  return row;
}

export async function listComments(ctx: CmsContext, versionId: string): Promise<any[]> {
  const c = ctx.t.pageVersionComments;
  return ctx.db.select().from(c).where(eq(c.versionId, versionId)).orderBy(asc(c.createdAt));
}

// ─── Preview ─────────────────────────────────────────────────────────────────

export async function createPreviewToken(
  ctx: CmsContext,
  entryId: string,
  ttlSeconds: number = 7 * 86400,
): Promise<{ token: string; expiresAt: number }> {
  if (!ctx.previewSecret) throw new CmsError(500, "CMS_PREVIEW_SECRET is not configured");
  await getEntry(ctx, entryId);
  return generatePreviewToken(entryId, ctx.previewSecret, ttlSeconds);
}

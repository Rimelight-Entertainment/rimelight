import { and, asc, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { CmsError, notFound, type CmsContext } from "./context";

/** A folder in the media tree. `parentId` null = top level. */
export interface MediaFolder {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: Date;
}

/** A library file. `storageKey` never changes after upload; the public URL is built from it. */
export interface MediaAsset {
  id: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: Record<string, string> | null;
  caption: Record<string, string> | null;
  focalX: number | null;
  focalY: number | null;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface MediaAssetPatch {
  filename?: string;
  alt?: Record<string, string> | null;
  caption?: Record<string, string> | null;
  focalX?: number | null;
  focalY?: number | null;
  folderId?: string | null;
  width?: number | null;
  height?: number | null;
  storageKey?: string;
  mimeType?: string;
  size?: number;
}

export type MediaTypeFilter = "all" | "images" | "videos" | "audio" | "documents";

const newId = () => crypto.randomUUID();

const toFolder = (r: any): MediaFolder => ({
  id: r.id,
  parentId: r.parentId ?? null,
  name: r.name,
  createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
});

const toAsset = (r: any): MediaAsset => ({
  id: r.id,
  storageKey: r.storageKey,
  filename: r.filename,
  mimeType: r.mimeType,
  size: Number(r.size),
  width: r.width == null ? null : Number(r.width),
  height: r.height == null ? null : Number(r.height),
  alt: parseLocalized(r.alt),
  caption: parseLocalized(r.caption),
  focalX: r.focalX == null ? null : Number(r.focalX),
  focalY: r.focalY == null ? null : Number(r.focalY),
  folderId: r.folderId ?? null,
  createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
  updatedAt: r.updatedAt
    ? r.updatedAt instanceof Date
      ? r.updatedAt
      : new Date(r.updatedAt)
    : null,
});

/** SQLite stores JSON as text; Postgres returns objects. Accept both. */
function parseLocalized(v: unknown): Record<string, string> | null {
  if (v == null) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return v as Record<string, string>;
}

/** Drops empty locale entries so `{ en: "", pt: "x" }` stores only `{ pt: "x" }`. */
export function cleanLocalized(
  v: Record<string, string> | null | undefined,
): Record<string, string> | null {
  if (!v) return null;
  const out: Record<string, string> = {};
  for (const [k, text] of Object.entries(v)) if (text && text.trim()) out[k] = text.trim();
  return Object.keys(out).length ? out : null;
}

export async function listFolders(ctx: CmsContext): Promise<MediaFolder[]> {
  const rows = await ctx.db.select().from(ctx.t.mediaFolders).orderBy(asc(ctx.t.mediaFolders.name));
  return rows.map(toFolder);
}

export async function createFolder(
  ctx: CmsContext,
  input: { name: string; parentId?: string | null },
): Promise<MediaFolder> {
  const name = input.name.trim().replace(/[\\/]/g, "-");
  if (!name) throw new CmsError(422, "Folder name is required.");
  const parentId = input.parentId ?? null;
  if (parentId) await getFolder(ctx, parentId);
  await assertUniqueFolderName(ctx, parentId, name);
  const row = { id: newId(), parentId, name, createdAt: new Date() };
  await ctx.db.insert(ctx.t.mediaFolders).values(row);
  return toFolder(row);
}

export async function getFolder(ctx: CmsContext, id: string): Promise<MediaFolder> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.mediaFolders)
    .where(eq(ctx.t.mediaFolders.id, id))
    .limit(1);
  if (!rows[0]) throw notFound("Folder");
  return toFolder(rows[0]);
}

async function assertUniqueFolderName(
  ctx: CmsContext,
  parentId: string | null,
  name: string,
  exceptId?: string,
) {
  const rows = await ctx.db
    .select({ id: ctx.t.mediaFolders.id })
    .from(ctx.t.mediaFolders)
    .where(
      and(
        parentId ? eq(ctx.t.mediaFolders.parentId, parentId) : isNull(ctx.t.mediaFolders.parentId),
        eq(ctx.t.mediaFolders.name, name),
      ),
    );
  if (rows.some((r: any) => r.id !== exceptId)) {
    throw new CmsError(409, `A folder named "${name}" already exists here.`);
  }
}

/** Renames and/or moves a folder. Moving into its own subtree is rejected. */
export async function updateFolder(
  ctx: CmsContext,
  id: string,
  patch: { name?: string; parentId?: string | null },
): Promise<MediaFolder> {
  const current = await getFolder(ctx, id);
  const name = patch.name !== undefined ? patch.name.trim().replace(/[\\/]/g, "-") : current.name;
  const parentId = patch.parentId !== undefined ? patch.parentId : current.parentId;
  if (parentId === id) throw new CmsError(422, "A folder cannot contain itself.");
  if (parentId) {
    for (let p: string | null = parentId; p;) {
      if (p === id) throw new CmsError(422, "A folder cannot move into its own subfolder.");
      p = (await getFolder(ctx, p)).parentId;
    }
  }
  await assertUniqueFolderName(ctx, parentId, name, id);
  await ctx.db
    .update(ctx.t.mediaFolders)
    .set({ name, parentId })
    .where(eq(ctx.t.mediaFolders.id, id));
  return { ...current, name, parentId };
}

/** Deletes an empty folder. Non-empty folders must be emptied first (the caller decides). */
export async function deleteFolder(ctx: CmsContext, id: string): Promise<void> {
  await getFolder(ctx, id);
  const children = await ctx.db
    .select({ id: ctx.t.mediaFolders.id })
    .from(ctx.t.mediaFolders)
    .where(eq(ctx.t.mediaFolders.parentId, id))
    .limit(1);
  const files = await ctx.db
    .select({ id: ctx.t.mediaAssets.id })
    .from(ctx.t.mediaAssets)
    .where(eq(ctx.t.mediaAssets.folderId, id))
    .limit(1);
  if (children.length || files.length) {
    throw new CmsError(409, "The folder is not empty. Move its contents first.");
  }
  await ctx.db.delete(ctx.t.mediaFolders).where(eq(ctx.t.mediaFolders.id, id));
}

const TYPE_LIKE: Record<Exclude<MediaTypeFilter, "all">, [string, string?]> = {
  images: ["image/%"],
  videos: ["video/%"],
  audio: ["audio/%"],
  documents: ["%pdf%"],
};

export interface AssetQuery {
  /** `null` = top level, a folder id = that folder, `undefined` = every folder (search mode). */
  folderId?: string | null | undefined;
  search?: string | undefined;
  type?: MediaTypeFilter | undefined;
  limit?: number | undefined;
  /** Offset cursor returned by the previous page. */
  cursor?: string | undefined;
}

export async function listAssets(
  ctx: CmsContext,
  q: AssetQuery,
): Promise<{ assets: MediaAsset[]; nextCursor: string | null }> {
  const t = ctx.t.mediaAssets;
  const conditions: any[] = [];
  if (q.folderId === null) conditions.push(isNull(t.folderId));
  else if (typeof q.folderId === "string") conditions.push(eq(t.folderId, q.folderId));
  const search = q.search?.trim().toLowerCase();
  if (search) {
    // Escape LIKE wildcards in the term; `escape` makes the backslash meaningful on SQLite too.
    const pattern = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(sql`lower(${t.filename}) like ${pattern} escape '\\'`);
  }
  if (q.type && q.type !== "all") {
    if (q.type === "documents") {
      conditions.push(
        or(like(t.mimeType, "%pdf%"), like(t.mimeType, "text/%"), like(t.mimeType, "%document%")),
      );
    } else {
      conditions.push(like(t.mimeType, TYPE_LIKE[q.type][0]));
    }
  }
  const limit = Math.min(Math.max(q.limit ?? 60, 1), 200);
  const offset = Math.max(Number(q.cursor ?? 0) || 0, 0);
  const rows = await ctx.db
    .select()
    .from(t)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(t.createdAt), asc(t.filename))
    .limit(limit + 1)
    .offset(offset);
  const hasMore = rows.length > limit;
  return {
    assets: rows.slice(0, limit).map(toAsset),
    nextCursor: hasMore ? String(offset + limit) : null,
  };
}

export async function getAsset(ctx: CmsContext, id: string): Promise<MediaAsset> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.mediaAssets)
    .where(eq(ctx.t.mediaAssets.id, id))
    .limit(1);
  if (!rows[0]) throw notFound("File");
  return toAsset(rows[0]);
}

export async function findAssetByKey(
  ctx: CmsContext,
  storageKey: string,
): Promise<MediaAsset | null> {
  const rows = await ctx.db
    .select()
    .from(ctx.t.mediaAssets)
    .where(eq(ctx.t.mediaAssets.storageKey, storageKey))
    .limit(1);
  return rows[0] ? toAsset(rows[0]) : null;
}

export async function createAsset(
  ctx: CmsContext,
  input: {
    id?: string;
    storageKey: string;
    filename: string;
    mimeType: string;
    size: number;
    width?: number | null;
    height?: number | null;
    alt?: Record<string, string> | null;
    caption?: Record<string, string> | null;
    folderId?: string | null;
  },
): Promise<MediaAsset> {
  if (input.folderId) await getFolder(ctx, input.folderId);
  const row = {
    id: input.id ?? newId(),
    storageKey: input.storageKey,
    filename: input.filename,
    mimeType: input.mimeType,
    size: input.size,
    width: input.width ?? null,
    height: input.height ?? null,
    alt: cleanLocalized(input.alt) as any,
    caption: cleanLocalized(input.caption) as any,
    focalX: null,
    focalY: null,
    folderId: input.folderId ?? null,
    createdAt: new Date(),
    updatedAt: null,
  };
  await ctx.db.insert(ctx.t.mediaAssets).values(row);
  return toAsset(row);
}

export async function updateAsset(
  ctx: CmsContext,
  id: string,
  patch: MediaAssetPatch,
): Promise<MediaAsset> {
  await getAsset(ctx, id);
  if (patch.folderId) await getFolder(ctx, patch.folderId);
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.filename !== undefined) set["filename"] = patch.filename;
  if (patch.alt !== undefined) set["alt"] = cleanLocalized(patch.alt);
  if (patch.caption !== undefined) set["caption"] = cleanLocalized(patch.caption);
  if (patch.focalX !== undefined) set["focalX"] = patch.focalX;
  if (patch.focalY !== undefined) set["focalY"] = patch.focalY;
  if (patch.folderId !== undefined) set["folderId"] = patch.folderId;
  if (patch.width !== undefined) set["width"] = patch.width;
  if (patch.height !== undefined) set["height"] = patch.height;
  if (patch.storageKey !== undefined) set["storageKey"] = patch.storageKey;
  if (patch.mimeType !== undefined) set["mimeType"] = patch.mimeType;
  if (patch.size !== undefined) set["size"] = patch.size;
  await ctx.db.update(ctx.t.mediaAssets).set(set).where(eq(ctx.t.mediaAssets.id, id));
  return getAsset(ctx, id);
}

export async function deleteAsset(ctx: CmsContext, id: string): Promise<MediaAsset> {
  const asset = await getAsset(ctx, id);
  await ctx.db.delete(ctx.t.mediaAssets).where(eq(ctx.t.mediaAssets.id, id));
  return asset;
}

/** Every asset, unpaginated. Used by sync to find bucket objects that are not in the library yet. */
export async function listAllAssets(ctx: CmsContext): Promise<MediaAsset[]> {
  const rows = await ctx.db.select().from(ctx.t.mediaAssets);
  return rows.map(toAsset);
}

export interface AssetUsage {
  pageId: string;
  slug: string;
  title: Record<string, string>;
  type: string;
  /** `published` when the live version uses the file, `draft` when only the draft does. */
  status: "published" | "draft";
}

/**
 * Pages and drafts whose content mentions the file. Searches the stored JSON for the asset's key
 * (and its URL-encoded form), so it finds every block that references the file. A scan, not an index:
 * fine at this size, and the place to add a projection table if content grows.
 */
export async function findAssetUsage(ctx: CmsContext, asset: MediaAsset): Promise<AssetUsage[]> {
  const needles = [...new Set([asset.storageKey, encodeURI(asset.storageKey)])];
  const matches = (table: any) =>
    or(
      ...needles.map((n) =>
        like(sql`cast(${table.content} as text)`, `%${n.replace(/[%_]/g, "$&")}%`),
      ),
    );

  const published = await ctx.db
    .select({
      id: ctx.t.pages.id,
      slug: ctx.t.pages.slug,
      title: ctx.t.pages.title,
      type: ctx.t.pages.type,
    })
    .from(ctx.t.pages)
    .where(matches(ctx.t.pages));
  const drafts = await ctx.db
    .select({ id: ctx.t.pageDrafts.pageId })
    .from(ctx.t.pageDrafts)
    .where(matches(ctx.t.pageDrafts));
  const draftIds = new Set<string>(drafts.map((d: any) => d.id));
  const publishedIds = new Set<string>(published.map((p: any) => p.id));
  const out: AssetUsage[] = published.map((p: any) => ({
    pageId: p.id,
    slug: p.slug,
    title: parseLocalized(p.title) ?? {},
    type: p.type,
    status: "published",
  }));
  // Drafts that are not already listed as published (a draft of a published page is the same page).
  const missing = [...draftIds].filter((id) => !publishedIds.has(id));
  if (missing.length) {
    const rows = await ctx.db
      .select({
        id: ctx.t.pages.id,
        slug: ctx.t.pages.slug,
        title: ctx.t.pages.title,
        type: ctx.t.pages.type,
      })
      .from(ctx.t.pages)
      .where(or(...missing.map((id) => eq(ctx.t.pages.id, id))));
    for (const p of rows) {
      out.push({
        pageId: p.id,
        slug: p.slug,
        title: parseLocalized(p.title) ?? {},
        type: p.type,
        status: "draft",
      });
    }
  }
  return out;
}

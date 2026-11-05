import { getR2Bucket, listR2Files, encodeKey } from "../storage/index";
import type { StorageConfig } from "../storage/index";
import { CmsError } from "../services/context";
import type { Cms } from "../services/index";
import type { MediaAsset, MediaFolder, MediaTypeFilter } from "../services/media";

export interface MediaRouteContext {
  storage?: StorageConfig | undefined;
  /** Worker environment (bindings and secrets such as CLOUDFLARE_ZONE_ID). */
  env?: Record<string, unknown> | undefined;
  /** Same-origin path that serves stored files, e.g. `/api/cms/media/file`. */
  fileBasePath?: string | undefined;
  getSession?: ((request: Request) => Promise<any>) | undefined;
  getBucket?: ((bindingName: string) => Promise<any>) | undefined;
  /** Request-scoped CMS services (database access). */
  cms?: Cms | undefined;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(error: unknown, fallback: string): Response {
  if (error instanceof CmsError)
    return json({ success: false, error: error.message }, error.status);
  return json({ success: false, error: (error as Error)?.message || fallback }, 500);
}

async function resolveBucket(request: Request, ctx: MediaRouteContext, bindingName: string) {
  if (ctx.getBucket) return ctx.getBucket(bindingName);
  const locals = (request as any).locals ?? (ctx as any).locals;
  return getR2Bucket(locals, bindingName);
}

async function requireSession(
  request: Request,
  ctx: MediaRouteContext,
): Promise<{ error?: Response }> {
  if (!ctx.getSession) return {};
  const session = await ctx.getSession(request);
  if (!session) return { error: json({ success: false, error: "Unauthorized" }, 401) };
  return {};
}

/** Runs a media handler after auth and bucket/database checks. */
async function withMedia(
  request: Request,
  ctx: MediaRouteContext,
  fallback: string,
  fn: (args: { cms: Cms; bucket: any; url: URL; base: string }) => Promise<Response>,
): Promise<Response> {
  const auth = await requireSession(request, ctx);
  if (auth.error) return auth.error;
  try {
    if (!ctx.cms) throw new CmsError(500, "CMS database is not available.");
    const bindingName = ctx.storage?.binding ?? "BLOB";
    const bucket = await resolveBucket(request, ctx, bindingName);
    if (!bucket)
      return json({ success: false, error: `Storage binding "${bindingName}" not found.` }, 500);
    return await fn({
      cms: ctx.cms,
      bucket,
      url: new URL(request.url),
      base: ctx.storage?.prefix ?? "",
    });
  } catch (error) {
    return errorResponse(error, fallback);
  }
}

/** Public URL for a stored key (CDN when configured, otherwise the same-origin proxy). */
function urlsFor(storageKey: string, ctx: MediaRouteContext) {
  const publicUrl = ctx.storage?.publicUrl?.replace(/\/$/, "");
  const proxy = ctx.fileBasePath
    ? `${ctx.fileBasePath.replace(/\/$/, "")}/${encodeKey(storageKey)}`
    : null;
  return {
    url: publicUrl
      ? `${publicUrl}/${encodeKey(storageKey)}`
      : (proxy ?? `/media/file/${encodeKey(storageKey)}`),
    previewUrl: proxy ?? undefined,
  };
}

function serializeAsset(asset: MediaAsset, ctx: MediaRouteContext) {
  const base = ctx.storage?.prefix ?? "";
  return {
    ...asset,
    ...urlsFor(asset.storageKey, ctx),
    name: asset.filename,
    path: asset.storageKey.slice(base.length),
  };
}

function serializeFolder(folder: MediaFolder) {
  return { id: folder.id, parentId: folder.parentId, name: folder.name };
}

const extOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot > name.lastIndexOf("/") ? name.slice(dot).toLowerCase() : "";
};

/** GET /media — folder contents (or every match when searching), plus the folder's subfolders. */
export async function handleMediaList(
  request: Request,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to list media", async ({ cms, url }) => {
    const search = url.searchParams.get("search") ?? undefined;
    const type = (url.searchParams.get("type") ?? undefined) as MediaTypeFilter | undefined;
    const folderParam = url.searchParams.get("folder");
    const searching = Boolean(search?.trim()) || (type !== undefined && type !== "all");
    const folderId = folderParam && folderParam !== "root" ? folderParam : null;
    const { assets, nextCursor } = await cms.media.listAssets({
      folderId: searching ? undefined : folderId,
      search,
      type,
      limit: Number(url.searchParams.get("limit")) || undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
    });
    const folders = await cms.media.listFolders();
    return json({
      success: true,
      data: {
        assets: assets.map((a) => serializeAsset(a, ctx)),
        // Aliased so the existing dashboard fields keep working.
        files: assets.map((a) => serializeAsset(a, ctx)),
        folders: folders.map(serializeFolder),
        folderId: folderId,
        nextCursor,
        truncated: nextCursor !== null,
        cursor: nextCursor ?? undefined,
      },
    });
  });
}

/** GET /media/folders — every folder (the tree). */
export async function handleMediaFolders(
  request: Request,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to list folders", async ({ cms }) => {
    const folders = await cms.media.listFolders();
    return json({ success: true, data: { folders: folders.map(serializeFolder) } });
  });
}

/** POST /media/folders — create a folder. Body: `{ name, parentId? }`. */
export async function handleMediaFolderCreate(
  request: Request,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to create folder", async ({ cms }) => {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      parentId?: string | null;
    };
    const folder = await cms.media.createFolder({
      name: body.name ?? "",
      parentId: body.parentId ?? null,
    });
    return json({ success: true, data: { folder: serializeFolder(folder) } }, 201);
  });
}

/** PATCH /media/folders/:id — rename and/or move (`parentId`) a folder. */
export async function handleMediaFolderUpdate(
  request: Request,
  id: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to update folder", async ({ cms }) => {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      parentId?: string | null;
    };
    const folder = await cms.media.updateFolder(id, body);
    return json({ success: true, data: { folder: serializeFolder(folder) } });
  });
}

/** DELETE /media/folders/:id — only when empty. */
export async function handleMediaFolderDelete(
  request: Request,
  id: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to delete folder", async ({ cms }) => {
    await cms.media.deleteFolder(id);
    return json({ success: true });
  });
}

/** Largest chunk per request (bytes). Stays under the Cloudflare request body limit. */
export const MEDIA_PART_SIZE: number = 50 * 1024 * 1024;
/** R2's hard cap on parts per multipart upload. */
const MEDIA_MAX_PARTS = 10_000;
const MIME_FALLBACK = "application/octet-stream";

const isPositiveInteger = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v > 0;
const partCountFor = (size: number) => Math.ceil(size / MEDIA_PART_SIZE);
/** Keys written here must live under the configured prefix, never the bucket root. */
const keyUnderPrefix = (key: string, base: string) =>
  key.startsWith(base) && key.length > base.length;

interface UploadCompleteBody {
  key?: unknown;
  id?: unknown;
  size?: unknown;
  mimeType?: unknown;
  replace?: unknown;
  filename?: unknown;
  folderId?: unknown;
  alt?: unknown;
  caption?: unknown;
  width?: unknown;
  height?: unknown;
  parts?: { partNumber?: unknown; etag?: unknown }[];
}

/**
 * POST /media/uploads — starts a chunked upload of a new file, or of a replacement when `replaceId`
 * is given. Body: `{ filename, mimeType, size, replaceId? }`. Returns the R2 `uploadId`, the object
 * `key`, the asset `id`, and the part plan (`partSize`, `partCount`). Parts go next, then complete.
 */
export async function handleMediaUploadStart(
  request: Request,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to start upload", async ({ cms, bucket, base }) => {
    const body = (await request.json().catch(() => ({}))) as {
      filename?: unknown;
      mimeType?: unknown;
      size?: unknown;
      replaceId?: unknown;
    };
    const size = body.size;
    if (!isPositiveInteger(size))
      return json(
        { success: false, error: "Upload size must be a positive number of bytes." },
        400,
      );
    if (partCountFor(size) > MEDIA_MAX_PARTS)
      return json({ success: false, error: "File is too large to upload." }, 413);
    const mimeType =
      typeof body.mimeType === "string" && body.mimeType ? body.mimeType : MIME_FALLBACK;
    let id: string;
    let key: string;
    if (typeof body.replaceId === "string" && body.replaceId) {
      const current = await cms.media.getAsset(body.replaceId);
      id = current.id;
      // A replacement reuses the object key, so every URL that points at the asset keeps working.
      key = current.storageKey;
    } else {
      const filename = typeof body.filename === "string" ? body.filename : "";
      id = crypto.randomUUID();
      // Immutable key: the id plus the original extension. Renames and moves never change it.
      key = `${base}${id}${extOf(filename)}`;
    }
    const upload = await bucket.createMultipartUpload(key, {
      httpMetadata: { contentType: mimeType },
    });
    return json(
      {
        success: true,
        data: {
          uploadId: upload.uploadId,
          key,
          id,
          partSize: MEDIA_PART_SIZE,
          partCount: partCountFor(size),
        },
      },
      201,
    );
  });
}

/**
 * PUT /media/uploads/:uploadId/parts/:partNumber?key=… — stores one chunk as the raw request body
 * (at most `MEDIA_PART_SIZE` bytes). The body streams into R2 without being buffered in memory.
 * Returns `{ part: { partNumber, etag } }`, which the complete step needs.
 */
export async function handleMediaUploadPart(
  request: Request,
  uploadId: string,
  partNumberParam: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to upload part", async ({ bucket, url, base }) => {
    const partNumber = Number(partNumberParam);
    const key = url.searchParams.get("key") ?? "";
    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > MEDIA_MAX_PARTS)
      return json({ success: false, error: "Part number must be between 1 and 10000." }, 400);
    if (!keyUnderPrefix(key, base))
      return json({ success: false, error: "Invalid upload key." }, 400);
    if (Number(request.headers.get("content-length")) > MEDIA_PART_SIZE)
      return json({ success: false, error: "Part is larger than the part size." }, 413);
    if (!request.body) return json({ success: false, error: "Missing part body." }, 400);
    const part = await bucket
      .resumeMultipartUpload(key, uploadId)
      .uploadPart(partNumber, request.body);
    return json({
      success: true,
      data: { part: { partNumber: part.partNumber, etag: part.etag } },
    });
  });
}

/**
 * POST /media/uploads/:uploadId/complete — assembles the stored parts and records the asset.
 * Body: `{ key, id, size, mimeType, parts, replace?, filename?, folderId?, alt?, caption?,
 * width?, height? }`. Deletes the object and rejects when the stored size differs from `size`.
 */
export async function handleMediaUploadComplete(
  request: Request,
  uploadId: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to finish upload", async ({ cms, bucket, base, url }) => {
    const body = (await request.json().catch(() => ({}))) as UploadCompleteBody;
    const key = typeof body.key === "string" ? body.key : "";
    const id = typeof body.id === "string" ? body.id : "";
    const size = body.size;
    const parts = Array.isArray(body.parts) ? body.parts : [];
    if (!keyUnderPrefix(key, base) || !id || !isPositiveInteger(size))
      return json({ success: false, error: "Invalid upload." }, 400);
    const expectedParts = partCountFor(size);
    const partsComplete =
      parts.length === expectedParts &&
      parts.every(
        (p, i) => Number(p.partNumber) === i + 1 && typeof p.etag === "string" && p.etag !== "",
      );
    if (!partsComplete)
      return json(
        { success: false, error: `Upload is incomplete: expected ${expectedParts} parts.` },
        400,
      );

    // Check the key belongs to this asset before any object is finalized or recorded.
    const replace = body.replace === true;
    const filename = typeof body.filename === "string" ? body.filename : "";
    if (replace) {
      const current = await cms.media.getAsset(id);
      if (current.storageKey !== key)
        return json({ success: false, error: "Upload key does not match this file." }, 400);
    } else if (key !== `${base}${id}${extOf(filename)}`) {
      return json({ success: false, error: "Upload key does not match this file." }, 400);
    }

    const object = await bucket
      .resumeMultipartUpload(key, uploadId)
      .complete(parts.map((p) => ({ partNumber: Number(p.partNumber), etag: String(p.etag) })));
    if (object.size !== size) {
      await bucket.delete(key);
      return json(
        { success: false, error: "The stored file size does not match the upload. Try again." },
        400,
      );
    }

    const mimeType =
      typeof body.mimeType === "string" && body.mimeType ? body.mimeType : MIME_FALLBACK;
    const width = typeof body.width === "number" ? body.width : null;
    const height = typeof body.height === "number" ? body.height : null;
    if (replace) {
      const asset = await cms.media.updateAsset(id, { mimeType, size, width, height });
      const served = serializeAsset(asset, ctx);
      const purged = await purgeCdn(ctx, [served.url, served.previewUrl], url.origin);
      return json({ success: true, data: { file: served, purged } });
    }
    const asset = await cms.media.createAsset({
      id,
      storageKey: key,
      filename: filename || key,
      mimeType,
      size,
      width,
      height,
      alt: body.alt && typeof body.alt === "object" ? (body.alt as Record<string, string>) : null,
      caption:
        body.caption && typeof body.caption === "object"
          ? (body.caption as Record<string, string>)
          : null,
      folderId: typeof body.folderId === "string" && body.folderId ? body.folderId : null,
    });
    return json({ success: true, data: { file: serializeAsset(asset, ctx) } }, 201);
  });
}

/** DELETE /media/uploads/:uploadId?key=… — cancels a chunked upload and discards its parts. */
export async function handleMediaUploadAbort(
  request: Request,
  uploadId: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to cancel upload", async ({ bucket, url, base }) => {
    const key = url.searchParams.get("key") ?? "";
    if (!keyUnderPrefix(key, base))
      return json({ success: false, error: "Invalid upload key." }, 400);
    await bucket.resumeMultipartUpload(key, uploadId).abort();
    return json({ success: true });
  });
}

/**
 * PATCH /media/:id — metadata: `filename`, `alt` (localized), `caption` (localized), `focalX`,
 * `focalY` (0–1), `folderId` (move). Never touches the stored object.
 */
export async function handleMediaUpdate(
  request: Request,
  id: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to update file", async ({ cms }) => {
    const body = (await request.json().catch(() => ({}))) as any;
    const patch: any = {};
    if (typeof body.filename === "string" && body.filename.trim())
      patch.filename = body.filename.trim();
    if ("alt" in body) patch.alt = body.alt && typeof body.alt === "object" ? body.alt : null;
    if ("caption" in body)
      patch.caption = body.caption && typeof body.caption === "object" ? body.caption : null;
    if ("focalX" in body) patch.focalX = typeof body.focalX === "number" ? body.focalX : null;
    if ("focalY" in body) patch.focalY = typeof body.focalY === "number" ? body.focalY : null;
    if (typeof body.width === "number") patch.width = body.width;
    if (typeof body.height === "number") patch.height = body.height;
    if ("folderId" in body)
      patch.folderId = typeof body.folderId === "string" ? body.folderId : null;
    const asset = await cms.media.updateAsset(id, patch as any);
    return json({ success: true, data: { file: serializeAsset(asset, ctx) } });
  });
}

/**
 * Drops cached copies of the given URLs after an overwrite. Two layers:
 * 1. The Worker's zone cache (needs no credentials, but only reaches this zone's cache).
 * 2. A Cloudflare zone purge through the API, when CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN are set.
 * Returns which layers ran, so the caller can report it.
 */
export async function purgeCdn(
  ctx: MediaRouteContext,
  urls: (string | undefined)[],
  origin: string,
): Promise<{ workerCache: boolean; zone: boolean; error?: string }> {
  // Both cache APIs need absolute URLs, so same-origin paths are resolved against the request.
  const list = urls
    .filter((u): u is string => Boolean(u))
    .map((u) => (u.startsWith("/") ? `${origin}${u}` : u))
    .filter((u) => /^https?:\/\//.test(u));
  let workerCache = false;
  const edge = (globalThis as any).caches?.default;
  if (edge) {
    for (const u of list) await edge.delete(new Request(u)).catch(() => false);
    workerCache = true;
  }
  const zoneId = ctx.env?.["CLOUDFLARE_ZONE_ID"];
  const token = ctx.env?.["CLOUDFLARE_API_TOKEN"];
  if (typeof zoneId !== "string" || typeof token !== "string" || !zoneId || !token) {
    return { workerCache, zone: false };
  }
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ files: list }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      errors?: { message?: string }[];
    };
    if (!res.ok || body.success === false) {
      return { workerCache, zone: false, error: body.errors?.[0]?.message ?? `HTTP ${res.status}` };
    }
    return { workerCache, zone: true };
  } catch (err) {
    return { workerCache, zone: false, error: (err as Error).message };
  }
}

/** DELETE /media/:id — removes the stored object and its record. */
export async function handleMediaDelete(
  request: Request,
  id: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to delete file", async ({ cms, bucket }) => {
    const asset = await cms.media.deleteAsset(id);
    await bucket.delete(asset.storageKey);
    return json({ success: true });
  });
}

/**
 * POST /media/sync — imports bucket objects that have no library record yet, keeping their keys
 * (so existing URLs keep working) and recreating folders from their key prefixes.
 */
export async function handleMediaSync(
  request: Request,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to sync media", async ({ cms, bucket, base }) => {
    const known = new Set((await cms.media.listAllAssets()).map((a) => a.storageKey));
    const folderByPath = new Map<string, string>();
    let imported = 0;
    let cursor: string | undefined;
    do {
      const page = await listR2Files(bucket, { prefix: base, limit: 1000, cursor });
      for (const file of page.files) {
        if (known.has(file.key)) continue;
        const rel = file.key.slice(base.length);
        const parts = rel.split("/");
        const dirParts = parts.slice(0, -1);
        let parentId: string | null = null;
        let path = "";
        for (const part of dirParts) {
          path = `${path}${part}/`;
          let folderId = folderByPath.get(path);
          if (!folderId) {
            const existing = await cms.media.listFolders();
            const match = existing.find((f) => f.name === part && f.parentId === parentId);
            folderId = match?.id ?? (await cms.media.createFolder({ name: part, parentId })).id;
            folderByPath.set(path, folderId);
          }
          parentId = folderId;
        }
        await cms.media.createAsset({
          storageKey: file.key,
          filename: parts[parts.length - 1] ?? file.key,
          mimeType: file.mimeType,
          size: file.size,
          folderId: parentId,
        });
        imported += 1;
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    return json({ success: true, data: { imported } });
  });
}

/** GET /media/file/* — streams a stored object through the worker (used for previews). */
export async function handleMediaFile(
  request: Request,
  key: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  try {
    const bindingName = ctx.storage?.binding ?? "BLOB";
    const bucket = await resolveBucket(request, ctx, bindingName);
    if (!bucket) return new Response("Storage binding not found.", { status: 500 });
    if (!key) return new Response("Missing file key.", { status: 400 });

    const object = await bucket.get(key);
    if (!object) return new Response("File not found in storage.", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    // Revalidate on every use (cheap: the ETag answers 304) so a replaced file shows up at once.
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    return new Response(object.body, { status: 200, headers });
  } catch (error: any) {
    return new Response(error.message || "Failed to retrieve file", { status: 500 });
  }
}

/**
 * Mount CMS media routes on a Hono router. The R2 bucket is resolved from `c.env[binding]`
 * (Cloudflare) unless `ctx.getBucket` is provided.
 */
export function registerCmsMediaRoutes(
  router: {
    get: (path: string, handler: (c: any) => Promise<Response>) => unknown;
    post: (path: string, handler: (c: any) => Promise<Response>) => unknown;
    patch: (path: string, handler: (c: any) => Promise<Response>) => unknown;
    put: (path: string, handler: (c: any) => Promise<Response>) => unknown;
    delete: (path: string, handler: (c: any) => Promise<Response>) => unknown;
  },
  basePath: string,
  ctx: MediaRouteContext & { getCms?: (c: any) => Cms } = {},
): void {
  const withEnv = (c: any): MediaRouteContext => ({
    ...ctx,
    cms: ctx.getCms ? ctx.getCms(c) : ctx.cms,
    env: c.env,
    getBucket: ctx.getBucket ?? (async (name: string) => c.env?.[name] ?? null),
  });
  router.get(basePath, (c) => handleMediaList(c.req.raw, withEnv(c)));
  router.post(`${basePath}/uploads`, (c) => handleMediaUploadStart(c.req.raw, withEnv(c)));
  router.put(`${basePath}/uploads/:uploadId/parts/:partNumber`, (c) =>
    handleMediaUploadPart(
      c.req.raw,
      c.req.param("uploadId"),
      c.req.param("partNumber"),
      withEnv(c),
    ),
  );
  router.post(`${basePath}/uploads/:uploadId/complete`, (c) =>
    handleMediaUploadComplete(c.req.raw, c.req.param("uploadId"), withEnv(c)),
  );
  router.delete(`${basePath}/uploads/:uploadId`, (c) =>
    handleMediaUploadAbort(c.req.raw, c.req.param("uploadId"), withEnv(c)),
  );
  router.get(`${basePath}/folders`, (c) => handleMediaFolders(c.req.raw, withEnv(c)));
  router.post(`${basePath}/folders`, (c) => handleMediaFolderCreate(c.req.raw, withEnv(c)));
  router.patch(`${basePath}/folders/:id`, (c) =>
    handleMediaFolderUpdate(c.req.raw, c.req.param("id"), withEnv(c)),
  );
  router.delete(`${basePath}/folders/:id`, (c) =>
    handleMediaFolderDelete(c.req.raw, c.req.param("id"), withEnv(c)),
  );
  router.post(`${basePath}/sync`, (c) => handleMediaSync(c.req.raw, withEnv(c)));
  router.patch(`${basePath}/:id`, (c) =>
    handleMediaUpdate(c.req.raw, c.req.param("id"), withEnv(c)),
  );
  router.delete(`${basePath}/:id`, (c) =>
    handleMediaDelete(c.req.raw, c.req.param("id"), withEnv(c)),
  );
  router.get(`${basePath}/:id/usage`, (c) =>
    handleMediaUsage(c.req.raw, c.req.param("id"), withEnv(c)),
  );
  router.get(`${basePath}/file/*`, (c) => {
    const key = decodeURIComponent(c.req.path.split(`${basePath}/file/`)[1] ?? "");
    return handleMediaFile(c.req.raw, key, withEnv(c));
  });
}

/** GET /media/:id/usage — pages and drafts that use the file. */
export async function handleMediaUsage(
  request: Request,
  id: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to load usage", async ({ cms }) => {
    const asset = await cms.media.getAsset(id);
    const usage = await cms.media.findAssetUsage(asset);
    return json({ success: true, data: { usage } });
  });
}

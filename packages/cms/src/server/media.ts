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

/** Parses an optional JSON-encoded localized object from a form field. */
function parseLocalized(value: FormDataEntryValue | null): Record<string, string> | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : null;
  } catch {
    return null;
  }
}

const numberOrNull = (v: FormDataEntryValue | null) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

/**
 * POST /media — upload into a folder. Form fields: `file`, `folderId`, `alt` (JSON localized),
 * `caption` (JSON localized), `width`, `height`.
 */
export async function handleMediaUpload(
  request: Request,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to upload file", async ({ cms, bucket, base }) => {
    if (!(request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      return json({ success: false, error: "Expected multipart/form-data content type." }, 400);
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return json(
        { success: false, error: "No file found in form data payload (field name 'file')." },
        400,
      );
    }
    const id = crypto.randomUUID();
    // Immutable key: the id plus the original extension. Renames and moves never change it.
    const storageKey = `${base}${id}${extOf(file.name)}`;
    await bucket.put(storageKey, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });
    const folderId =
      typeof form.get("folderId") === "string" ? (form.get("folderId") as string) || null : null;
    const asset = await cms.media.createAsset({
      id,
      storageKey,
      filename: file.name || storageKey,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      width: numberOrNull(form.get("width")),
      height: numberOrNull(form.get("height")),
      alt: parseLocalized(form.get("alt")),
      caption: parseLocalized(form.get("caption")),
      folderId,
    });
    return json({ success: true, data: { file: serializeAsset(asset, ctx) } }, 201);
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

/**
 * POST /media/:id/replace — overwrites the stored object with a new upload. The asset keeps its id,
 * key, URL and metadata; only the bytes and the type/size change.
 */
export async function handleMediaReplace(
  request: Request,
  id: string,
  ctx: MediaRouteContext = {},
): Promise<Response> {
  return withMedia(request, ctx, "Failed to replace file", async ({ cms, bucket }) => {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return json(
        { success: false, error: "No file found in form data payload (field name 'file')." },
        400,
      );
    }
    const current = await cms.media.getAsset(id);
    // Overwrite the same object: the asset keeps its key, so every URL that points at it now
    // serves the new file.
    await bucket.put(current.storageKey, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });
    const asset = await cms.media.updateAsset(id, {
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      width: numberOrNull(form.get("width")),
      height: numberOrNull(form.get("height")),
    });
    const served = serializeAsset(asset, ctx);
    const purged = await purgeCdn(
      ctx,
      [served.url, served.previewUrl],
      new URL(request.url).origin,
    );
    return json({ success: true, data: { file: served, purged } });
  });
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
  router.post(basePath, (c) => handleMediaUpload(c.req.raw, withEnv(c)));
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
  router.post(`${basePath}/:id/replace`, (c) =>
    handleMediaReplace(c.req.raw, c.req.param("id"), withEnv(c)),
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

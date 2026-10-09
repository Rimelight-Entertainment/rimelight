import { getR2Bucket, listR2Files, uploadR2File, deleteR2File } from "../storage/index";
import type { StorageConfig } from "../storage/index";

export interface MediaRouteContext {
  storage?: StorageConfig | undefined;
  getSession?: ((request: Request) => Promise<any>) | undefined;
  getBucket?: ((bindingName: string) => Promise<any>) | undefined;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function resolveBucket(
  request: Request,
  ctx: MediaRouteContext,
  bindingName: string,
): Promise<any> {
  if (ctx.getBucket) return ctx.getBucket(bindingName);
  const locals = (request as any).locals ?? (ctx as any).locals;
  return getR2Bucket(locals, bindingName);
}

async function requireSession(
  request: Request,
  ctx: MediaRouteContext,
): Promise<{ session: any; error?: undefined } | { session?: undefined; error: Response }> {
  if (!ctx.getSession) return { session: { userId: "system" } };
  const session = await ctx.getSession(request);
  if (!session) return { error: json({ success: false, error: "Unauthorized" }, 401) };
  return { session };
}

/**
 * Framework-agnostic media library handlers. Mount these in any router (Hono, Solid Start, Vite dev
 * middleware) — no Astro dependency.
 */
export async function handleMediaList(request: Request, ctx: MediaRouteContext = {}) {
  const auth = await requireSession(request, ctx);
  if (auth.error) return auth.error;

  try {
    const url = new URL(request.url);
    const prefix = (url.searchParams.get("prefix") ?? ctx.storage?.prefix ?? "media/") as string;
    const cursor = (url.searchParams.get("cursor") || undefined) as string | undefined;
    const limit = Number(url.searchParams.get("limit")) || 50;
    const search = url.searchParams.get("search")?.toLowerCase();
    const typeFilter = url.searchParams.get("type")?.toLowerCase();
    const bindingName = ctx.storage?.binding ?? "BLOB";
    const bucket = await resolveBucket(request, ctx, bindingName);

    if (!bucket) {
      return json(
        {
          success: false,
          error: `Storage binding "${bindingName}" not found in runtime environment. Ensure R2 bucket is configured.`,
        },
        500,
      );
    }

    const apiBasePath = `${url.pathname.replace(/\/$/, "")}/file`;
    const result = await listR2Files(bucket, {
      prefix,
      cursor,
      limit,
      publicUrl: ctx.storage?.publicUrl,
      apiBasePath,
    });

    let files = result.files;
    if (search) {
      files = files.filter(
        (f) => f.name.toLowerCase().includes(search) || f.key.toLowerCase().includes(search),
      );
    }
    if (typeFilter && typeFilter !== "all") {
      files = files.filter((f) => {
        if (typeFilter === "images") return f.mimeType.startsWith("image/");
        if (typeFilter === "videos") return f.mimeType.startsWith("video/");
        if (typeFilter === "audio") return f.mimeType.startsWith("audio/");
        if (typeFilter === "documents")
          return (
            f.mimeType.includes("pdf") ||
            f.mimeType.includes("text") ||
            f.mimeType.includes("document")
          );
        return true;
      });
    }

    return json({
      success: true,
      data: {
        files,
        truncated: result.truncated,
        cursor: result.cursor,
        provider: ctx.storage?.provider ?? "r2",
        binding: bindingName,
      },
    });
  } catch (error: any) {
    return json({ success: false, error: error.message || "Failed to list media files" }, 500);
  }
}

export async function handleMediaUpload(request: Request, ctx: MediaRouteContext = {}) {
  const auth = await requireSession(request, ctx);
  if (auth.error) return auth.error;

  try {
    const bindingName = ctx.storage?.binding ?? "BLOB";
    const bucket = await resolveBucket(request, ctx, bindingName);
    if (!bucket) {
      return json({ success: false, error: `Storage binding "${bindingName}" not found.` }, 500);
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return json({ success: false, error: "Expected multipart/form-data content type." }, 400);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return json(
        { success: false, error: "No file found in form data payload (field name 'file')." },
        400,
      );
    }

    const url = new URL(request.url);
    const apiBasePath = `${url.pathname.replace(/\/$/, "")}/file`;
    const uploaded = await uploadR2File(bucket, file, {
      prefix: ctx.storage?.prefix ?? "media/",
      publicUrl: ctx.storage?.publicUrl,
      apiBasePath,
    });

    return json({ success: true, data: { file: uploaded } }, 201);
  } catch (error: any) {
    return json({ success: false, error: error.message || "Failed to upload file" }, 500);
  }
}

export async function handleMediaDelete(request: Request, ctx: MediaRouteContext = {}) {
  const auth = await requireSession(request, ctx);
  if (auth.error) return auth.error;

  try {
    const bindingName = ctx.storage?.binding ?? "BLOB";
    const bucket = await resolveBucket(request, ctx, bindingName);
    if (!bucket) {
      return json({ success: false, error: `Storage binding "${bindingName}" not found.` }, 500);
    }

    let key = "";
    const url = new URL(request.url);
    const queryKey = url.searchParams.get("key");
    if (queryKey) {
      key = queryKey;
    } else {
      const body = await request.json().catch(() => ({}) as any);
      key = (body as any).key;
    }
    if (!key) {
      return json({ success: false, error: "Missing required 'key' parameter for deletion." }, 400);
    }

    await deleteR2File(bucket, key);
    return json({ success: true, message: `File "${key}" deleted successfully.` });
  } catch (error: any) {
    return json({ success: false, error: error.message || "Failed to delete file" }, 500);
  }
}

export async function handleMediaFile(request: Request, key: string, ctx: MediaRouteContext = {}) {
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
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(object.body, { status: 200, headers });
  } catch (error: any) {
    return new Response(error.message || "Failed to retrieve file", { status: 500 });
  }
}

/**
 * Mount CMS media routes on any Hono-compatible (or Express-style) router. The router only needs
 * `.get(path, handler)`, `.post(...)`, `.delete(...)` with Hono's `(c) => Response` signature —
 * handlers adapt automatically.
 */
export function registerCmsMediaRoutes(
  router: {
    get: (path: string, handler: (c: any) => Promise<Response>) => void;
    post: (path: string, handler: (c: any) => Promise<Response>) => void;
    delete: (path: string, handler: (c: any) => Promise<Response>) => void;
  },
  basePath: string,
  ctx: MediaRouteContext = {},
) {
  const toHandler =
    (fn: (request: Request, extra?: any) => Promise<Response>) => async (c: any) => {
      const request: Request = c.req?.raw ?? c.request ?? c;
      const params = {
        key: c.req?.param?.("key") ?? c.params?.["key"],
      };
      return fn(request, params);
    };

  router.get(
    `${basePath}`,
    toHandler((req) => handleMediaList(req, ctx)),
  );
  router.post(
    `${basePath}`,
    toHandler((req) => handleMediaUpload(req, ctx)),
  );
  router.delete(
    `${basePath}`,
    toHandler((req) => handleMediaDelete(req, ctx)),
  );
  router.get(
    `${basePath}/file/:key`,
    toHandler((req, params) => handleMediaFile(req, params?.key, ctx)),
  );
}

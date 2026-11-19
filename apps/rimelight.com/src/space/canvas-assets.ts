/**
 * Rimelight Space canvas asset routes on the website Worker (CV.1/CV.2, decision 0045): upload, import from an
 * https URL, the original bytes and the thumbnails. Bytes live in the R2 bucket (env.BLOB) under
 * space/canvases/{canvas}/assets and space/canvases/{canvas}/thumbs. Mounted under /v1 by the Space API.
 */
import { Hono } from "hono";
import type { Context } from "hono";
import { env } from "cloudflare:workers";
import { getSql } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";
import {
  type CanvasRow,
  type Q,
  type Row,
  type Sql,
  apiError,
  assetView,
  badRequest,
  cleanFileName,
  json,
  loadCanvas,
  lockQuota,
  notFound,
  percentDecode,
  quotaScopeOf,
  quotaUsage,
  readBody,
  serverError,
  uuidOr404,
} from "./canvas-access.ts";
import {
  CANVAS_ASSET_MAX_BYTES,
  assetObjectKey,
  checkImportUrl,
  inspectImage,
  parseThumbSize,
  quotaRefusal,
  sha256Hex,
  thumbObjectKey,
} from "./canvas-image.ts";

type BlobBindings = { BLOB: R2Bucket };

const THUMB_MAX_BYTES = 2 * 1024 * 1024;
const NO_IMAGE = "There is no such image.";
const NO_THUMB = "There is no such thumbnail.";

const blobBucket = (): R2Bucket => (env as unknown as BlobBindings).BLOB;

/** The Content-Length header as a number, or 0 when it is missing or not a number. */
function declaredLength(c: Context): number {
  const n = Number(c.req.header("Content-Length") ?? "0");
  return Number.isFinite(n) ? n : 0;
}

async function assetRow(q: Q, canvasId: string, assetId: string): Promise<Row | undefined> {
  const rows = await q`SELECT * FROM canvas_assets
     WHERE id = ${assetId}::text::uuid AND canvas_id = ${canvasId}::text::uuid`;
  return rows[0] as Row | undefined;
}

async function assetBySha(q: Q, canvasId: string, sha256: string): Promise<Row | undefined> {
  const rows = await q`SELECT * FROM canvas_assets
     WHERE canvas_id = ${canvasId}::text::uuid AND sha256 = ${sha256}::text`;
  return rows[0] as Row | undefined;
}

/** The image response: the bytes with their type and a long, private cache keyed by the content hash. */
function imageResponse(bytes: ArrayBuffer, mime: string, etag: string): Response {
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=31536000, immutable",
      ETag: `"${etag}"`,
    },
  });
}

/**
 * Checks the bytes, stores them once per canvas and counts them against the quota of the canvas's project or
 * owner. A file the canvas already holds is 200 with no new charge. The R2 object is written after the row;
 * if that write fails the row is removed. The object is never deleted, since its key is shared by content.
 */
async function storeAsset(
  sql: Sql,
  canvas: CanvasRow,
  who: { id: string },
  bytes: Uint8Array,
  fileName: string,
  sourceUrl: string,
): Promise<Response> {
  if (bytes.byteLength === 0) return badRequest("The upload is empty.");
  if (bytes.byteLength > CANVAS_ASSET_MAX_BYTES) {
    return apiError(413, "payload_too_large", "Images are at most 50 MB.");
  }
  const info = inspectImage(bytes);
  if (info === null) {
    return apiError(
      415,
      "unsupported_media",
      "Only PNG, JPEG, WebP and GIF images up to 32768 px a side can be added.",
    );
  }
  const sha = await sha256Hex(bytes);
  const existing = await assetBySha(sql, canvas.id, sha);
  if (existing) return json(assetView(canvas.id, existing), 200);

  const [scope, subject] = quotaScopeOf(canvas);
  const key = assetObjectKey(canvas.id, sha, info.ext);
  const stored = await sql.begin(
    async (tx): Promise<{ refusal: string | null; row: Row | undefined }> => {
      await lockQuota(tx, scope, subject);
      const { usage, limit } = await quotaUsage(tx, scope, subject);
      const refusal = quotaRefusal(usage, limit, bytes.byteLength);
      if (refusal !== null) return { refusal, row: undefined };
      const inserted = await tx`INSERT INTO canvas_assets
           (canvas_id, sha256, mime, bytes, width, height, frame_count, file_name, source_url, object_key, created_by)
         VALUES (${canvas.id}::text::uuid, ${sha}::text, ${info.mime}::text, ${bytes.byteLength}::bigint,
                 ${info.width}::int, ${info.height}::int, ${info.frameCount}::int, ${fileName}::text,
                 ${sourceUrl}::text, ${key}::text, ${who.id}::text::uuid)
         ON CONFLICT (canvas_id, sha256) DO NOTHING
         RETURNING *`;
      return { refusal: null, row: inserted[0] as Row | undefined };
    },
  );
  if (stored.refusal !== null) {
    return json({ error: "quota_exceeded", message: stored.refusal }, 413);
  }
  if (stored.row === undefined) {
    // A concurrent upload of the same file wrote the row first.
    const won = await assetBySha(sql, canvas.id, sha);
    return won ? json(assetView(canvas.id, won), 200) : serverError();
  }
  const row = stored.row;

  try {
    await blobBucket().put(key, bytes, { httpMetadata: { contentType: info.mime } });
  } catch (err) {
    console.error("space canvas asset put failed", err);
    await sql`DELETE FROM canvas_assets WHERE id = ${row["id"]}::text::uuid`.catch(() => undefined);
    return serverError();
  }
  return json(assetView(canvas.id, row), 201);
}

/** Reads a response body, or null when it runs past the asset size limit. */
async function readCapped(res: Response): Promise<Uint8Array | null> {
  if (res.body === null) return new Uint8Array(0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    total += part.value.byteLength;
    if (total > CANVAS_ASSET_MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(part.value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function drop(res: Response): Promise<void> {
  await res.body?.cancel().catch(() => undefined);
}

/**
 * Fetches an image for import. Redirects are followed by hand, at most MAX_REDIRECTS, and every hop is checked with
 * checkImportUrl before it is requested, so a redirect never reaches an address the check refuses. The bytes must
 * be at most 50 MB. Returns the bytes, the final URL and the file name taken from its last path segment, or a
 * response to send.
 */
async function fetchImage(
  url: URL,
): Promise<{ bytes: Uint8Array; finalUrl: string; fileName: string } | Response> {
  const MAX_REDIRECTS = 5;
  let current = url;
  let res: Response | null = null;
  for (let hop = 0; ; hop += 1) {
    res = await fetch(current, { redirect: "manual", headers: { Accept: "image/*" } }).catch(
      () => null,
    );
    if (res === null) return apiError(422, "fetch_failed", "The link could not be fetched.");
    const location = res.headers.get("Location");
    if (res.status < 300 || res.status >= 400 || location === null) break;
    await drop(res);
    if (hop >= MAX_REDIRECTS) {
      return apiError(422, "fetch_failed", "The link redirects too many times.");
    }
    let next: URL;
    try {
      next = new URL(location, current);
    } catch {
      return apiError(422, "fetch_failed", "The link redirects to an invalid address.");
    }
    const checked = checkImportUrl(next.href);
    if (!checked.ok) return badRequest(checked.message);
    current = checked.url;
  }
  const final = { url: current };
  if (!res.ok) {
    await drop(res);
    return apiError(422, "fetch_failed", `The link answered ${res.status}.`);
  }
  const declared = Number(res.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(declared) && declared > CANVAS_ASSET_MAX_BYTES) {
    await drop(res);
    return apiError(413, "payload_too_large", "Images are at most 50 MB.");
  }

  let bytes: Uint8Array | null;
  try {
    bytes = await readCapped(res);
  } catch {
    return apiError(422, "fetch_failed", "The link could not be fetched.");
  }
  if (bytes === null) {
    return apiError(413, "payload_too_large", "Images are at most 50 MB.");
  }

  const last = final.url.pathname.split("/").pop() ?? "";
  let decoded = last;
  try {
    decoded = decodeURIComponent(last);
  } catch {
    decoded = last;
  }
  return { bytes, finalUrl: final.url.toString(), fileName: cleanFileName(decoded) };
}

const canvasAssets = new Hono();

/**
 * POST /v1/canvases/{id}/assets: the body is the image, `X-File-Name` names it (percent-encoded). At most 50 MB.
 * Needs edit access. 201 with the asset, or 200 when the canvas already holds the same file.
 */
canvasAssets.post("/canvases/:id/assets", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "edit");
    if (isResponse(canvas)) return canvas;
    if (declaredLength(c) > CANVAS_ASSET_MAX_BYTES) {
      return apiError(413, "payload_too_large", "Images are at most 50 MB.");
    }
    const bytes = new Uint8Array(await c.req.arrayBuffer());
    const rawName = c.req.header("X-File-Name");
    const fileName = cleanFileName(rawName === undefined ? undefined : percentDecode(rawName));
    return await storeAsset(sql, canvas, who, bytes, fileName, "");
  } catch (err) {
    console.error("space POST /canvases/:id/assets failed", err);
    return serverError();
  }
});

/**
 * POST /v1/canvases/{id}/assets/from-url { url }: imports an image from an https link. Needs edit access.
 * Same answers as the upload.
 */
canvasAssets.post("/canvases/:id/assets/from-url", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "edit");
    if (isResponse(canvas)) return canvas;
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    if (typeof body["url"] !== "string") return badRequest("url is the link to an image.");
    const requested = checkImportUrl(body["url"]);
    if (!requested.ok) return badRequest(requested.message);

    const fetched = await fetchImage(requested.url);
    if (isResponse(fetched)) return fetched;
    return await storeAsset(sql, canvas, who, fetched.bytes, fetched.fileName, fetched.finalUrl);
  } catch (err) {
    console.error("space POST /canvases/:id/assets/from-url failed", err);
    return serverError();
  }
});

/** GET /v1/canvases/{id}/assets/{asset}: the original image bytes. Needs view access. */
canvasAssets.get("/canvases/:id/assets/:asset", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "view");
    if (isResponse(canvas)) return canvas;
    const assetId = uuidOr404(c.req.param("asset"), NO_IMAGE);
    if (isResponse(assetId)) return assetId;
    const row = await assetRow(sql, canvas.id, assetId);
    if (!row) return notFound(NO_IMAGE);
    const object = await blobBucket().get(row["object_key"] as string);
    if (!object) return notFound(NO_IMAGE);
    return imageResponse(
      await object.arrayBuffer(),
      row["mime"] as string,
      row["sha256"] as string,
    );
  } catch (err) {
    console.error("space GET /canvases/:id/assets/:asset failed", err);
    return serverError();
  }
});

/**
 * GET /v1/canvases/{id}/assets/{asset}/thumbs/{px}: the WebP thumbnail at 256 or 1024 pixels on the long side.
 * 404 when it has not been made yet; the client then uses the original. Needs view access.
 */
canvasAssets.get("/canvases/:id/assets/:asset/thumbs/:px", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "view");
    if (isResponse(canvas)) return canvas;
    const px = parseThumbSize(c.req.param("px"));
    if (px === null) return notFound(NO_IMAGE);
    const assetId = uuidOr404(c.req.param("asset"), NO_IMAGE);
    if (isResponse(assetId)) return assetId;
    const row = await assetRow(sql, canvas.id, assetId);
    if (!row) return notFound(NO_IMAGE);
    const thumbKeys = (row["thumb_keys"] ?? {}) as Record<string, string>;
    const key = thumbKeys[String(px)];
    if (key === undefined) return notFound(NO_THUMB);
    const object = await blobBucket().get(key);
    if (!object) return notFound(NO_THUMB);
    return imageResponse(
      await object.arrayBuffer(),
      "image/webp",
      `${row["sha256"] as string}-${px}`,
    );
  } catch (err) {
    console.error("space GET /canvases/:id/assets/:asset/thumbs/:px failed", err);
    return serverError();
  }
});

/**
 * PUT /v1/canvases/{id}/assets/{asset}/thumbs/{px}: stores a WebP thumbnail made by the desktop client, which
 * decodes the image anyway (decision 0045, CV.2). At most 2 MB. Needs edit access.
 */
canvasAssets.put("/canvases/:id/assets/:asset/thumbs/:px", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "edit");
    if (isResponse(canvas)) return canvas;
    const px = parseThumbSize(c.req.param("px"));
    if (px === null) return notFound(NO_IMAGE);
    const assetId = uuidOr404(c.req.param("asset"), NO_IMAGE);
    if (isResponse(assetId)) return assetId;
    if (declaredLength(c) > THUMB_MAX_BYTES) {
      return apiError(413, "payload_too_large", "A thumbnail is at most 2 MB.");
    }
    const bytes = new Uint8Array(await c.req.arrayBuffer());
    if (bytes.byteLength > THUMB_MAX_BYTES) {
      return apiError(413, "payload_too_large", "A thumbnail is at most 2 MB.");
    }
    const info = inspectImage(bytes);
    if (info === null || info.mime !== "image/webp") {
      return apiError(415, "unsupported_media", "Thumbnails are WebP.");
    }
    const row = await assetRow(sql, canvas.id, assetId);
    if (!row) return notFound(NO_IMAGE);

    const key = thumbObjectKey(canvas.id, row["sha256"] as string, px);
    await blobBucket().put(key, bytes, { httpMetadata: { contentType: "image/webp" } });
    await sql`UPDATE canvas_assets
       SET thumb_keys = thumb_keys || jsonb_build_object(${String(px)}::text, ${key}::text)
       WHERE id = ${assetId}::text::uuid AND canvas_id = ${canvas.id}::text::uuid`;
    const updated = await assetRow(sql, canvas.id, assetId);
    if (!updated) return serverError();
    return json(assetView(canvas.id, updated), 200);
  } catch (err) {
    console.error("space PUT /canvases/:id/assets/:asset/thumbs/:px failed", err);
    return serverError();
  }
});

/**
 * GET /v1/canvases/{id}/assets: every image of the canvas, each with how many live items use it (`uses`), for
 * the manage-images dialog. Archived canvases are listed too. Needs view access.
 */
canvasAssets.get("/canvases/:id/assets", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "view", {
      includeArchived: true,
    });
    if (isResponse(canvas)) return canvas;
    const rows = await sql`SELECT a.*, (SELECT count(*)::int FROM canvas_items i
         WHERE i.canvas_id = a.canvas_id AND NOT i.deleted AND i.props->>'asset' = a.id::text) AS uses
       FROM canvas_assets a
       WHERE a.canvas_id = ${canvas.id}::text::uuid
       ORDER BY a.created_at`;
    const assets = rows.map((r) => ({
      ...assetView(canvas.id, r as Row),
      uses: Number((r as Row)["uses"]),
    }));
    return json({ assets }, 200);
  } catch (err) {
    console.error("space GET /canvases/:id/assets failed", err);
    return serverError();
  }
});

/**
 * DELETE /v1/canvases/{id}/assets/{asset}: removes an image no live item uses. 409 `in_use` while one does. The
 * row goes first; then its original and every thumbnail are removed from R2 (R2 errors are logged, not returned).
 * Needs edit access. 204 when deleted.
 */
canvasAssets.delete("/canvases/:id/assets/:asset", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const canvas = await loadCanvas(sql, who.id, c.req.param("id"), "edit");
    if (isResponse(canvas)) return canvas;
    const assetId = uuidOr404(c.req.param("asset"), NO_IMAGE);
    if (isResponse(assetId)) return assetId;
    const row = await assetRow(sql, canvas.id, assetId);
    if (!row) return notFound(NO_IMAGE);

    const counted = await sql`SELECT count(*)::int AS uses FROM canvas_items i
       WHERE i.canvas_id = ${canvas.id}::text::uuid AND NOT i.deleted AND i.props->>'asset' = ${assetId}::text`;
    if (Number((counted[0] as Row | undefined)?.["uses"] ?? 0) > 0) {
      return apiError(409, "in_use", "This image is still used on the canvas.");
    }

    await sql`DELETE FROM canvas_assets
       WHERE id = ${assetId}::text::uuid AND canvas_id = ${canvas.id}::text::uuid`;
    const thumbKeys = Object.values((row["thumb_keys"] ?? {}) as Record<string, string>);
    for (const key of [row["object_key"] as string, ...thumbKeys]) {
      await blobBucket()
        .delete(key)
        .catch((err: unknown) => console.error("space canvas asset delete failed", key, err));
    }
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("space DELETE /canvases/:id/assets/:asset failed", err);
    return serverError();
  }
});

export default canvasAssets;

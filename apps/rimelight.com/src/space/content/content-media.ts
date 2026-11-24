/**
 * Rimelight Space media routes (CMS.6, decision 0049): the media_assets table, with the bytes in the R2 binding BLOB.
 * Mounted under /v1 by the Space API. Pure helpers are in content-media-logic.ts.
 *
 *   GET    /v1/content/media?folder=        -> { assets: [{ id, key, url, alt, width, height, mime, size, createdAt }] }
 *            (missing or empty folder is the root). Any employee (caller).
 *   POST   /v1/content/media  multipart: file (required, at most 50 MB), alt?, folder?  -> 201 { asset }
 *            Any employee (caller). Stored at content/<uuid>/<sanitised filename>.
 *   PATCH  /v1/content/media/:id {alt}  -> { asset }. Any employee (caller).
 *   DELETE /v1/content/media/:id        -> { deleted: true, id }; removes the row and the object. Any employee (caller).
 *   GET    /v1/content/media/file/*     -> the object, streamed publicly (no session), as the CMS media route does.
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import {
  apiError,
  badRequest,
  json,
  notFound,
  readBody,
  type Row,
  uuidOr404,
} from "../canvas-access.ts";
import {
  buildMediaStorageKey,
  mediaAssetView,
  mediaFolderValue,
  mediaKeyFromPath,
  mediaSizeOk,
  MEDIA_MAX_BYTES,
  parseMediaAlt,
  sanitizeMediaFileName,
  type MediaRow,
} from "./content-media-logic.ts";

type BlobBindings = { BLOB: R2Bucket };
const blobBucket = (): R2Bucket => (env as unknown as BlobBindings).BLOB;

const NO_ASSET = "There is no such media file.";

const content = new Hono();

/** GET /v1/content/media?folder=: the media files in a folder (the root when folder is missing or empty). */
content.get("/content/media", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const folder = mediaFolderValue(c.req.query("folder"));
    if (!folder.ok) return badRequest(folder.message);
    const rows = await sql`SELECT id, storage_key, mime_type, size, width, height, alt, created_at
       FROM media_assets
       WHERE folder_id IS NOT DISTINCT FROM ${folder.folder}::text
       ORDER BY created_at DESC, id`;
    return json({ assets: rows.map((r) => mediaAssetView(r as unknown as MediaRow)) });
  } catch (err) {
    console.error("space GET /content/media failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** POST /v1/content/media: uploads one file (multipart: file, alt, folder). */
content.post("/content/media", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  let id: string | null = null;
  let key: string | null = null;
  try {
    const sql = getSql();
    const form = await c.req.formData().catch(() => null);
    if (form === null) return badRequest("Send the file as multipart form data.");
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("file is the file to upload.");
    if (!mediaSizeOk(file.size)) {
      return apiError(
        413,
        "payload_too_large",
        `Files are at most ${MEDIA_MAX_BYTES / (1024 * 1024)} MB.`,
      );
    }
    const alt = parseMediaAlt(form.get("alt") ?? null);
    if (!alt.ok) return badRequest(alt.message);
    const folder = mediaFolderValue(form.get("folder") ?? undefined);
    if (!folder.ok) return badRequest(folder.message);

    id = crypto.randomUUID();
    const filename = sanitizeMediaFileName(file.name);
    key = buildMediaStorageKey(id, filename);
    const mime = file.type || "application/octet-stream";
    await blobBucket().put(key, file, { httpMetadata: { contentType: mime } });
    try {
      const rows =
        await sql`INSERT INTO media_assets (id, storage_key, filename, mime_type, size, alt, folder_id)
         VALUES (${id}::text, ${key}::text, ${filename}::text, ${mime}::text, ${file.size}::int,
           ${alt.alt === null ? null : JSON.stringify(alt.alt)}::jsonb, ${folder.folder}::text)
         RETURNING id, storage_key, mime_type, size, width, height, alt, created_at`;
      return json({ asset: mediaAssetView(rows[0] as unknown as MediaRow) }, 201);
    } catch (err) {
      await blobBucket()
        .delete(key)
        .catch(() => undefined);
      throw err;
    }
  } catch (err) {
    console.error("space POST /content/media failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** PATCH /v1/content/media/:id {alt}: changes the alt text. The file and its key do not change. */
content.patch("/content/media/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const id = uuidOr404(c.req.param("id"), NO_ASSET);
    if (typeof id !== "string") return id;
    const body = await readBody(c);
    if (body === null) return badRequest("The body must be a JSON object.");
    if (body["alt"] === undefined) return badRequest("Send alt.");
    const alt = parseMediaAlt(body["alt"]);
    if (!alt.ok) return badRequest(alt.message);
    const rows = await sql`UPDATE media_assets SET
         alt = ${alt.alt === null ? null : JSON.stringify(alt.alt)}::jsonb,
         updated_at = now()
       WHERE id = ${id}::text
       RETURNING id, storage_key, mime_type, size, width, height, alt, created_at`;
    if (rows.length === 0) return notFound(NO_ASSET);
    return json({ asset: mediaAssetView(rows[0] as unknown as MediaRow) });
  } catch (err) {
    console.error("space PATCH /content/media/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/** DELETE /v1/content/media/:id: removes the row and its object. */
content.delete("/content/media/:id", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getSql();
    const id = uuidOr404(c.req.param("id"), NO_ASSET);
    if (typeof id !== "string") return id;
    const rows = await sql`DELETE FROM media_assets WHERE id = ${id}::text RETURNING storage_key`;
    const row = rows[0] as Row | undefined;
    if (!row) return notFound(NO_ASSET);
    await blobBucket().delete(row["storage_key"] as string);
    return json({ deleted: true, id });
  } catch (err) {
    console.error("space DELETE /content/media/:id failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

/**
 * GET /v1/content/media/file/*: streams a stored object publicly. Copies the read-only route of the CMS
 * (packages/cms/src/server/router.ts handleMediaFile): the ETag from R2 and `Cache-Control: public, max-age=0,
 * must-revalidate`, so a replaced file shows up at once.
 */
content.get("/content/media/file/*", async (c) => {
  const key = mediaKeyFromPath(c.req.path);
  if (key === null) return apiError(400, "invalid_request", "The file path is not valid.");
  try {
    const object = await blobBucket().get(key);
    if (!object) return apiError(404, "not_found", "File not found in storage.");
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    return new Response(object.body, { status: 200, headers });
  } catch (err) {
    console.error("space GET /content/media/file failed", err);
    return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
  }
});

export default content;

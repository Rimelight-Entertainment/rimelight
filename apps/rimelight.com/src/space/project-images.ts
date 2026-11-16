/**
 * Rimelight Space project picture routes on the website Worker. The bytes live in the R2 bucket bound as env.BLOB
 * under "space/projects/"; projects.image_key holds the full object key, or NULL when there is no picture.
 * Upload rules match the avatars (avatars.ts): PNG, JPEG or WebP by magic bytes, at most 5 MiB.
 */
import { Hono, type Context } from "hono";
import { env } from "cloudflare:workers";
import { getDb } from "../db/index.ts";
import { mediaType, randomHex, sniffImage } from "./avatars.ts";
import { caller, isResponse } from "./session.ts";
import { handle, loadProject, requireManage } from "./projects-write.ts";

const projectImages = new Hono();

/** Same limit as the avatars (5 MiB). */
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
/** Object key prefix in the R2 bucket. */
const R2_PREFIX = "space/projects/";

const blobs = (env as unknown as { BLOB: R2Bucket }).BLOB;

const apiError = (status: number, error: string, message: string) =>
  Response.json({ error, message }, { status, headers: { "Cache-Control": "no-store" } });

const noPicture = () => apiError(404, "not_found", "This project has no picture.");

/** Media type for a stored key, from its extension (the keys are written by this file only). */
function contentTypeForKey(key: string): string {
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** POST /projects/:key/image: replace the project picture. Project admins and global admins only. */
async function uploadImage(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const { project, access } = await loadProject(sql, who, c.req.param("key") ?? "");
  requireManage(access);

  const body = new Uint8Array(await c.req.arrayBuffer());
  if (body.byteLength > IMAGE_MAX_BYTES) {
    return apiError(413, "payload_too_large", "Project pictures are at most 5 MB.");
  }
  const sniffed = sniffImage(body);
  if (!sniffed) {
    return apiError(415, "unsupported_image", "Upload a PNG, JPEG or WebP image.");
  }
  const declared = mediaType(c.req.header("Content-Type") ?? "");
  if (declared !== sniffed.mediaType) {
    return apiError(415, "unsupported_image", "The Content-Type does not match the image.");
  }

  const imageKey = `${R2_PREFIX}${project.id}-${randomHex()}.${sniffed.ext}`;
  await blobs.put(imageKey, body, { httpMetadata: { contentType: sniffed.mediaType } });

  let previous: string | null;
  try {
    const rows =
      await sql`SELECT image_key FROM projects WHERE key = ${project.key}::text AND deleted_at IS NULL`;
    previous = (rows[0]?.["image_key"] as string | null) ?? null;
    await sql`UPDATE projects SET image_key = ${imageKey}::text WHERE key = ${project.key}::text`;
  } catch (err) {
    // Roll back the new blob, as the avatar handler does, then fail.
    await blobs.delete(imageKey).catch(() => undefined);
    throw err;
  }

  // The old picture is removed best effort; the new key is already in place.
  if (previous && previous !== imageKey) await blobs.delete(previous).catch(() => undefined);

  return Response.json(
    { image_url: `/v1/projects/${project.key}/image` },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

/** GET /projects/:key/image: the picture bytes. Anyone who can view the project may read it. */
async function readImage(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const { project } = await loadProject(sql, who, c.req.param("key") ?? "");

  const rows =
    await sql`SELECT image_key FROM projects WHERE key = ${project.key}::text AND deleted_at IS NULL`;
  const imageKey = (rows[0]?.["image_key"] as string | null) ?? null;
  if (!imageKey) return noPicture();

  const object = await blobs.get(imageKey);
  if (!object) return noPicture();
  return new Response(await object.arrayBuffer(), {
    status: 200,
    headers: { "Content-Type": contentTypeForKey(imageKey), "Cache-Control": "no-store" },
  });
}

projectImages.post("/projects/:key/image", handle(uploadImage));
projectImages.get("/projects/:key/image", handle(readImage));

export default projectImages;

/**
 * Rimelight Space avatar routes on the website Worker (port of the avatar parts of people_service.rs,
 * blob.rs and pg_people.rs). Avatars live in the R2 bucket bound as env.BLOB under the "space/avatars/" prefix.
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

const avatars = new Hono();

/** Same limit as rimelight_proto::people::AVATAR_MAX_BYTES (5 MiB). */
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
/** Longest key accepted (blob.rs MAX_KEY_LEN). */
const MAX_KEY_LEN = 120;
/** Object key prefix in the R2 bucket (blob.rs R2_PREFIX). */
const R2_PREFIX = "space/avatars/";

const blobs = (env as unknown as { BLOB: R2Bucket }).BLOB;

const serverError = () =>
  Response.json(
    { error: "server_error", message: "Something went wrong. Try again in a moment." },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );

const apiError = (status: number, error: string, message: string) =>
  Response.json({ error, message }, { status, headers: { "Cache-Control": "no-store" } });

/** blob.rs valid_key: 1 to 120 ASCII letters, digits, `-`, `_` or `.`, no leading dot, no `..`. */
function validKey(key: string): boolean {
  return (
    key.length > 0 &&
    key.length <= MAX_KEY_LEN &&
    !key.startsWith(".") &&
    !key.includes("..") &&
    /^[A-Za-z0-9._-]+$/.test(key)
  );
}

/** blob.rs content_type_for_key: media type by extension, or null when unknown. */
function contentTypeForKey(key: string): string | null {
  const dot = key.lastIndexOf(".");
  const ext = dot === -1 ? null : key.slice(dot + 1);
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}

type Sniffed = { mediaType: string; ext: string };

/** people_service.rs sniff_image: PNG, JPEG or WebP by magic bytes, else null. */
function sniffImage(bytes: Uint8Array): Sniffed | null {
  const startsWith = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mediaType: "image/png", ext: "png" };
  }
  if (startsWith([0xff, 0xd8, 0xff])) {
    return { mediaType: "image/jpeg", ext: "jpg" };
  }
  // RIFF....WEBP
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { mediaType: "image/webp", ext: "webp" };
  }
  return null;
}

/** people_service.rs media_type: the part before `;`, trimmed and lower-cased. */
function mediaType(value: string): string {
  return (value.split(";")[0] ?? "").trim().toLowerCase();
}

/** people_service.rs random_hex: 8 random bytes as 16 lower-case hex digits. */
function randomHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** GET /avatars/:key: the avatar bytes with their media type. Any signed-in person may read it. */
avatars.get("/avatars/:key", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const key = c.req.param("key");
  try {
    const contentType = validKey(key) ? contentTypeForKey(key) : null;
    if (!contentType) return apiError(404, "not_found", "There is no such avatar.");
    const object = await blobs.get(R2_PREFIX + key);
    if (!object) return apiError(404, "not_found", "There is no such avatar.");
    const bytes = await object.arrayBuffer();
    return new Response(bytes, {
      status: 200,
      headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("space /avatars/:key failed", err);
    return serverError();
  }
});

/** PUT /me/avatar: replace the caller's photo with a PNG, JPEG or WebP image of at most 5 MB. */
avatars.put("/me/avatar", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const body = new Uint8Array(await c.req.arrayBuffer());
    if (body.byteLength > AVATAR_MAX_BYTES) {
      return apiError(413, "payload_too_large", "Avatars are at most 5 MB.");
    }
    const sniffed = sniffImage(body);
    if (!sniffed) {
      return apiError(415, "unsupported_image", "Upload a PNG, JPEG or WebP image.");
    }
    const declared = mediaType(c.req.header("Content-Type") ?? "");
    if (declared !== sniffed.mediaType) {
      return apiError(415, "unsupported_image", "The Content-Type does not match the image.");
    }

    const key = `${who.id}-${randomHex()}.${sniffed.ext}`;
    await blobs.put(R2_PREFIX + key, body, {
      httpMetadata: { contentType: sniffed.mediaType },
    });

    const sql = getDb().$client;
    let previous: string | null;
    try {
      const rows = await sql`
        SELECT avatar_key FROM employees
         WHERE id = ${who.id}::text::uuid AND deleted_at IS NULL`;
      if (rows.length === 0) throw new Error("person not found");
      previous = (rows[0]?.["avatar_key"] as string | null) ?? null;
      await sql`
        UPDATE employees SET avatar_key = ${key}::text, updated_at = now()
         WHERE id = ${who.id}::text::uuid`;
    } catch (err) {
      // Roll back the new blob, as the Rust handler does, then fail.
      await blobs.delete(R2_PREFIX + key).catch(() => undefined);
      throw err;
    }

    // The old photo is removed best effort; the new key is already in place.
    if (previous) await blobs.delete(R2_PREFIX + previous).catch(() => undefined);

    return c.json({ avatar_url: `/v1/avatars/${key}` }, 200, { "Cache-Control": "no-store" });
  } catch (err) {
    console.error("space /me/avatar failed", err);
    return serverError();
  }
});

export default avatars;

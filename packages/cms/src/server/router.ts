import { Hono } from "hono";
import { createContentRouter, type ContentRouterOptions } from "./content";
import { handleCmsError } from "./errors";

/**
 * Public delivery API: `/content/*` (published pages, taxonomies, bylines, docs navigation),
 * `/search`, and `/cms/media/file/*` (stored media, read-only). Anonymous by design. Content is
 * edited in Rimelight Space (decision 0049), so this package serves no write routes.
 */
export function createCmsApi(options: ContentRouterOptions = {}): Hono {
  const app = new Hono();
  app.onError(handleCmsError as any);
  const content = createContentRouter(options);
  app.route("/content", content.content);
  app.route("/search", content.search);
  app.get("/cms/media/file/*", (c) =>
    handleMediaFile(c.env as Record<string, unknown> | undefined, mediaKey(c.req.path)),
  );
  return app;
}

const MEDIA_FILE_PREFIX = "/cms/media/file/";

/** The storage key from `/cms/media/file/<key>`, each segment URL-decoded. */
export function mediaKey(path: string): string {
  const i = path.indexOf(MEDIA_FILE_PREFIX);
  if (i < 0) return "";
  return path
    .slice(i + MEDIA_FILE_PREFIX.length)
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
}

type StoredObject = {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
};
type Bucket = { get(key: string): Promise<StoredObject | null> };

/**
 * Streams a stored object from the `BLOB` R2 binding. Media uploaded through the old CMS dashboard
 * was saved with links to `/api/cms/media/file/<key>` (no CDN was configured), so published pages
 * still point here.
 */
export async function handleMediaFile(
  env: Record<string, unknown> | undefined,
  key: string,
): Promise<Response> {
  const bucket = env?.["BLOB"] as Bucket | undefined;
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
}

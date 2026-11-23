import { describe, expect, it } from "vite-plus/test";
import { createCmsApi, mediaKey } from "../src/server/router";

/** A fake R2 bucket holding one object. */
function bucket(key: string, body: string) {
  return {
    async get(wanted: string) {
      if (wanted !== key) return null;
      return {
        body: new Response(body).body!,
        httpEtag: '"etag-1"',
        writeHttpMetadata(headers: Headers) {
          headers.set("content-type", "image/png");
        },
      };
    },
  };
}

describe("media file route (read-only, kept for media uploaded through the old dashboard)", () => {
  it("decodes the storage key from the path", () => {
    expect(mediaKey("/cms/media/file/uploads/a%20b/c.png")).toBe("uploads/a b/c.png");
    expect(mediaKey("/cms/media/other")).toBe("");
  });

  it("streams a stored object with revalidating cache headers", async () => {
    const app = createCmsApi();
    const res = await app.request(
      "/cms/media/file/uploads/c.png",
      {},
      {
        BLOB: bucket("uploads/c.png", "png-bytes"),
      },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("etag")).toBe('"etag-1"');
    expect(res.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(await res.text()).toBe("png-bytes");
  });

  it("answers 404 for a missing object", async () => {
    const app = createCmsApi();
    const res = await app.request("/cms/media/file/nope.png", {}, { BLOB: bucket("x", "") });
    expect(res.status).toBe(404);
  });
});

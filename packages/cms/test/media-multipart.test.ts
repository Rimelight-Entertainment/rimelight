import { beforeEach, describe, expect, it } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { migrateCms } from "../src/migrator/index";
import { createCms, type Cms } from "../src/services/index";
import {
  MEDIA_PART_SIZE,
  handleMediaUploadAbort,
  handleMediaUploadComplete,
  handleMediaUploadPart,
  handleMediaUploadStart,
  type MediaRouteContext,
} from "../src/server/media";
import { createMockD1 } from "./helpers/d1";

const origin = "http://cms.test/api/cms";

interface Started {
  uploadId: string;
  key: string;
  id: string;
  partSize: number;
  partCount: number;
}

interface PartRef {
  partNumber: number;
  etag: string;
}

interface FakeBucket {
  objects: Map<string, Uint8Array>;
  uploads: Map<string, { key: string; parts: Map<number, Uint8Array> }>;
  createMultipartUpload(key: string): Promise<{ key: string; uploadId: string }>;
  resumeMultipartUpload(
    key: string,
    uploadId: string,
  ): {
    uploadPart(partNumber: number, body: ReadableStream<Uint8Array>): Promise<PartRef>;
    complete(parts: PartRef[]): Promise<{ key: string; size: number }>;
    abort(): Promise<void>;
  };
  delete(key: string): Promise<void>;
}

/**
 * In-memory stand-in for the R2 binding's multipart methods. It stores the bytes of each part and
 * only completes when the etags match what uploadPart returned, like R2 does.
 */
function fakeBucket(): FakeBucket {
  const objects = new Map<string, Uint8Array>();
  const uploads = new Map<string, { key: string; parts: Map<number, Uint8Array> }>();
  let seq = 0;
  return {
    objects,
    uploads,
    async createMultipartUpload(key: string) {
      const uploadId = `upload-${++seq}`;
      uploads.set(uploadId, { key, parts: new Map() });
      return { key, uploadId };
    },
    resumeMultipartUpload(key: string, uploadId: string) {
      const upload = uploads.get(uploadId);
      if (!upload || upload.key !== key) throw new Error(`no multipart upload ${uploadId}`);
      return {
        async uploadPart(partNumber: number, body: ReadableStream<Uint8Array>) {
          upload.parts.set(partNumber, new Uint8Array(await new Response(body).arrayBuffer()));
          return { partNumber, etag: `etag-${partNumber}` };
        },
        async complete(parts: PartRef[]) {
          const chunks = parts.map((p) => {
            const chunk = upload.parts.get(p.partNumber);
            if (!chunk || p.etag !== `etag-${p.partNumber}`) throw new Error("bad part");
            return chunk;
          });
          const data = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
          let offset = 0;
          for (const chunk of chunks) {
            data.set(chunk, offset);
            offset += chunk.byteLength;
          }
          objects.set(key, data);
          uploads.delete(uploadId);
          return { key, size: data.byteLength };
        },
        async abort() {
          uploads.delete(uploadId);
        },
      };
    },
    async delete(key: string) {
      objects.delete(key);
    },
  };
}

function payload(size: number, seed = 0) {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = (i + seed) % 251;
  return bytes;
}

let cms: Cms;
let bucket: FakeBucket;
let ctx: MediaRouteContext;

beforeEach(async () => {
  const { binding } = createMockD1();
  await migrateCms(binding);
  cms = createCms({ db: drizzle(binding), dialect: "sqlite" });
  bucket = fakeBucket();
  ctx = {
    cms,
    storage: { provider: "r2", binding: "BLOB", prefix: "media/" },
    getBucket: async () => bucket,
    getSession: async () => ({ userId: "admin-1" }),
  };
});

async function startUpload(
  body: unknown,
  routeCtx = ctx,
): Promise<{ status: number; data: Started }> {
  const res = await handleMediaUploadStart(
    new Request(`${origin}/media/uploads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    routeCtx,
  );
  const json = (await res.json()) as { data: Started };
  return { status: res.status, data: json.data };
}

async function sendParts(started: Started, bytes: Uint8Array): Promise<PartRef[]> {
  const parts: PartRef[] = [];
  for (let i = 0; i < started.partCount; i++) {
    const chunk = bytes.slice(i * started.partSize, (i + 1) * started.partSize);
    const url = `${origin}/media/uploads/${started.uploadId}/parts/${i + 1}?key=${encodeURIComponent(started.key)}`;
    const res = await handleMediaUploadPart(
      new Request(url, { method: "PUT", body: chunk }),
      started.uploadId,
      String(i + 1),
      ctx,
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { part: PartRef } };
    parts.push(json.data.part);
  }
  return parts;
}

function completeUpload(started: Started, fields: Record<string, unknown>) {
  return handleMediaUploadComplete(
    new Request(`${origin}/media/uploads/${started.uploadId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: started.key, id: started.id, ...fields }),
    }),
    started.uploadId,
    ctx,
  );
}

describe("chunked media upload", () => {
  it("plans parts that each stay under the request body limit and stores the object under the prefix", async () => {
    const bytes = payload(MEDIA_PART_SIZE + 4096);
    const { status, data: started } = await startUpload({
      filename: "big.zip",
      mimeType: "application/zip",
      size: bytes.byteLength,
    });

    expect(status).toBe(201);
    expect(started.partSize).toBeLessThanOrEqual(100 * 1024 * 1024);
    expect(started.partCount).toBe(2);
    expect(started.key).toBe(`media/${started.id}.zip`);

    const parts = await sendParts(started, bytes);
    const res = await completeUpload(started, {
      size: bytes.byteLength,
      mimeType: "application/zip",
      filename: "big.zip",
      parts,
    });

    expect(res.status).toBe(201);
    const stored = bucket.objects.get(started.key);
    expect(stored && Buffer.from(stored).equals(Buffer.from(bytes))).toBe(true);
    const asset = await cms.media.getAsset(started.id);
    expect(asset).toMatchObject({ storageKey: started.key, size: bytes.byteLength });
  });

  it("rejects a start with a zero or non-numeric size", async () => {
    expect((await startUpload({ filename: "a.zip", size: 0 })).status).toBe(400);
    expect((await startUpload({ filename: "a.zip", size: "12" })).status).toBe(400);
  });

  it("rejects part numbers outside 1 to 10000", async () => {
    const { data: started } = await startUpload({ filename: "a.zip", size: 8 });
    for (const partNumber of ["0", "10001"]) {
      const res = await handleMediaUploadPart(
        new Request(`${origin}/x?key=${encodeURIComponent(started.key)}`, {
          method: "PUT",
          body: new Uint8Array(8),
        }),
        started.uploadId,
        partNumber,
        ctx,
      );
      expect(res.status).toBe(400);
    }
  });

  it("rejects part and abort keys outside the media prefix", async () => {
    const { data: started } = await startUpload({ filename: "a.zip", size: 8 });
    const outside = encodeURIComponent("secrets/other.zip");
    const part = await handleMediaUploadPart(
      new Request(`${origin}/x?key=${outside}`, { method: "PUT", body: new Uint8Array(8) }),
      started.uploadId,
      "1",
      ctx,
    );
    const abort = await handleMediaUploadAbort(
      new Request(`${origin}/x?key=${outside}`, { method: "DELETE" }),
      started.uploadId,
      ctx,
    );
    expect(part.status).toBe(400);
    expect(abort.status).toBe(400);
  });

  it("does not finish an upload that is missing a part and records nothing", async () => {
    const bytes = payload(MEDIA_PART_SIZE + 10);
    const { data: started } = await startUpload({ filename: "big.zip", size: bytes.byteLength });
    const [firstPart] = await sendParts({ ...started, partCount: 1 }, bytes);

    const res = await completeUpload(started, {
      size: bytes.byteLength,
      mimeType: "application/zip",
      filename: "big.zip",
      parts: [firstPart],
    });

    expect(res.status).toBe(400);
    expect(bucket.objects.has(started.key)).toBe(false);
    await expect(cms.media.getAsset(started.id)).rejects.toThrow();
  });

  it("deletes the object when the stored size differs from the declared size", async () => {
    const bytes = payload(MEDIA_PART_SIZE + 100);
    const { data: started } = await startUpload({ filename: "big.zip", size: bytes.byteLength });
    const first = bytes.subarray(0, MEDIA_PART_SIZE);
    const short = bytes.subarray(MEDIA_PART_SIZE, bytes.byteLength - 10);
    const parts: PartRef[] = [];
    for (const [i, chunk] of [first, short].entries()) {
      const url = `${origin}/x?key=${encodeURIComponent(started.key)}`;
      const res = await handleMediaUploadPart(
        new Request(url, { method: "PUT", body: chunk }),
        started.uploadId,
        String(i + 1),
        ctx,
      );
      const json = (await res.json()) as { data: { part: PartRef } };
      parts.push(json.data.part);
    }

    const res = await completeUpload(started, {
      size: bytes.byteLength,
      mimeType: "application/zip",
      filename: "big.zip",
      parts,
    });

    expect(res.status).toBe(400);
    expect(bucket.objects.has(started.key)).toBe(false);
  });

  it("replaces a file in place, keeping its storage key", async () => {
    const original = payload(5, 1);
    const { data: first } = await startUpload({ filename: "logo.png", size: original.byteLength });
    const created = await completeUpload(first, {
      size: original.byteLength,
      mimeType: "image/png",
      filename: "logo.png",
      parts: await sendParts(first, original),
    });
    const createdJson = (await created.json()) as { data: { file: { id: string } } };
    const { file } = createdJson.data;

    const replacement = payload(7, 2);
    const { data: started } = await startUpload({
      filename: "logo.png",
      size: replacement.byteLength,
      replaceId: file.id,
    });
    expect(started.key).toBe(first.key);

    const res = await completeUpload(started, {
      replace: true,
      size: replacement.byteLength,
      mimeType: "image/png",
      parts: await sendParts(started, replacement),
    });

    expect(res.status).toBe(200);
    expect(bucket.objects.get(first.key)).toEqual(replacement);
    expect(await cms.media.getAsset(file.id)).toMatchObject({
      storageKey: first.key,
      size: replacement.byteLength,
    });
  });

  it("refuses to finish a replacement whose key is not the file's storage key", async () => {
    const bytes = payload(5);
    const { data: first } = await startUpload({ filename: "a.png", size: bytes.byteLength });
    await completeUpload(first, {
      size: bytes.byteLength,
      mimeType: "image/png",
      filename: "a.png",
      parts: await sendParts(first, bytes),
    });
    const { data: replacing } = await startUpload({
      filename: "a.png",
      size: bytes.byteLength,
      replaceId: first.id,
    });
    const res = await completeUpload(
      { ...replacing, key: `media/${crypto.randomUUID()}.png` },
      {
        replace: true,
        size: bytes.byteLength,
        mimeType: "image/png",
        parts: [{ partNumber: 1, etag: "etag-1" }],
      },
    );
    expect(res.status).toBe(400);
    expect(await cms.media.getAsset(first.id)).toMatchObject({ storageKey: first.key });
  });

  it("cancels an upload and discards its stored parts", async () => {
    const bytes = payload(MEDIA_PART_SIZE + 10);
    const { data: started } = await startUpload({ filename: "big.zip", size: bytes.byteLength });
    await sendParts({ ...started, partCount: 1 }, bytes);
    expect(bucket.uploads.size).toBe(1);

    const res = await handleMediaUploadAbort(
      new Request(`${origin}/x?key=${encodeURIComponent(started.key)}`, { method: "DELETE" }),
      started.uploadId,
      ctx,
    );

    expect(res.status).toBe(200);
    expect(bucket.uploads.size).toBe(0);
    expect(bucket.objects.has(started.key)).toBe(false);
  });

  it("requires a session", async () => {
    const res = await handleMediaUploadStart(
      new Request(`${origin}/media/uploads`, {
        method: "POST",
        body: JSON.stringify({ filename: "a.zip", size: 8 }),
      }),
      { ...ctx, getSession: async () => null },
    );
    expect(res.status).toBe(401);
  });
});

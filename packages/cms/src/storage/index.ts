export interface StorageFile {
  key: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  /** Same-origin proxy URL (when available) for previews that must not depend on the public domain. */
  previewUrl?: string | undefined;
  etag?: string;
  customMetadata?: Record<string, string>;
}

export interface StorageListResult {
  files: StorageFile[];
  /** Immediate sub-folders (full keys ending in `/`), only when listing with `delimited`. */
  folders?: string[];
  truncated: boolean;
  cursor?: string;
}

/** Encodes each path segment so keys with spaces, `#` or `?` produce valid URLs. */
export function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

/** Every directory implied by the object keys, as `a/`, `a/b/` (includes empty folders). */
function deriveFolders(objects: { key: string }[]): string[] {
  const dirs = new Set<string>();
  for (const obj of objects) {
    const parts = String(obj.key).split("/");
    for (let i = 1; i < parts.length; i += 1) dirs.add(`${parts.slice(0, i).join("/")}/`);
  }
  return [...dirs].sort();
}

/** Placeholder object that keeps an empty folder visible in the bucket. */
export const FOLDER_PLACEHOLDER = ".keep";

/**
 * Normalises a folder path to `a/b/` form ("" for the root). Strips leading/trailing slashes and
 * `.` / `..` segments so paths cannot escape the configured prefix.
 */
export function normalizeFolder(path: string | null | undefined): string {
  const parts = (path ?? "")
    .split("/")
    .map((p) => p.trim())
    .filter((p) => p && p !== "." && p !== "..");
  return parts.length ? `${parts.join("/")}/` : "";
}

export interface R2StorageOptions {
  binding?: string | undefined;
  publicUrl?: string | undefined;
  prefix?: string | undefined;
}

export interface StorageConfig {
  provider: "r2" | "local" | "s3";
  binding?: string | undefined;
  publicUrl?: string | undefined;
  prefix?: string | undefined;
}

export interface StorageListOptions {
  prefix?: string | undefined;
  /** List one folder level: returns `folders` and only the direct children as `files`. */
  delimited?: boolean | undefined;
  /** Return every folder implied by the listed keys (including empty ones) as `folders`. */
  allKeys?: boolean | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
  publicUrl?: string | undefined;
  apiBasePath?: string | undefined;
}

export interface StorageUploadOptions {
  key?: string | undefined;
  prefix?: string | undefined;
  publicUrl?: string | undefined;
  apiBasePath?: string | undefined;
}

export function r2(options: R2StorageOptions = {}): StorageConfig {
  return {
    provider: "r2",
    binding: options.binding ?? "BLOB",
    publicUrl: options.publicUrl,
    prefix: options.prefix ?? "media/",
  };
}

/**
 * Resolves Cloudflare R2 bucket instance from the Cloudflare env or request locals.
 */
export async function getR2Bucket(locals?: any, bindingName = "BLOB"): Promise<any> {
  // 1. Direct locals property check (locals.runtime.env, locals.env or locals[bindingName])
  if (locals) {
    if (locals.runtime?.env && locals.runtime.env[bindingName]) {
      return locals.runtime.env[bindingName];
    }
    if (locals.env && locals.env[bindingName]) {
      return locals.env[bindingName];
    }
    if (locals[bindingName]) {
      return locals[bindingName];
    }
  }

  return null;
}

/**
 * Lists files from R2 Bucket under configured prefix.
 */
export async function listR2Files(
  bucket: any,
  options: StorageListOptions = {},
): Promise<StorageListResult> {
  if (!bucket || typeof bucket.list !== "function") {
    return { files: [], truncated: false };
  }

  // Lists the whole bucket unless a prefix is configured, so objects uploaded outside the CMS show up.
  const prefix = options.prefix ?? "";
  const limit = options.limit ?? 50;

  const result = await bucket.list({
    prefix,
    cursor: options.cursor,
    limit,
    ...(options.delimited ? { delimiter: "/" } : {}),
  });

  const files: StorageFile[] = (result.objects || [])
    .filter((obj: any) => !String(obj.key).endsWith(`/${FOLDER_PLACEHOLDER}`))
    .map((obj: any) => {
      const rawKey = obj.key as string;
      const name = rawKey.startsWith(prefix) ? rawKey.slice(prefix.length) : rawKey;
      const cleanedName = name.includes("/") ? name.split("/").pop()! : name;
      const mimeType = obj.httpMetadata?.contentType || guessMimeType(rawKey);

      // Resolve public URL: custom domain, or proxy endpoint
      let url = "";
      if (options.publicUrl) {
        const baseUrl = options.publicUrl.endsWith("/")
          ? options.publicUrl.slice(0, -1)
          : options.publicUrl;
        url = `${baseUrl}/${encodeKey(rawKey)}`;
      } else if (options.apiBasePath) {
        const baseApi = options.apiBasePath.endsWith("/")
          ? options.apiBasePath.slice(0, -1)
          : options.apiBasePath;
        url = `${baseApi}/${encodeKey(rawKey)}`;
      } else {
        url = `/cms/api/media/${encodeKey(rawKey)}`;
      }

      return {
        key: rawKey,
        name: cleanedName,
        size: obj.size,
        mimeType,
        uploadedAt: obj.uploaded ? new Date(obj.uploaded).toISOString() : new Date().toISOString(),
        url,
        ...(options.apiBasePath
          ? {
              previewUrl: `${options.apiBasePath.replace(/\/$/, "")}/${encodeKey(rawKey)}`,
            }
          : {}),
        etag: obj.etag,
        customMetadata: obj.customMetadata,
      };
    });

  const allFolders = options.allKeys ? deriveFolders(result.objects ?? []) : undefined;
  return {
    files,
    ...(options.delimited ? { folders: (result.delimitedPrefixes ?? []) as string[] } : {}),
    ...(allFolders ? { folders: allFolders } : {}),
    truncated: result.truncated,
    cursor: result.cursor,
  };
}

/** Creates an empty folder by writing a placeholder object under it. `path` is normalised. */
export async function createR2Folder(bucket: any, path: string): Promise<string> {
  const folder = normalizeFolder(path);
  if (!folder) throw new Error("Folder name is required.");
  await bucket.put(`${folder}${FOLDER_PLACEHOLDER}`, new Uint8Array(0));
  return folder;
}

/** Lists every key under a prefix, following pagination. */
async function listAllKeys(bucket: any, prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page: any = await bucket.list({ prefix, cursor, limit: 1000 });
    for (const obj of page.objects ?? []) keys.push(obj.key as string);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return keys;
}

/** Moves one object to a new key (copy with metadata, then delete the original). */
export async function moveR2Object(bucket: any, from: string, to: string): Promise<void> {
  const obj = await bucket.get(from);
  if (!obj) throw new Error(`File not found: ${from}`);
  await bucket.put(to, obj.body, {
    httpMetadata: obj.httpMetadata,
    customMetadata: obj.customMetadata,
  });
  await bucket.delete(from);
}

/** Moves every object under `fromPrefix` to the same relative path under `toPrefix`. */
export async function moveR2Prefix(
  bucket: any,
  fromPrefix: string,
  toPrefix: string,
): Promise<number> {
  const keys = await listAllKeys(bucket, fromPrefix);
  for (const key of keys) {
    await moveR2Object(bucket, key, `${toPrefix}${key.slice(fromPrefix.length)}`);
  }
  return keys.length;
}

/** Deletes every object under a prefix (a folder and everything in it). */
export async function deleteR2Prefix(bucket: any, prefix: string): Promise<number> {
  const keys = await listAllKeys(bucket, prefix);
  for (let i = 0; i < keys.length; i += 1000) {
    await bucket.delete(keys.slice(i, i + 1000));
  }
  return keys.length;
}

/**
 * Uploads a file buffer/stream into R2 Bucket.
 */
export async function uploadR2File(
  bucket: any,
  file: File,
  options: StorageUploadOptions = {},
): Promise<StorageFile> {
  if (!bucket || typeof bucket.put !== "function") {
    throw new Error("R2 bucket binding is not available in runtime environment.");
  }

  const prefix = options.prefix ?? "media/";
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = options.key ?? `${prefix}${timestamp}-${randomSuffix}/${safeName}`;

  const arrayBuffer = await file.arrayBuffer();

  const r2Object = await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type || guessMimeType(safeName),
      contentDisposition: `inline; filename="${safeName}"`,
    },
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  let url = "";
  if (options.publicUrl) {
    const baseUrl = options.publicUrl.endsWith("/")
      ? options.publicUrl.slice(0, -1)
      : options.publicUrl;
    url = `${baseUrl}/${encodeKey(key)}`;
  } else if (options.apiBasePath) {
    const baseApi = options.apiBasePath.endsWith("/")
      ? options.apiBasePath.slice(0, -1)
      : options.apiBasePath;
    url = `${baseApi}/${encodeKey(key)}`;
  } else {
    url = `/cms/api/media/${encodeKey(key)}`;
  }

  return {
    key,
    name: safeName,
    size: file.size,
    mimeType: file.type || guessMimeType(safeName),
    uploadedAt: new Date().toISOString(),
    url,
    etag: r2Object?.etag,
  };
}

/**
 * Deletes a file from R2 Bucket by key.
 */
export async function deleteR2File(bucket: any, key: string): Promise<boolean> {
  if (!bucket || typeof bucket.delete !== "function") {
    throw new Error("R2 bucket binding is not available in runtime environment.");
  }
  await bucket.delete(key);
  return true;
}

/**
 * MIME type guesser fallback.
 */
function guessMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "pdf":
      return "application/pdf";
    case "json":
      return "application/json";
    case "txt":
      return "text/plain";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

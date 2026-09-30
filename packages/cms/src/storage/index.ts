export interface StorageFile {
  key: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  etag?: string;
  customMetadata?: Record<string, string>;
}

export interface StorageListResult {
  files: StorageFile[];
  truncated: boolean;
  cursor?: string;
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

  // 2. Global process.env fallback
  if (typeof process !== "undefined" && process.env && (process.env as any)[bindingName]) {
    return (process.env as any)[bindingName];
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

  const prefix = options.prefix ?? "media/";
  const limit = options.limit ?? 50;

  const result = await bucket.list({
    prefix,
    cursor: options.cursor,
    limit,
  });

  const files: StorageFile[] = (result.objects || []).map((obj: any) => {
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
      url = `${baseUrl}/${rawKey}`;
    } else if (options.apiBasePath) {
      const baseApi = options.apiBasePath.endsWith("/")
        ? options.apiBasePath.slice(0, -1)
        : options.apiBasePath;
      url = `${baseApi}/${rawKey}`;
    } else {
      url = `/cms/api/media/${rawKey}`;
    }

    return {
      key: rawKey,
      name: cleanedName,
      size: obj.size,
      mimeType,
      uploadedAt: obj.uploaded ? new Date(obj.uploaded).toISOString() : new Date().toISOString(),
      url,
      etag: obj.etag,
      customMetadata: obj.customMetadata,
    };
  });

  return {
    files,
    truncated: result.truncated,
    cursor: result.cursor,
  };
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
    url = `${baseUrl}/${key}`;
  } else if (options.apiBasePath) {
    const baseApi = options.apiBasePath.endsWith("/")
      ? options.apiBasePath.slice(0, -1)
      : options.apiBasePath;
    url = `${baseApi}/${key}`;
  } else {
    url = `/cms/api/media/${key}`;
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

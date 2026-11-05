import type { Entry, EntrySummary } from "../services/entries";
import type { ResolvedCollection } from "../core/collections/types";
import type { PageTemplate } from "../core/types/templates";
import type { TaxonomyTerm } from "../core/types/taxonomies";
import type { Taxonomy } from "../services/taxonomies";
import type { TaxonomyPreset } from "../core/taxonomies/presets";
import type { CmsActor } from "../services/context";
import type { LockState } from "../services/entries";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

/** Thin typed client for the admin API (`/api/cms`). */
export interface MediaFolderRecord {
  id: string;
  parentId: string | null;
  name: string;
}

/** A library file as the API returns it. `alt` and `caption` are per-locale maps. */
export interface MediaAssetRecord {
  id: string;
  storageKey: string;
  filename: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: Record<string, string> | null;
  caption: Record<string, string> | null;
  focalX: number | null;
  focalY: number | null;
  folderId: string | null;
  url: string;
  previewUrl?: string | undefined;
  createdAt: string;
  updatedAt: string | null;
}

export interface MediaAssetPatch {
  width?: number;
  height?: number;
  filename?: string;
  alt?: Record<string, string> | null;
  caption?: Record<string, string> | null;
  focalX?: number | null;
  focalY?: number | null;
  folderId?: string | null;
}

export interface MediaUsageRecord {
  pageId: string;
  slug: string;
  title: Record<string, string>;
  type: string;
  status: "published" | "draft";
}

export interface MediaListData {
  assets: MediaAssetRecord[];
  folders: MediaFolderRecord[];
  nextCursor: string | null;
}

interface MediaUploadStart {
  uploadId: string;
  key: string;
  id: string;
  partSize: number;
  partCount: number;
}

interface MediaUploadPart {
  partNumber: number;
  etag: string;
}

interface MediaPartResponse {
  success: boolean;
  data?: { part: MediaUploadPart };
  error?: string;
}

const MEDIA_UPLOAD_CONCURRENCY = 3;
const MEDIA_PART_ATTEMPTS = 3;
const MEDIA_PART_TIMEOUT_MS = 10 * 60 * 1000;

/** PUTs one part as the raw body. XHR (not fetch) so byte-level upload progress is reported. */
function putPart(
  url: string,
  blob: Blob,
  onBytes: (bytes: number) => void,
): Promise<MediaUploadPart> {
  const { promise, resolve, reject } = Promise.withResolvers<MediaUploadPart>();
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", url);
  xhr.timeout = MEDIA_PART_TIMEOUT_MS;
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) onBytes(event.loaded);
  };
  xhr.onload = () => {
    let data: MediaPartResponse | null = null;
    try {
      data = JSON.parse(xhr.responseText) as MediaPartResponse;
    } catch {
      // Non-JSON body (e.g. a proxy error page); the status code is reported instead.
    }
    if (xhr.status >= 200 && xhr.status < 300 && data?.success && data.data)
      resolve(data.data.part);
    else reject(new ApiError(xhr.status, data?.error ?? `Part upload failed (HTTP ${xhr.status})`));
  };
  xhr.onerror = () => reject(new ApiError(0, "Network error while uploading"));
  xhr.ontimeout = () => reject(new ApiError(0, "Upload timed out"));
  xhr.send(blob);
  return promise;
}

export function createApi(base = "/api/cms") {
  const call = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${base}${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!(res.headers.get("content-type") ?? "").includes("application/json")) {
      throw new ApiError(
        res.status,
        `${method} ${base}${path} returned ${res.status} ${res.headers.get("content-type") ?? "no content-type"} instead of JSON — is the cms() middleware mounted?`,
      );
    }
    const data = (await res.json()) as any;
    if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText, data?.details);
    return data as T;
  };
  const qs = (params: Record<string, unknown>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(params))
      if (v !== undefined && v !== "" && v !== null) {
        if (typeof v === "object") s.set(k, JSON.stringify(v));
        else if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
          s.set(k, v.toString());
        else s.set(k, typeof v === "string" ? v : JSON.stringify(v));
      }
    const str = s.toString();
    return str ? `?${str}` : "";
  };

  /**
   * Uploads through the chunked media routes: the file goes out in `partSize` pieces, each request
   * under the Cloudflare body limit. `onProgress` receives the fraction of bytes sent (0–1).
   */
  const multipartUpload = async <T>(
    file: File,
    start: { replaceId?: string },
    finish: Record<string, unknown>,
    onProgress?: (fraction: number) => void,
  ): Promise<T> => {
    if (file.size === 0) throw new ApiError(400, `${file.name} is empty`);
    const started = await call<{ success: boolean; data: MediaUploadStart }>(
      "POST",
      "/media/uploads",
      { filename: file.name, mimeType: file.type, size: file.size, ...start },
    );
    const { uploadId, key, id, partSize, partCount } = started.data;
    const sent = Array.from({ length: partCount }, () => 0);
    const reportProgress = () =>
      onProgress?.(sent.reduce((total, bytes) => total + bytes, 0) / file.size);
    const parts: MediaUploadPart[] = [];
    let nextPart = 0;
    const worker = async () => {
      while (nextPart < partCount) {
        const index = nextPart;
        nextPart += 1;
        const blob = file.slice(index * partSize, (index + 1) * partSize);
        const url = `${base}/media/uploads/${uploadId}/parts/${index + 1}?key=${encodeURIComponent(key)}`;
        parts[index] = await sendPartWithRetry(url, blob, (bytes) => {
          sent[index] = bytes;
          reportProgress();
        });
        sent[index] = blob.size;
        reportProgress();
      }
    };
    try {
      await Promise.all(
        Array.from({ length: Math.min(MEDIA_UPLOAD_CONCURRENCY, partCount) }, worker),
      );
      return await call<T>("POST", `/media/uploads/${uploadId}/complete`, {
        ...finish,
        key,
        id,
        size: file.size,
        mimeType: file.type,
        filename: file.name,
        replace: start.replaceId !== undefined,
        parts,
      });
    } catch (err) {
      // Discard the stored parts so an abandoned upload doesn't leave data behind in R2.
      void fetch(`${base}/media/uploads/${uploadId}?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        credentials: "same-origin",
      }).catch(() => {});
      throw err;
    }
  };
  const sendPartWithRetry = async (url: string, blob: Blob, onBytes: (bytes: number) => void) => {
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await putPart(url, blob, onBytes);
      } catch (err) {
        // Network errors and 5xx are retried; 4xx (rejected by the server) fail immediately.
        const retryable = !(err instanceof ApiError) || err.status === 0 || err.status >= 500;
        if (!retryable || attempt >= MEDIA_PART_ATTEMPTS) throw err;
        onBytes(0);
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }
  };

  return {
    me: () => call<{ user: CmsActor }>("GET", "/me"),
    stats: () =>
      call<{
        totalEntries: number;
        byCollection: Record<string, Record<string, number>>;
        pendingReviews: number;
        scheduled: number;
      }>("GET", "/stats"),

    mentions: {
      /** Titles of mentioned entries in `locale`, keyed by entry id. */
      titles: (ids: string[], locale: string) =>
        call<{ titles: Record<string, string> }>(
          "GET",
          `/mentions${qs({ ids: ids.join(","), locale })}`,
        ),
    },

    collections: {
      list: () => call<{ collections: ResolvedCollection[] }>("GET", "/collections"),
      get: (slug: string) =>
        call<{ collection: ResolvedCollection }>("GET", `/collections/${slug}`),
      create: (def: unknown) =>
        call<{ collection: ResolvedCollection }>("POST", "/collections", def),
      createFromPreset: (preset: string) =>
        call<{ collection: ResolvedCollection }>("POST", "/collections/from-preset", { preset }),
      update: (slug: string, def: unknown) =>
        call<{ collection: ResolvedCollection }>("PUT", `/collections/${slug}`, def),
      remove: (slug: string) => call("DELETE", `/collections/${slug}`),
    },

    entries: {
      list: (p: {
        collection?: string;
        status?: string;
        q?: string;
        slugPrefix?: string;
        orderBy?: string;
        limit?: number;
        offset?: number;
        deleted?: boolean;
        content?: boolean;
        taxonomy?: string;
        term?: string;
      }) => call<{ entries: EntrySummary[]; total: number }>("GET", `/entries${qs(p)}`),
      get: (id: string) => call<{ entry: Entry; lock: LockState }>("GET", `/entries/${id}`),
      create: (input: unknown) => call<{ entry: Entry }>("POST", "/entries", input),
      updateMeta: (id: string, patch: unknown) =>
        call<{ entry: Entry }>("PATCH", `/entries/${id}`, patch),
      remove: (id: string) => call("DELETE", `/entries/${id}`),
      restore: (id: string) => call<{ entry: Entry }>("POST", `/entries/${id}/restore`),
      duplicate: (id: string) => call<{ entry: Entry }>("POST", `/entries/${id}/duplicate`),
      saveDraft: (id: string, content: unknown) =>
        call<{ entry: Entry }>("PUT", `/entries/${id}/draft`, content),
      discardDraft: (id: string) => call<{ entry: Entry }>("DELETE", `/entries/${id}/draft`),
      lock: (id: string, force = false) =>
        call<{ lock: LockState }>("POST", `/entries/${id}/lock`, { force }),
      unlock: (id: string) => call("DELETE", `/entries/${id}/lock`),
      publish: (id: string, body: { versionId?: string; changeSummary?: string } = {}) =>
        call<{ entry: Entry }>("POST", `/entries/${id}/publish`, body),
      unpublish: (id: string) => call<{ entry: Entry }>("POST", `/entries/${id}/unpublish`),
      schedule: (id: string, at: string | null) =>
        call<{ entry: Entry }>("POST", `/entries/${id}/schedule`, { at }),
      requestReview: (id: string, changeSummary?: string) =>
        call("POST", `/entries/${id}/review`, { changeSummary }),
      versions: (id: string) => call<{ versions: any[] }>("GET", `/entries/${id}/versions`),
      diff: (id: string, from?: string, to?: string) =>
        call<{ diff: any }>("GET", `/entries/${id}/diff${qs({ from, to })}`),
      previewToken: (id: string) =>
        call<{ token: string; expiresAt: number }>("POST", `/entries/${id}/preview-token`),
      terms: (id: string) => call<{ terms: TaxonomyTerm[] }>("GET", `/entries/${id}/terms`),
      setTerms: (id: string, taxonomy: string, termIds: string[]) =>
        call<{ terms: TaxonomyTerm[] }>("PUT", `/entries/${id}/terms/${taxonomy}`, { termIds }),
    },

    versions: {
      reviews: () => call<{ versions: any[] }>("GET", "/reviews"),
      get: (id: string) => call<{ version: any }>("GET", `/versions/${id}`),
      approve: (id: string) => call<{ version: any }>("POST", `/versions/${id}/approve`),
      reject: (id: string, reason?: string) =>
        call<{ version: any }>("POST", `/versions/${id}/reject`, { reason }),
      rollback: (id: string) => call<{ entry: Entry }>("POST", `/versions/${id}/rollback`),
      comments: (id: string) => call<{ comments: any[] }>("GET", `/versions/${id}/comments`),
      comment: (id: string, content: string, blockId?: string) =>
        call("POST", `/versions/${id}/comments`, { content, blockId }),
    },

    templates: {
      list: (collection?: string) =>
        call<{ templates: PageTemplate[] }>("GET", `/templates${qs({ collection })}`),
      get: (id: string) => call<{ template: PageTemplate }>("GET", `/templates/${id}`),
      create: (input: unknown) => call<{ template: PageTemplate }>("POST", "/templates", input),
      update: (id: string, input: unknown) =>
        call<{ template: PageTemplate }>("PUT", `/templates/${id}`, input),
      remove: (id: string) => call("DELETE", `/templates/${id}`),
    },

    taxonomies: {
      list: () => call<{ taxonomies: Taxonomy[] }>("GET", "/taxonomies"),
      presets: () => call<{ presets: TaxonomyPreset[] }>("GET", "/taxonomy-presets"),
      create: (def: unknown) => call<{ taxonomy: Taxonomy }>("POST", "/taxonomies", def),
      createFromPreset: (preset: string) =>
        call<{ taxonomy: Taxonomy }>("POST", "/taxonomies/from-preset", { preset }),
      update: (slug: string, def: unknown) =>
        call<{ taxonomy: Taxonomy }>("PUT", `/taxonomies/${slug}`, def),
      remove: (slug: string) => call("DELETE", `/taxonomies/${slug}`),
      terms: (taxonomy: string) =>
        call<{ terms: TaxonomyTerm[] }>("GET", `/taxonomies/${taxonomy}/terms`),
      createTerm: (taxonomy: string, input: unknown) =>
        call<{ term: TaxonomyTerm }>("POST", `/taxonomies/${taxonomy}/terms`, input),
      updateTerm: (taxonomy: string, id: string, input: unknown) =>
        call<{ term: TaxonomyTerm }>("PUT", `/taxonomies/${taxonomy}/terms/${id}`, input),
      deleteTerm: (taxonomy: string, id: string) =>
        call("DELETE", `/taxonomies/${taxonomy}/terms/${id}`),
    },

    bylines: {
      list: () => call<{ bylines: any[] }>("GET", "/bylines"),
      create: (input: unknown) => call<{ byline: any }>("POST", "/bylines", input),
      update: (id: string, input: unknown) => call<{ byline: any }>("PUT", `/bylines/${id}`, input),
      remove: (id: string) => call("DELETE", `/bylines/${id}`),
    },

    settings: {
      get: () => call<{ settings: any }>("GET", "/settings"),
      update: (input: unknown) => call<{ settings: any }>("PUT", "/settings", input),
    },

    search: (q: string, collection?: string) =>
      call<{ results: any[] }>("GET", `/search${qs({ q, collection })}`),
    reindex: () => call<{ indexed: number }>("POST", "/search/reindex"),

    media: {
      /** Folder contents. Pass `folderId` (null = top level), or `search`/`type` to search every folder. */
      list: (
        p: {
          folderId?: string | null;
          search?: string;
          type?: string;
          cursor?: string;
          limit?: number;
        } = {},
      ) => {
        const searching = Boolean(p.search?.trim()) || (p.type !== undefined && p.type !== "all");
        return call<{ success: boolean; data: MediaListData }>(
          "GET",
          `/media${qs({
            folder: searching ? undefined : (p.folderId ?? "root"),
            search: p.search,
            type: p.type,
            cursor: p.cursor,
            limit: p.limit,
          })}`,
        );
      },
      folders: () =>
        call<{ success: boolean; data: { folders: MediaFolderRecord[] } }>("GET", "/media/folders"),
      createFolder: (name: string, parentId: string | null = null) =>
        call<{ success: boolean; data: { folder: MediaFolderRecord } }>("POST", "/media/folders", {
          name,
          parentId,
        }),
      updateFolder: (id: string, patch: { name?: string; parentId?: string | null }) =>
        call<{ success: boolean }>("PATCH", `/media/folders/${id}`, patch),
      removeFolder: (id: string) => call<{ success: boolean }>("DELETE", `/media/folders/${id}`),
      upload: async (
        file: File,
        opts: {
          folderId?: string | null;
          alt?: Record<string, string>;
          width?: number;
          height?: number;
        } = {},
        onProgress?: (fraction: number) => void,
      ) => {
        const res = await multipartUpload<{ success: boolean; data: { file: MediaAssetRecord } }>(
          file,
          {},
          {
            folderId: opts.folderId ?? null,
            alt: opts.alt,
            width: opts.width,
            height: opts.height,
          },
          onProgress,
        );
        return res.data.file;
      },
      replace: async (
        id: string,
        file: File,
        opts: { width?: number; height?: number } = {},
        onProgress?: (fraction: number) => void,
      ) => {
        const res = await multipartUpload<{ success: boolean; data: { file: MediaAssetRecord } }>(
          file,
          { replaceId: id },
          { width: opts.width, height: opts.height },
          onProgress,
        );
        return res.data.file;
      },
      update: (id: string, patch: MediaAssetPatch) =>
        call<{ success: boolean; data: { file: MediaAssetRecord } }>(
          "PATCH",
          `/media/${id}`,
          patch,
        ),
      remove: (id: string) => call<{ success: boolean }>("DELETE", `/media/${id}`),
      usage: (id: string) =>
        call<{ success: boolean; data: { usage: MediaUsageRecord[] } }>(
          "GET",
          `/media/${id}/usage`,
        ),
      sync: () => call<{ success: boolean; data: { imported: number } }>("POST", "/media/sync"),
    },
  };
}

export type CmsApi = ReturnType<typeof createApi>;

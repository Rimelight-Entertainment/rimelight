/**
 * Pure helpers for the Space media routes (CMS.6, decision 0049): file name sanitising, storage keys, the public file
 * path, alt text validation and the asset view. Kept apart from content-media.ts so the tests load without the Workers
 * runtime or the database module.
 *
 * Storage: the R2 binding BLOB holds `content/<uuid>/<sanitised filename>`. media_assets.storage_key is that key and is
 * never changed, so the public URL `/v1/content/media/file/<key>` stays the same when the alt text changes.
 */

export const MEDIA_MAX_BYTES = 50 * 1024 * 1024;
export const MEDIA_KEY_PREFIX = "content/";
export const MEDIA_FILE_ROUTE = "/content/media/file/";
const FILE_NAME_MAX = 180;
const FOLDER_MAX = 100;
const ALT_MAX = 500;

/**
 * A safe file name: the path is stripped, every character outside A-Z a-z 0-9 . _ - becomes `-`, runs of `-` collapse,
 * leading dots and dashes are removed, and the name is cut to 180 characters (the extension kept). An empty result
 * becomes `file`.
 */
export function sanitizeMediaFileName(raw: string | undefined | null): string {
  const base = (raw ?? "").split(/[\\/]/).pop() ?? "";
  let name = Array.from(base)
    .map((ch) => (/^[A-Za-z0-9._-]$/.test(ch) ? ch : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^[.-]+/, "");
  if (Array.from(name).length > FILE_NAME_MAX) {
    const dot = name.lastIndexOf(".");
    const ext = dot > 0 && name.length - dot <= 16 ? name.slice(dot) : "";
    name = Array.from(name.slice(0, FILE_NAME_MAX - ext.length)).join("") + ext;
  }
  return name === "" ? "file" : name;
}

/** The storage key for an upload: `content/<uuid>/<sanitised filename>`. */
export function buildMediaStorageKey(id: string, filename: string): string {
  return `${MEDIA_KEY_PREFIX}${id}/${sanitizeMediaFileName(filename)}`;
}

/** The public URL path of a stored key. */
export function mediaFileUrl(storageKey: string): string {
  return `/v1${MEDIA_FILE_ROUTE}${storageKey}`;
}

/**
 * The storage key from a request path that contains `/content/media/file/<key>`, each segment URL-decoded. Null when
 * the path has no such part, a segment is malformed, or the key would leave the content/ prefix (no `..`, no empty
 * segments).
 */
export function mediaKeyFromPath(path: string): string | null {
  const i = path.indexOf(MEDIA_FILE_ROUTE);
  if (i < 0) return null;
  const segments = path
    .slice(i + MEDIA_FILE_ROUTE.length)
    .split("/")
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return null;
      }
    });
  if (segments.some((s) => s === null || s === "" || s === "." || s === "..")) return null;
  const key = (segments as string[]).join("/");
  if (!key.startsWith(MEDIA_KEY_PREFIX) || key.includes("\\")) return null;
  return key;
}

/** The folder a request names: trimmed, up to 100 characters; empty or missing is the root (null). Null on a bad value. */
export function mediaFolderValue(
  raw: unknown,
): { ok: true; folder: string | null } | { ok: false; message: string } {
  if (raw === undefined || raw === null) return { ok: true, folder: null };
  if (typeof raw !== "string") return { ok: false, message: "folder is a folder id." };
  const t = raw.trim();
  if (t === "") return { ok: true, folder: null };
  if (Array.from(t).length > FOLDER_MAX)
    return { ok: false, message: "folder is up to 100 characters." };
  return { ok: true, folder: t };
}

/**
 * Localized alt text. A plain string is stored under `en`; an object maps locale to text; null or "" clears it. Returns
 * null for a bad value (the route answers 400).
 */
export function parseMediaAlt(
  raw: unknown,
): { ok: true; alt: Record<string, string> | null } | { ok: false; message: string } {
  const bad = { ok: false as const, message: "alt is text of up to 500 characters, or null." };
  if (raw === null) return { ok: true, alt: null };
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t === "") return { ok: true, alt: null };
    if (Array.from(t).length > ALT_MAX) return bad;
    return { ok: true, alt: { en: t } };
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return bad;
  const out: Record<string, string> = {};
  for (const [locale, text] of Object.entries(raw)) {
    if (typeof text !== "string") return bad;
    const t = text.trim();
    if (Array.from(t).length > ALT_MAX) return bad;
    if (t !== "") out[locale] = t;
  }
  return { ok: true, alt: Object.keys(out).length > 0 ? out : null };
}

/** The upload size check: at most 50 MB. */
export function mediaSizeOk(size: number): boolean {
  return Number.isFinite(size) && size >= 0 && size <= MEDIA_MAX_BYTES;
}

/** A media_assets row as the routes return it. */
export type MediaRow = {
  id: string;
  storage_key: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: unknown;
  created_at: string | Date;
};

export function mediaAssetView(r: MediaRow) {
  return {
    id: r.id,
    key: r.storage_key,
    url: mediaFileUrl(r.storage_key),
    alt: r.alt ?? null,
    width: r.width ?? null,
    height: r.height ?? null,
    mime: r.mime_type,
    size: r.size,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

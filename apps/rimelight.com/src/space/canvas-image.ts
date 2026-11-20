/**
 * Pure helpers for Rimelight Space canvases (CV.2, decision 0045): image type and size from the file bytes, SHA-256, R2 keys, quota arithmetic and the import URL check. No I/O, so it is unit tested.
 */

export const CANVAS_ASSET_MAX_BYTES = 50 * 1024 * 1024;
/** The largest video file: 500 MB (CV-V, decision 0046). */
export const CANVAS_VIDEO_MAX_BYTES = 500 * 1024 * 1024;
/**
 * The size of each part of a video upload (the last one may be smaller). Cloudflare caps a request body at 100 MB
 * on the Free plan, and R2 needs every part but the last to be the same size and at least 5 MB.
 */
export const VIDEO_PART_BYTES = 64 * 1024 * 1024;
/** The longest video a canvas accepts: 24 hours. */
export const MAX_VIDEO_MS = 24 * 60 * 60 * 1000;
/** Quota for a personal canvas: 1 GB. */
export const DEFAULT_USER_QUOTA_BYTES = 1024 * 1024 * 1024;
/** Quota for a project's canvases: 10 GB. */
export const DEFAULT_PROJECT_QUOTA_BYTES = 10 * 1024 * 1024 * 1024;
/** The largest width or height an image may have, in pixels. */
export const MAX_IMAGE_SIDE = 32768;
/** The thumbnail sizes, in pixels on the longest side. */
export const THUMB_SIZES = [256, 1024] as const;
/** One of the thumbnail sizes in THUMB_SIZES. */
export type ThumbSize = (typeof THUMB_SIZES)[number];

/** A media type the canvas accepts for an image. */
export type ImageMime = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

/** What inspectImage reads from the bytes of an image. */
export type ImageInfo = {
  mime: ImageMime;
  ext: "png" | "jpg" | "webp" | "gif";
  width: number;
  height: number;
  frameCount: number;
};

const MB = 1024 * 1024;
const GB = 1024 * MB;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_START = [0xff, 0xd8, 0xff];
/** JPEG markers that carry a frame header (start of frame) and so hold the image size. */
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);
const ADDRESS_REFUSAL = "That address cannot be fetched.";
/** Host name endings that point at a machine on a private network. */
const PRIVATE_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".lan"];

/** The byte at index i, or null when i is outside the array. */
function byteAt(b: Uint8Array, i: number): number | null {
  if (i < 0 || i >= b.length) return null;
  return b[i] ?? null;
}

/** An unsigned big-endian number of n bytes at index i, or null when a byte is outside the array. */
function readBE(b: Uint8Array, i: number, n: number): number | null {
  let value = 0;
  for (let k = 0; k < n; k += 1) {
    const byte = byteAt(b, i + k);
    if (byte === null) return null;
    value = value * 256 + byte;
  }
  return value;
}

/** An unsigned little-endian number of n bytes at index i, or null when a byte is outside the array. */
function readLE(b: Uint8Array, i: number, n: number): number | null {
  let value = 0;
  for (let k = n - 1; k >= 0; k -= 1) {
    const byte = byteAt(b, i + k);
    if (byte === null) return null;
    value = value * 256 + byte;
  }
  return value;
}

/** True when the bytes at index i are exactly the given values. */
function matchesAt(b: Uint8Array, i: number, expected: readonly number[]): boolean {
  if (i < 0 || i + expected.length > b.length) return false;
  return expected.every((value, k) => b[i + k] === value);
}

/** The character codes of an ASCII string. */
const ascii = (s: string): number[] => Array.from(s, (c) => c.charCodeAt(0));

/** PNG: the size is in the IHDR chunk right after the signature. */
function inspectPng(b: Uint8Array): ImageInfo | null {
  if (!matchesAt(b, 0, PNG_SIGNATURE)) return null;
  const width = readBE(b, 16, 4);
  const height = readBE(b, 20, 4);
  if (width === null || height === null) return null;
  return { mime: "image/png", ext: "png", width, height, frameCount: 1 };
}

/** JPEG: walks the marker segments until a start-of-frame marker holds the size. */
function inspectJpeg(b: Uint8Array): ImageInfo | null {
  if (!matchesAt(b, 0, JPEG_START)) return null;
  let p = 2;
  for (;;) {
    if (byteAt(b, p) !== 0xff) return null;
    let marker = byteAt(b, p + 1);
    // Skip fill bytes: a run of 0xFF before the real marker.
    while (marker === 0xff) {
      p += 1;
      marker = byteAt(b, p + 1);
    }
    if (marker === null) return null;
    // Markers with no length field: start of image, fill-free restart markers and TEM.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      p += 2;
      continue;
    }
    // End of image or start of scan: no size was found before the pixel data.
    if (marker === 0xd9 || marker === 0xda) return null;
    const length = readBE(b, p + 2, 2);
    if (length === null) return null;
    if (JPEG_SOF_MARKERS.has(marker)) {
      const height = readBE(b, p + 5, 2);
      const width = readBE(b, p + 7, 2);
      if (height === null || width === null) return null;
      return { mime: "image/jpeg", ext: "jpg", width, height, frameCount: 1 };
    }
    p += 2 + length;
  }
}

/** Skips a run of GIF data sub-blocks starting at index p, returning the index after the run. */
function skipSubBlocks(b: Uint8Array, p: number): number {
  let at = p;
  for (;;) {
    const size = byteAt(b, at);
    // Past the end of the bytes: stop here and let the caller see the position is beyond the end.
    if (size === null) return at;
    at += 1;
    if (size === 0) return at;
    at += size;
  }
}

/** GIF: the size is in the logical screen descriptor; each image descriptor is one frame. */
function inspectGif(b: Uint8Array): ImageInfo | null {
  if (!matchesAt(b, 0, ascii("GIF87a")) && !matchesAt(b, 0, ascii("GIF89a"))) return null;
  const width = readLE(b, 6, 2);
  const height = readLE(b, 8, 2);
  const flags = byteAt(b, 10);
  if (width === null || height === null || flags === null) return null;

  let p = 13;
  if (flags & 0x80) p += 3 * (1 << ((flags & 7) + 1));

  let frames = 0;
  while (p < b.length) {
    const block = byteAt(b, p);
    if (block === 0x3b) break;
    if (block === 0x21) {
      // Extension: introducer and label, then its sub-blocks.
      p = skipSubBlocks(b, p + 2);
    } else if (block === 0x2c) {
      frames += 1;
      const local = byteAt(b, p + 9);
      if (local === null) break;
      p += 10;
      if (local & 0x80) p += 3 * (1 << ((local & 7) + 1));
      // The LZW minimum code size byte, then the image data sub-blocks.
      p = skipSubBlocks(b, p + 1);
    } else {
      break;
    }
  }
  return { mime: "image/gif", ext: "gif", width, height, frameCount: Math.max(1, frames) };
}

/** WebP: simple lossy, lossless and extended (VP8X) files, counting ANMF chunks for animations. */
function inspectWebp(b: Uint8Array): ImageInfo | null {
  if (!matchesAt(b, 0, ascii("RIFF")) || !matchesAt(b, 8, ascii("WEBP"))) return null;

  if (matchesAt(b, 12, ascii("VP8 "))) {
    const width = readLE(b, 26, 2);
    const height = readLE(b, 28, 2);
    if (width === null || height === null) return null;
    return {
      mime: "image/webp",
      ext: "webp",
      width: width & 0x3fff,
      height: height & 0x3fff,
      frameCount: 1,
    };
  }

  if (matchesAt(b, 12, ascii("VP8L"))) {
    const b0 = byteAt(b, 21);
    const b1 = byteAt(b, 22);
    const b2 = byteAt(b, 23);
    const b3 = byteAt(b, 24);
    if (b0 === null || b1 === null || b2 === null || b3 === null) return null;
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { mime: "image/webp", ext: "webp", width, height, frameCount: 1 };
  }

  if (matchesAt(b, 12, ascii("VP8X"))) {
    const width0 = readLE(b, 24, 3);
    const height0 = readLE(b, 27, 3);
    const flags = byteAt(b, 20);
    if (width0 === null || height0 === null || flags === null) return null;
    const width = 1 + width0;
    const height = 1 + height0;
    let frames = 0;
    if (flags & 0x02) {
      const anmf = ascii("ANMF");
      let p = 12;
      while (p + 8 <= b.length) {
        if (matchesAt(b, p, anmf)) frames += 1;
        const size = readLE(b, p + 4, 4);
        if (size === null) break;
        p += 8 + size + (size % 2);
      }
    }
    return { mime: "image/webp", ext: "webp", width, height, frameCount: Math.max(1, frames) };
  }

  return null;
}

/** Type, size and frame count read from the bytes; null when the bytes are not a supported image or a side is 0 or above MAX_IMAGE_SIDE. */
export function inspectImage(bytes: Uint8Array): ImageInfo | null {
  const info = inspectPng(bytes) ?? inspectJpeg(bytes) ?? inspectGif(bytes) ?? inspectWebp(bytes);
  if (!info) return null;
  if (info.width < 1 || info.height < 1) return null;
  if (info.width > MAX_IMAGE_SIDE || info.height > MAX_IMAGE_SIDE) return null;
  return info;
}

/** Lower-case hex SHA-256 of the bytes. */
export async function sha256Hex(bytes: Uint8Array | ArrayBuffer): Promise<string> {
  // A copy of a typed array gives an ArrayBuffer-backed view, which crypto.subtle accepts in every TypeScript lib version.
  const input = bytes instanceof Uint8Array ? new Uint8Array(bytes) : bytes;
  const digest = await crypto.subtle.digest("SHA-256", input);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** space/canvases/{canvasId}/assets/{sha256}.{ext} */
export function assetObjectKey(canvasId: string, sha256: string, ext: string): string {
  return `space/canvases/${canvasId}/assets/${sha256}.${ext}`;
}

/** space/canvases/{canvasId}/thumbs/{sha256}-{px}.webp */
export function thumbObjectKey(canvasId: string, sha256: string, px: ThumbSize): string {
  return `space/canvases/${canvasId}/thumbs/${sha256}-${px}.webp`;
}

/** "256" or "1024" as a ThumbSize, else null. */
export function parseThumbSize(raw: string): ThumbSize | null {
  for (const size of THUMB_SIZES) {
    if (raw === String(size)) return size;
  }
  return null;
}

/** A byte count in MB with one decimal place. */
const mbText = (bytes: number): string => `${(bytes / MB).toFixed(1)} MB`;
/** A byte count in GB with one decimal place. */
const gbText = (bytes: number): string => `${(bytes / GB).toFixed(1)} GB`;

/** null when `adding` bytes fit under `limit` with `usage` already used, else a message such as "This upload needs 12.0 MB but only 3.5 MB of the 1.0 GB quota is left." (MB = bytes / 1048576 with one decimal; GB = bytes / 1073741824 with one decimal). */
export function quotaRefusal(usage: number, limit: number, adding: number): string | null {
  if (usage + adding <= limit) return null;
  const left = Math.max(0, limit - usage);
  return `This upload needs ${mbText(adding)} but only ${mbText(left)} of the ${gbText(limit)} quota is left.`;
}

/** True when an IPv4 literal sits in a range that is never a public address. */
function isPrivateIPv4(host: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return false;
  const octets = match.slice(1).map(Number);
  if (octets.some((n) => n > 255)) return false;
  const a = octets[0] ?? -1;
  const b = octets[1] ?? -1;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10
  if (a === 127) return true; // 127.0.0.0/8
  if (a === 169 && b === 254) return true; // 169.254.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  return false;
}

/** Checks a URL the server may fetch an image from. */
export function checkImportUrl(
  raw: string,
): { ok: true; url: URL } | { ok: false; message: string } {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, message: "That is not a valid link." };
  }
  if (url.protocol !== "https:") {
    return { ok: false, message: "Only https links can be imported." };
  }
  if (url.username !== "" || url.password !== "") {
    return { ok: false, message: "Links with a username or password cannot be imported." };
  }
  if (url.port !== "" && url.port !== "443") {
    return { ok: false, message: ADDRESS_REFUSAL };
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || PRIVATE_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return { ok: false, message: ADDRESS_REFUSAL };
  }
  if (host.startsWith("[")) {
    return { ok: false, message: ADDRESS_REFUSAL };
  }
  if (isPrivateIPv4(host)) {
    return { ok: false, message: ADDRESS_REFUSAL };
  }
  return { ok: true, url };
}

/* ---------- video (CV-V, decision 0046) ---------- */

/** A media type the canvas accepts for a video. */
export type VideoMime = "video/mp4" | "video/quicktime" | "video/webm" | "video/x-matroska";

/** The container a video's first bytes show. */
export type VideoInfo = { mime: VideoMime; ext: "mp4" | "mov" | "webm" | "mkv" };

/** ISO BMFF brands that are still images (HEIF, AVIF), not video. */
const IMAGE_BRANDS = new Set(["heic", "heix", "heim", "heis", "mif1", "msf1", "avif", "avis"]);

/**
 * The video container from the file's first bytes (a few hundred are enough), or null. MP4 and MOV start with an
 * ISO BMFF `ftyp` box (brand "qt  " is MOV); WebM and Matroska start with an EBML header whose DocType is "webm"
 * or "matroska".
 */
export function inspectVideo(b: Uint8Array): VideoInfo | null {
  if (matchesAt(b, 4, ascii("ftyp"))) {
    const brand = String.fromCharCode(...b.slice(8, 12));
    if (brand.length < 4 || IMAGE_BRANDS.has(brand)) return null;
    return brand === "qt  "
      ? { mime: "video/quicktime", ext: "mov" }
      : { mime: "video/mp4", ext: "mp4" };
  }
  if (matchesAt(b, 0, [0x1a, 0x45, 0xdf, 0xa3])) {
    // The DocType element (ID 0x4282) sits in the EBML header; its size is one VINT byte for these short names.
    const head = b.slice(0, Math.min(b.length, 64));
    for (let i = 4; i + 3 < head.length; i += 1) {
      if (head[i] !== 0x42 || head[i + 1] !== 0x82) continue;
      const size = (head[i + 2] ?? 0) & 0x7f;
      const name = String.fromCharCode(...head.slice(i + 3, i + 3 + size));
      if (name === "webm") return { mime: "video/webm", ext: "webm" };
      if (name === "matroska") return { mime: "video/x-matroska", ext: "mkv" };
      return null;
    }
  }
  return null;
}

/** The file extension of a video media type, or null when the type is not a video the canvas accepts. */
export function videoExt(mime: string): VideoInfo["ext"] | null {
  switch (mime) {
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    case "video/x-matroska":
      return "mkv";
    default:
      return null;
  }
}

/** How many parts a video of `bytes` is uploaded in (each VIDEO_PART_BYTES, the last one smaller). */
export function videoPartCount(bytes: number): number {
  return Math.max(1, Math.ceil(bytes / VIDEO_PART_BYTES));
}

/** What the client says about a video it uploads; it reads these with FFmpeg, the Worker cannot decode video. */
export type VideoMeta = {
  sha256: string;
  mime: VideoMime;
  bytes: number;
  fileName: string;
  width: number;
  height: number;
  durationMs: number;
  hasAudio: boolean;
};

/** The video metadata of a request body, or a message saying what is wrong. */
export function parseVideoMeta(
  body: Record<string, unknown>,
): { ok: true; meta: VideoMeta } | { ok: false; message: string } {
  const sha = body["sha256"];
  if (typeof sha !== "string" || !/^[0-9a-f]{64}$/.test(sha)) {
    return { ok: false, message: "sha256 is the file's SHA-256 in lower-case hex." };
  }
  const mime = body["mime"];
  if (typeof mime !== "string" || videoExt(mime) === null) {
    return {
      ok: false,
      message: "mime is video/mp4, video/quicktime, video/webm or video/x-matroska.",
    };
  }
  const bytes = body["bytes"];
  if (typeof bytes !== "number" || !Number.isSafeInteger(bytes) || bytes < 1) {
    return { ok: false, message: "bytes is the file size." };
  }
  const dims = [body["width"], body["height"]];
  if (
    dims.some((d) => typeof d !== "number" || !Number.isInteger(d) || d < 1 || d > MAX_IMAGE_SIDE)
  ) {
    return { ok: false, message: `width and height are whole pixels from 1 to ${MAX_IMAGE_SIDE}.` };
  }
  const duration = body["duration_ms"];
  if (
    typeof duration !== "number" ||
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > MAX_VIDEO_MS
  ) {
    return { ok: false, message: "duration_ms is the length in milliseconds, at most 24 hours." };
  }
  const hasAudio = body["has_audio"];
  if (typeof hasAudio !== "boolean") return { ok: false, message: "has_audio is true or false." };
  const fileName = typeof body["file_name"] === "string" ? body["file_name"] : "";
  return {
    ok: true,
    meta: {
      sha256: sha,
      mime: mime as VideoMime,
      bytes,
      fileName,
      width: dims[0] as number,
      height: dims[1] as number,
      durationMs: duration,
      hasAudio,
    },
  };
}

/** One byte range of a file: `length` bytes from `offset`. */
export type ByteRange = { offset: number; length: number };

/**
 * The single byte range a `Range` header asks for in a file of `total` bytes: "bytes=a-b", "bytes=a-" or
 * "bytes=-n". null means no range (send the whole file: no header, another unit, or several ranges);
 * "unsatisfiable" means a 416 answer.
 */
export function parseRange(
  header: string | undefined,
  total: number,
): ByteRange | "unsatisfiable" | null {
  if (header === undefined) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (m === null) return null;
  const [, a = "", b = ""] = m;
  if (a === "" && b === "") return null;
  if (a === "") {
    const n = Number(b);
    if (n === 0) return "unsatisfiable";
    const length = Math.min(n, total);
    return { offset: total - length, length };
  }
  const start = Number(a);
  if (start >= total) return "unsatisfiable";
  const end = b === "" ? total - 1 : Math.min(Number(b), total - 1);
  if (end < start) return "unsatisfiable";
  return { offset: start, length: end - start + 1 };
}

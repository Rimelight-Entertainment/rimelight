/** Pure helpers for the Space desktop release route (releases.ts), kept apart so tests can import them without the Worker runtime. */

const MAX_NAME_LEN = 160;

/** A plain file name: letters, digits, `.`, `-`, `_`; no leading dot, no `..`. */
export function validReleaseName(name: string): boolean {
  return (
    name.length > 0 &&
    name.length <= MAX_NAME_LEN &&
    !name.startsWith(".") &&
    !name.includes("..") &&
    /^[A-Za-z0-9._-]+$/.test(name)
  );
}

/**
 * Media type and cache rule by file name. Package files never change once published, so they cache for a year; the feed,
 * the installers (whose names stay the same from release to release) and the minimum version do not.
 */
export function releaseHeaders(name: string): { contentType: string; cacheControl: string } {
  if (name.endsWith(".nupkg")) {
    return {
      contentType: "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable",
    };
  }
  if (name.endsWith(".exe")) {
    return {
      contentType: "application/vnd.microsoft.portable-executable",
      cacheControl: "public, max-age=300",
    };
  }
  if (name.endsWith(".zip")) {
    return { contentType: "application/zip", cacheControl: "public, max-age=300" };
  }
  if (name.endsWith(".json")) {
    return { contentType: "application/json", cacheControl: "public, max-age=30" };
  }
  return { contentType: "text/plain; charset=utf-8", cacheControl: "public, max-age=30" };
}

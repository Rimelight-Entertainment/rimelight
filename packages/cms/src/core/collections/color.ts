/**
 * Every collection (entity type) has a colour, so a mention of a Weapon page always looks like
 * a Weapon. Set `color` on the collection to choose it; otherwise one is derived from the slug,
 * so it is stable across renders, servers and sessions without any configuration.
 */

/** Distinct, mid-lightness hues that read on both light and dark backgrounds. */
export const COLLECTION_PALETTE = [
  "#e5484d", // red
  "#f76b15", // orange
  "#ffb224", // amber
  "#46a758", // green
  "#12a594", // teal
  "#0090ff", // blue
  "#3e63dd", // indigo
  "#8e4ec6", // violet
  "#d6409f", // pink
  "#a18072", // bronze
  "#00a2c7", // cyan
  "#978365", // gold
] as const;

/** Small, stable string hash (FNV-1a). */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The colour for a collection: its explicit `color`, or a palette colour derived from the slug. */
export function collectionColor(slug: string, explicit?: string | null): string {
  if (explicit) return explicit;
  return COLLECTION_PALETTE[hash(slug || "page") % COLLECTION_PALETTE.length]!;
}

/** Public path of an entry from a collection's `features.routable` pattern. */
export function entryUrl(
  pattern: string | boolean | undefined,
  entry: { slug: string; collection: string },
): string {
  if (typeof pattern !== "string") return `/${entry.collection}/${entry.slug}`;
  return pattern.replace("{slug}", entry.slug).replace("{collection}", entry.collection);
}

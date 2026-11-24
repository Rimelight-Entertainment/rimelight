/**
 * Pure helpers for GET /v1/content/mentions (CMS.6, decision 0049): the query and limit, the LIKE pattern, and the
 * pick of the pages the caller may view. Kept apart from content-pages.ts so the tests load without the database.
 */

export const MENTION_DEFAULT_LIMIT = 10;
export const MENTION_MAX_LIMIT = 25;
/** How many matching pages are read before the viewable ones are picked. */
export const MENTION_SCAN_LIMIT = 200;
const QUERY_MAX = 100;

/**
 * The search text: trimmed, runs of whitespace collapsed to one space, at most 100 characters. Empty when nothing
 * is left (an empty search returns no mentions).
 */
export function normaliseMentionQuery(raw: string | undefined | null): string {
  if (typeof raw !== "string") return "";
  const collapsed = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  return Array.from(collapsed).slice(0, QUERY_MAX).join("").trim();
}

/**
 * The limit: an integer from 1 to 25. Missing or not a number gives the default (10); a number above 25 gives 25,
 * and one below 1 gives 1.
 */
export function mentionLimit(raw: string | undefined | null): number {
  if (raw === undefined || raw === null || raw.trim() === "") return MENTION_DEFAULT_LIMIT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return MENTION_DEFAULT_LIMIT;
  return Math.min(MENTION_MAX_LIMIT, Math.max(1, Math.floor(n)));
}

/** Escapes LIKE wildcards and the escape character, so the search text matches literally. */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** The ILIKE pattern for a normalised query: the text anywhere, literally. */
export function mentionPattern(query: string): string {
  return `%${escapeLike(query)}%`;
}

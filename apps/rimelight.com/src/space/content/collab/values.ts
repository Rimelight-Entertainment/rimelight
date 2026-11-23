// Value predicates and constants shared by the collab modules (MAPPING sections 2 and 3).
// Mirrors `crates/rimelight_content/src/richtext.rs`.

/** The character stored for an inline icon (one object replacement character). */
export const ICON_CHAR = "￼";

/** Marks in canonical order (the order of the normal form and of exported `marks`). */
export const CANON_MARKS = ["bold", "italic", "underline", "strikethrough", "code"] as const;

/** Marks that grow into text inserted after them. Every inserted text range sets them explicitly. */
export const EXPAND_AFTER_MARKS = ["bold", "italic", "underline", "strikethrough"] as const;

const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

/** Whether `s` is a locale code: `en`, or `pt-BR`. */
export function isLocaleCode(s: string): boolean {
  return LOCALE_RE.test(s);
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * A localized value: a non-empty object (not an array) whose keys are all locale codes.
 * An empty object is not localized.
 */
export function localizedMap(value: unknown): Record<string, any> | undefined {
  if (!isPlainObject(value)) return undefined;
  const keys = Object.keys(value);
  if (keys.length === 0) return undefined;
  return keys.every(isLocaleCode) ? value : undefined;
}

function isKnownNode(node: unknown): boolean {
  if (!isPlainObject(node)) return false;
  return ["text", "link", "mention", "emoji", "icon"].includes(node["type"]);
}

/** Whether `value` is an array whose every node has a known inline type. */
export function isRichNodes(value: unknown): boolean {
  return Array.isArray(value) && value.every(isKnownNode);
}

/**
 * Whether a rich-text prop value can be stored as rich text: a valid node array, or a localized map of them.
 * Anything else is stored as plain JSON (lossless fallback).
 */
export function isRich(value: unknown): boolean {
  if (Array.isArray(value)) return isRichNodes(value);
  const locales = localizedMap(value);
  return locales !== undefined && Object.values(locales).every(isRichNodes);
}

/**
 * Whether a plain-text prop value can be stored as plain text: a string, or a localized map of strings.
 */
export function isPlain(value: unknown): boolean {
  if (typeof value === "string") return true;
  const locales = localizedMap(value);
  return locales !== undefined && Object.values(locales).every((v) => typeof v === "string");
}

/** Structural equality of JSON-like values. Two `undefined` values are equal. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a).filter((k) => a[k] !== undefined);
    const keysB = Object.keys(b).filter((k) => b[k] !== undefined);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

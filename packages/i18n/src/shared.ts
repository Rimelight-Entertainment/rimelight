// Shared by the browser runtime and Node (plugin, CLI, lint). No Node imports here.

/** The one key that would reach `Object.prototype` when assigned into a plain object. Skipped when walking translations. */
export const UNSAFE_KEYS = new Set(["__proto__"]);

/** Default directory holding the `<locale>.json` files. */
export const DEFAULT_DIR = "src/i18n";

/**
 * Default output of the generated typed-keys declaration. Deliberately outside the locale directory,
 * so generated files never sit next to translations. Consumers add it to their tsconfig `include`.
 */
export const DEFAULT_TYPES = "node_modules/.rimelight/types/i18n.d.ts";

/**
 * Id of one translation chunk: a bucket in a locale, or that locale's fallback values for the bucket.
 * The plugin and the runtime both build ids here, so they can't drift apart.
 */
export const chunkId = (bucket: string, locale: string, fallback: boolean): string =>
  fallback ? `${bucket}/${locale}/fallback` : `${bucket}/${locale}`;

/** Matches `{name}` and `{ name }`. The runtime substitutes with it; everything else reads names from it. */
export const PLACEHOLDER = /\{\s*(\w+)\s*}/g;

const collect = (value: unknown, names: string[]): string[] => {
  if (typeof value === "string") {
    for (const match of value.matchAll(PLACEHOLDER)) names.push(match[1]!);
  } else if (Array.isArray(value)) {
    for (const item of value) collect(item, names);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collect(item, names);
  }
  return names;
};

/** Unique placeholder names in a translation value, searched through arrays and nested objects. */
export const placeholderNames = (value: unknown): string[] => [...new Set(collect(value, []))];

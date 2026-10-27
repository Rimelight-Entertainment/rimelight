/** The one key that would reach `Object.prototype` when assigned into a plain object. Skipped when walking translations. */
export const UNSAFE_KEYS = new Set(["__proto__"]);

/** Default directory holding the `<locale>.json` files. */
export const DEFAULT_DIR = "src/i18n";

/**
 * Default output of the generated typed-keys declaration. Deliberately outside the locale directory,
 * so generated files never sit next to translations. Consumers add it to their tsconfig `include`.
 */
export const DEFAULT_TYPES = "node_modules/.rimelight/types/i18n.d.ts";

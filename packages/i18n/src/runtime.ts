/** Public shape of the `t` translator: a callable plus its `.raw` and `.array` helpers. */
export interface TFunction {
  (key: string, params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
}

/**
 * Supported locale codes (e.g. `["en", "pt"]`). Populated from the Vite plugin's
 * `virtual:rimelight-i18n-config` module when bundled inside a Rimelight app, otherwise it
 * defaults to `["en"]` (tests, plain Node, or apps without the plugin).
 */
export let locales: string[] = ["en"];
/**
 * The default/fallback locale code (e.g. 'en').
 */
export let defaultLocale: string = "en";
/**
 * Whether the default locale is prefixed in URLs.
 *
 * - `true` (default): all locales are prefixed — `/en/about`, `/pt/about`
 * - `false`: the default locale has no prefix — `/about`, `/pt/about`
 */
export let prefixDefaultLocale: boolean = true;

/**
 * The current locale code, mutable from outside (middleware sets it per request, layouts set it
 * from route params) and read by `t`, `getLocale`, and friends.
 */
let locale = "";
export const currentLocale = {
  get: (): string => locale,
  set: (value: string): void => {
    locale = value;
  },
};

let translations: Record<string, Record<string, any>> = {};

function isObjectRecord(obj: unknown): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null;
}

export interface InitializeI18nOptions {
  /**
   * The default locale code (e.g. 'en').
   */
  defaultLocale: string;
  /**
   * Pre-loaded translations keyed by locale then component.
   */
  translations: Record<string, Record<string, any>>;
}

/**
 * Initializes the i18n system. Must be called once before any other i18n functions are used (the
 * integration virtual module does this automatically). Also updates the active fallback locale.
 */
export function initializeI18n(options: InitializeI18nOptions): void {
  defaultLocale = options.defaultLocale;
  translations = { ...options.translations };

  if (!currentLocale.get()) {
    currentLocale.set(defaultLocale);
  }
}

/** Keys that must never be traversed while resolving dot paths (prototype pollution guard). */
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isMergeable(value: unknown): value is Record<string, any> {
  return isObjectRecord(value) && !Array.isArray(value);
}

/** Deep-merges `source` over `target` (KV wins per key), skipping unsafe keys and replacing arrays. */
function mergeDeep(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (UNSAFE_KEYS.has(key)) continue;
    merged[key] =
      isMergeable(value) && isMergeable(merged[key]) ? mergeDeep(merged[key], value) : value;
  }
  return merged;
}

/**
 * Layers KV-sourced translation overrides for `locale` over the bundled translations so `t()`
 * stays synchronous and KV-first. Called by the middleware before rendering; ignores anything
 * that is not an object, leaving the bundled translations untouched.
 */
export function applyLocaleOverrides(locale: string, overrides: unknown): void {
  if (!locale || !isMergeable(overrides)) return;
  translations[locale] = mergeDeep(translations[locale] ?? {}, overrides);
}

/**
 * Resolves a dot-notation path (including array indices) inside a translation object. When a
 * segment is missing, the remaining segments are joined and tried as a single literal key, so
 * translations whose own keys contain dots still resolve. Unsafe segments resolve to undefined.
 */
function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  if (Object.hasOwn(obj, path)) {
    return (obj as Record<string, unknown>)[path];
  }

  const segments = path.split(".");
  let current: any = obj;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    if (UNSAFE_KEYS.has(segment)) return undefined;
    if (current == null || typeof current !== "object") return undefined;

    if (Object.hasOwn(current, segment) || (Array.isArray(current) && segment in current)) {
      current = current[segment];
    } else {
      const literalKey = segments.slice(i).join(".");
      return Object.hasOwn(current, literalKey) ? current[literalKey] : undefined;
    }
  }

  return current;
}

/**
 * Builds the ordered locale fallback chain (exact → lowercase → base language) for the active
 * locale, the configured default locale, and 'en'.
 */
function localeChain(locale: string): string[] {
  const chain: string[] = [];

  const add = (code: string): void => {
    if (!code) return;
    const normalized = code.toLowerCase();
    for (const candidate of [code, normalized, normalized.split("-")[0]!]) {
      if (candidate && !chain.includes(candidate)) chain.push(candidate);
    }
  };

  add(locale);
  add(defaultLocale);
  add("en");
  return chain;
}

/**
 * Resolves a value for a component across the locale fallback chain (active locale → default
 * locale → 'en'). Without `key` the component's translation object itself is returned.
 */
function resolveFromLocale(locale: string, component: string, key?: string): unknown {
  for (const code of localeChain(locale)) {
    const rawComp: unknown = translations[code]?.[component];
    if (!isObjectRecord(rawComp)) continue;

    const value = key === undefined ? rawComp : resolvePath(rawComp, key);
    if (value !== undefined) return value;
  }

  return undefined;
}

/**
 * Safely retrieves the raw translation entry (string, array, or object) for a given dot-notation
 * key.
 */
function getRawTranslation(key: string): unknown {
  const dotIndex = key.indexOf(".");
  const locale = currentLocale.get() || defaultLocale;

  return dotIndex === -1
    ? resolveFromLocale(locale, key)
    : resolveFromLocale(locale, key.slice(0, dotIndex), key.slice(dotIndex + 1));
}

/**
 * Returns raw translation data (such as arrays or nested objects) typed as T.
 */
function tRaw<T = unknown>(key: string, fallback?: T): T {
  const value = getRawTranslation(key);
  return value !== undefined ? (value as T) : (fallback as T);
}

/**
 * Returns an array of translations (e.g. lists of strings or structured objects). Falls back to an
 * empty array or the provided fallback if not found or not an array.
 */
function tArray<T = string>(key: string, fallback: T[] = []): T[] {
  const value = getRawTranslation(key);
  return Array.isArray(value) ? (value as T[]) : fallback;
}

/**
 * Translates a single string key using dot-notation (e.g. `t("page_home.section_hero_title")` or
 * nested/array paths like `t("page_resume.experiences.0.role")`). Also provides `t.raw()` and
 * `t.array()` methods to retrieve structured data or string arrays.
 */
export const t: TFunction = Object.assign(
  function t(key: string, params?: Record<string, any>): string {
    const dotIndex = key.indexOf(".");
    if (dotIndex === -1) return key;

    const locale = currentLocale.get() || defaultLocale;
    let value = resolveFromLocale(locale, key.slice(0, dotIndex), key.slice(dotIndex + 1)) ?? key;

    // Pluralization when `count` is provided and the value is a plural object ({ one, other, ... })
    if (
      params &&
      typeof params["count"] === "number" &&
      isObjectRecord(value) &&
      !Array.isArray(value)
    ) {
      value = value[getPluralCategory(params["count"], locale)] ?? value["other"] ?? key;
    }

    if (typeof value === "function") {
      return (value as (p?: Record<string, any>) => string)(params);
    }

    if (typeof value === "string") {
      return params
        ? value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
        : value;
    }
    if (isObjectRecord(value)) return JSON.stringify(value);
    return value != null ? String(value as string | number | boolean) : "";
  },
  { raw: tRaw, array: tArray },
);

/**
 * Returns the plural category (e.g. 'one', 'few', 'many', 'other') for a given number and locale
 * using the native browser Intl.PluralRules API.
 */
export function getPluralCategory(count: number, locale: string = "en"): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(count);
}

/**
 * Resolves localized text from a polymorphic value (localized dictionary object, plain string, or null/undefined).
 *
 * @param val The value to extract localized text from (e.g., `{ en: "Hello", pt: "Olá" }` or `"Hello"`).
 * @param locale The desired locale code.
 * @param fallbackLocale Optional fallback locale if the requested locale is not found (default: "en").
 * @returns The resolved localized string, fallback string, or empty string.
 */
export function getLocalizedText(
  val: unknown,
  locale: string,
  fallbackLocale: string = "en",
): string {
  if (isObjectRecord(val)) {
    const localized = val[locale];
    if (typeof localized === "string" && localized.length > 0) return localized;

    const fallback = val[fallbackLocale];
    if (typeof fallback === "string") return fallback;
    return "";
  }
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}

/**
 * Returns the configured locale matching the first path segment of a pathname (compared
 * case-insensitively, returning the configured spelling, e.g. `pt-BR`), otherwise null. Shared by
 * `getLocale()` and the Hono middleware so both agree on what counts as a locale prefix.
 */
export function localeFromPathname(
  pathname: string,
  supported: readonly string[] = locales,
): string | null {
  const segment = pathname.split("/").find(Boolean);
  if (!segment) return null;
  return supported.find((code) => code.toLowerCase() === segment.toLowerCase()) ?? null;
}

/**
 * Removes a leading locale segment from a path (`/en/about` → `about`, `/pt` → ``), returning the
 * remainder without a leading slash. Segments are matched case-insensitively against `supported`.
 */
export function stripLocalePrefix(path: string, supported: readonly string[] = locales): string {
  const segments = path.replace(/^\/+/, "").split("/");
  const first = segments[0];
  if (first && supported.some((code) => code.toLowerCase() === first.toLowerCase())) {
    segments.shift();
  }
  return segments.join("/");
}

/**
 * Returns the active locale: the explicitly set one, otherwise auto-detected from the browser
 * URL pathname, otherwise the configured default.
 */
export function getLocale(): string {
  const explicit = currentLocale.get();
  if (explicit) return explicit;

  if (typeof window !== "undefined") {
    const segment = localeFromPathname(window.location.pathname);
    if (segment) return segment;
  }

  return defaultLocale;
}

/** Canonical HTML `lang` tags for the known locales; unknown locales fall back to their raw code. */
const HTML_LANG_TAGS: Record<string, string> = {
  en: "en-US",
  pt: "pt-BR",
  es: "es-ES",
};

/**
 * Returns a standard BCP 47 / RFC 5646 language tag suitable for HTML `<html lang="...">`. Maps
 * 2-letter codes like 'en' to 'en-US', 'pt' to 'pt-BR', 'es' to 'es-ES', etc.
 */
export function getHtmlLang(): string {
  return HTML_LANG_TAGS[getLocale()] ?? getLocale();
}

export function getRelativeLocaleUrl(
  path: string,
  { locale = getLocale() }: { locale?: string } = {},
): string {
  // External / absolute URLs, hash anchors, and scheme links (mailto:, tel:, ...) pass through
  if (/^(?:[a-z]+:|\/\/|#)/i.test(path)) return path;

  const splitAt = path.search(/[?#]/);
  const pathname = splitAt === -1 ? path : path.slice(0, splitAt);
  const suffix = splitAt === -1 ? "" : path.slice(splitAt);

  // Strip a leading locale segment (e.g. /en/about → about) so locales are never doubled up
  const cleanPath = stripLocalePrefix(pathname);
  const prefix = prefixDefaultLocale || locale !== defaultLocale ? `/${locale}` : "";

  // Root path keeps a trailing slash when prefixed: e.g. /en/
  if (!cleanPath) return `${prefix}/${suffix}`;

  const trailingSlash = pathname.endsWith("/") ? "/" : "";
  return `${prefix}/${cleanPath}${trailingSlash}${suffix}`;
}

// ── Bootstrap from the Vite virtual module ────────────────────────────────────────────────────
// Runs after every declaration above. Silently falls back to the defaults outside a Rimelight app,
// where `virtual:rimelight-i18n-config` is only resolvable inside a Vite graph.
try {
  const cfg = await import("virtual:rimelight-i18n-config");
  if (cfg?.locales) locales = cfg.locales;
  if (cfg?.defaultLocale) defaultLocale = cfg.defaultLocale;
  if (cfg?.prefixDefaultLocale !== undefined) prefixDefaultLocale = cfg.prefixDefaultLocale;
  if (cfg?.translations && Object.keys(cfg.translations).length > 0) {
    initializeI18n({ defaultLocale, translations: cfg.translations });
  }
} catch {
  // Virtual module is resolved inside Vite during app bundle, not in Node config evaluation
}

import type { TFunction, WritableAtom } from "./types";

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
 * Creates a lightweight reactive atom store compatible with Nanostores / Svelte store contracts.
 */
export function atom<T>(initialValue: T): WritableAtom<T> {
  let value = initialValue;
  const listeners = new Set<(val: T) => void>();

  const listen = (listener: (val: T) => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    get: (): T => value,
    set: (nextValue: T): void => {
      if (value !== nextValue) {
        value = nextValue;
        for (const listener of listeners) {
          listener(value);
        }
      }
    },
    // `subscribe` notifies immediately with the current value, `listen` only on later changes.
    subscribe: (listener: (val: T) => void): (() => void) => {
      const unsubscribe = listen(listener);
      listener(value);
      return unsubscribe;
    },
    listen,
  };
}

/**
 * A reactive store containing the current locale code. Set by middleware on each request, or
 * manually via `currentLocale.set(locale)`.
 */
export const currentLocale: WritableAtom<string> = atom<string>("");

let baseLocaleDefault: string = "en";
let rawTranslationsDict: Record<string, Record<string, any>> = {};

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
 * integration virtual module does this automatically).
 */
export function initializeI18n(options: InitializeI18nOptions): void {
  const { defaultLocale, translations } = options;
  baseLocaleDefault = defaultLocale;
  rawTranslationsDict = translations ? { ...translations } : {};
  chainCache.clear();

  if (!currentLocale.get()) {
    currentLocale.set(defaultLocale);
  }
}

/**
 * Helper to safely resolve nested dot-notation and array indices while guarding against prototype
 * pollution.
 */
function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return (obj as any)[path];
  }

  const segments = path.split(".");
  let current: any = obj;

  for (let i = 0; i < segments.length; i++) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    const seg = segments[i]!;
    if (seg === "__proto__" || seg === "constructor" || seg === "prototype") {
      return undefined;
    }
    if (
      Object.prototype.hasOwnProperty.call(current, seg) ||
      (Array.isArray(current) && seg in current)
    ) {
      current = current[seg];
    } else {
      const remainingKey = segments.slice(i).join(".");
      if (Object.prototype.hasOwnProperty.call(current, remainingKey)) {
        return current[remainingKey];
      }
      return undefined;
    }
  }

  return current;
}

const chainCache = new Map<string, string[]>();

/**
 * Builds the ordered locale fallback chain (exact → lowercase → base language) for the active
 * locale, the configured default locale, and 'en'. Cached because the chain only depends on the
 * two locale codes, which change solely through `initializeI18n`.
 */
function getLocaleCandidateChain(activeLocale: string, defaultLocale: string): string[] {
  const cacheKey = `${activeLocale}|${defaultLocale}`;
  const cached = chainCache.get(cacheKey);
  if (cached) return cached;

  const chain: string[] = [];

  function addCandidates(code: string) {
    if (!code) return;
    const exact = code;
    const normalized = code.toLowerCase();
    const baseLang = normalized.split("-")[0] ?? normalized;

    if (!chain.includes(exact)) chain.push(exact);
    if (!chain.includes(normalized)) chain.push(normalized);
    if (!chain.includes(baseLang)) chain.push(baseLang);
  }

  addCandidates(activeLocale);
  addCandidates(defaultLocale);
  addCandidates("en");

  chainCache.set(cacheKey, chain);
  return chain;
}

/**
 * Finds a component's translation object for a locale, walking the fallback chain
 * (active locale → default locale → 'en').
 */
function findComponent(locale: string, componentName: string): Record<string, any> | undefined {
  const candidates = getLocaleCandidateChain(locale, baseLocaleDefault);

  for (const code of candidates) {
    const rawComp: unknown = rawTranslationsDict[code]?.[componentName];
    if (isObjectRecord(rawComp)) {
      return rawComp;
    }
  }

  return undefined;
}

function resolveKeyInLocales(locale: string, componentName: string, keyName: string): unknown {
  const candidates = getLocaleCandidateChain(locale, baseLocaleDefault);

  for (const code of candidates) {
    const rawComp: unknown = rawTranslationsDict[code]?.[componentName];
    if (isObjectRecord(rawComp)) {
      const val = resolvePath(rawComp, keyName);
      if (val !== undefined) {
        return val;
      }
    }
  }

  return undefined;
}

/**
 * Safely retrieves the raw translation entry (string, array, or object) for a given dot-notation
 * key.
 */
export function getRawTranslation(key: string): unknown {
  const dotIndex = key.indexOf(".");
  const activeLocale = currentLocale.get() || baseLocaleDefault;

  if (dotIndex === -1) {
    return findComponent(activeLocale, key);
  }

  return resolveKeyInLocales(activeLocale, key.slice(0, dotIndex), key.slice(dotIndex + 1));
}

/**
 * Returns raw translation data (such as arrays or nested objects) typed as T.
 */
export function tRaw<T = unknown>(key: string, fallback?: T): T {
  const val = getRawTranslation(key);
  if (val !== undefined) {
    return val as T;
  }
  return fallback as T;
}

/**
 * Returns an array of translations (e.g. lists of strings or structured objects). Falls back to an
 * empty array or the provided fallback if not found or not an array.
 */
export function tArray<T = string>(key: string, fallback: T[] = []): T[] {
  const val = getRawTranslation(key);
  if (Array.isArray(val)) {
    return val as T[];
  }
  return fallback;
}

/**
 * Translates a single string key using dot-notation (e.g. `t("page_home.section_hero_title")` or
 * nested/array paths like `t("page_resume.experiences.0.role")`). Also provides `t.raw()` and
 * `t.array()` methods to retrieve structured data or string arrays.
 */
export const t: TFunction = Object.assign(
  function t(key: string, params?: Record<string, any>): string {
    const dotIndex = key.indexOf(".");
    if (dotIndex === -1) {
      return key;
    }
    const componentName = key.slice(0, dotIndex);
    const keyName = key.slice(dotIndex + 1);

    const activeLocale = currentLocale.get() || baseLocaleDefault;
    let value = resolveKeyInLocales(activeLocale, componentName, keyName) ?? key;

    // Pluralization support if count parameter is provided and translation value is a plural object
    if (
      params &&
      typeof params["count"] === "number" &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      const pluralCategory = getPluralCategory(params["count"], activeLocale);
      value =
        (value as Record<string, any>)[pluralCategory] ??
        (value as Record<string, any>)["other"] ??
        key;
    }

    if (typeof value === "function") {
      return (value as Function)(params);
    }

    if (params && typeof value === "string") {
      return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
    }

    if (typeof value === "string") {
      return value;
    }
    if (value !== undefined && value !== null && typeof value === "object") {
      return JSON.stringify(value);
    }
    return value != null ? `${value as string | number | boolean}` : "";
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
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, unknown>;
    const localized = record[locale];
    if (typeof localized === "string" && localized.length > 0) {
      return localized;
    }
    const fallback = record[fallbackLocale];
    if (typeof fallback === "string") {
      return fallback;
    }
    return "";
  }
  if (typeof val === "string") {
    return val;
  }
  if (typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
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

// ── Bootstrap from the Vite virtual module ────────────────────────────────────────────────────
// Runs after every declaration above (the fallback-chain cache must exist before
// `initializeI18n`). Silently falls back to the defaults outside a Rimelight app, where
// `virtual:rimelight-i18n-config` is only resolvable inside a Vite graph.
try {
  const cfg = await import("virtual:rimelight-i18n-config");
  if (cfg) {
    if (cfg.locales) locales = cfg.locales;
    if (cfg.defaultLocale) defaultLocale = cfg.defaultLocale;
    if (cfg.prefixDefaultLocale !== undefined) prefixDefaultLocale = cfg.prefixDefaultLocale;
    if (cfg.translations && Object.keys(cfg.translations).length > 0) {
      initializeI18n({
        defaultLocale: cfg.defaultLocale || "en",
        translations: cfg.translations,
      });
    }
  }
} catch {
  // Virtual module is resolved inside Vite during app bundle, not in Node config evaluation
}

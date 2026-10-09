import generatedConfig from "#rimelight/i18n";
import { defaultLocale, getCurrentLocale, setLocaleConfig } from "./locale";

/** Public shape of the `t` translator: a callable plus its `.raw`, `.array`, and `.plural` helpers. */
export interface TFunction {
  (key: string, params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  /**
   * Returns the CLDR plural category for a count (e.g. `"one"`, `"other"`, `"few"`, `"many"`).
   * Defaults to the active locale. Use when the plural decision drives code — layout branching,
   * grouping — rather than a translated string (for text, pass `{ count }` to `t()` instead).
   */
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
}

export let translations: Record<string, Record<string, any>> = generatedConfig?.translations
  ? { ...generatedConfig.translations }
  : {};

export function isObjectRecord(obj: unknown): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null;
}

/** Cache for computed fallback locale chains. */
const chainCache = new Map<string, string[]>();

/**
 * Internal/test helper to set translations or update default locale in tests.
 */
export function setTranslations(
  data: Record<string, Record<string, any>>,
  options?: {
    defaultLocale?: string;
    locales?: string[];
    prefixDefaultLocale?: boolean;
    kvBinding?: string;
    skipPaths?: string[];
  },
): void {
  translations = { ...data };
  if (options) {
    setLocaleConfig(options);
  }
  chainCache.clear();
}

/**
 * Replaces bundled translations for `locale` with KV-sourced translations. If KV data exists,
 * it completely replaces the bundled data (no merging). If KV data is unavailable or invalid,
 * bundled translations are used. Called by the middleware before rendering.
 */
export function applyLocaleOverrides(locale: string, overrides: unknown): void {
  if (!locale || !isObjectRecord(overrides)) return;
  translations[locale] = overrides;
  chainCache.clear();
}

/**
 * Resolves a dot-notation path (including array indices) inside a translation object.
 */
export function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  if (Object.hasOwn(obj, path)) {
    return (obj as Record<string, unknown>)[path];
  }

  const segments = path.split(".");
  let current: any = obj;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
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
 * Builds the ordered locale fallback chain (exact → default locale).
 */
export function localeChain(targetLocale: string): string[] {
  const cacheKey = `${targetLocale}:${defaultLocale}`;
  const cached = chainCache.get(cacheKey);
  if (cached) return cached;

  const chain: string[] = [];
  if (targetLocale && !chain.includes(targetLocale)) chain.push(targetLocale);
  if (defaultLocale && !chain.includes(defaultLocale)) chain.push(defaultLocale);

  chainCache.set(cacheKey, chain);
  return chain;
}

/**
 * Resolves a value for a component across the locale fallback chain (active locale → default
 * locale). Without `key` the component's translation object itself is returned.
 */
export function resolveFromLocale(targetLocale: string, component: string, key?: string): unknown {
  for (const code of localeChain(targetLocale)) {
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
export function getRawTranslation(key: string): unknown {
  const dotIndex = key.indexOf(".");
  const targetLocale = getCurrentLocale() || defaultLocale;

  return dotIndex === -1
    ? resolveFromLocale(targetLocale, key)
    : resolveFromLocale(targetLocale, key.slice(0, dotIndex), key.slice(dotIndex + 1));
}

/**
 * Returns raw translation data (such as arrays or nested objects) typed as T.
 */
export function tRaw<T = unknown>(key: string, fallback?: T): T {
  const value = getRawTranslation(key);
  return value !== undefined ? (value as T) : (fallback as T);
}

/**
 * Returns an array of translations (e.g. lists of strings or structured objects). Falls back to an
 * empty array or the provided fallback if not found or not an array.
 */
export function tArray<T = string>(key: string, fallback: T[] = []): T[] {
  const value = getRawTranslation(key);
  return Array.isArray(value) ? (value as T[]) : fallback;
}

/**
 * Returns the plural category (e.g. 'one', 'few', 'many', 'other') for a given number and locale
 * using the native browser Intl.PluralRules API. Internal — `t()` selects plural branches with it
 * automatically when a numeric `count` param is passed.
 */
export function getPluralCategory(count: number, targetLocale: string = "en"): Intl.LDMLPluralRule {
  return new Intl.PluralRules(targetLocale).select(count);
}

/** Cached `Intl.NumberFormat` instances per locale — `t()` formats counts on every interpolation. */
const numberFormats = new Map<string, Intl.NumberFormat>();

/**
 * Locale-formats a number (e.g. 1234 → `"1,234"` in en, `"1.234"` in pt). Used for the `count`
 * interpolation param so quantities read as localized text rather than raw digits.
 */
function formatNumber(locale: string, value: number): string {
  let formatter = numberFormats.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormats.set(locale, formatter);
  }
  return formatter.format(value);
}

/**
 * Translates a single string key using dot-notation (e.g. `t("page_home.section_hero_title")` or
 * nested/array paths like `t("page_resume.experiences.0.role")`). Also provides `t.raw()` and
 * `t.array()` methods to retrieve structured data or string arrays.
 *
 * When `params.count` is a number:
 * - a plural object value (`{ one, few, many, other, ... }`) resolves to the locale-correct branch
 * - `{count}` interpolates locale-formatted (1234 → `"1,234"` in en, `"1.234"` in pt)
 */
export const t: TFunction = Object.assign(
  function t(key: string, params?: Record<string, any>): string {
    const dotIndex = key.indexOf(".");
    if (dotIndex === -1) return key;

    const targetLocale = getCurrentLocale() || defaultLocale;
    let value =
      resolveFromLocale(targetLocale, key.slice(0, dotIndex), key.slice(dotIndex + 1)) ?? key;

    // Pluralization when `count` is provided and the value is a plural object ({ one, other, ... })
    if (
      params &&
      typeof params["count"] === "number" &&
      isObjectRecord(value) &&
      !Array.isArray(value)
    ) {
      value = value[getPluralCategory(params["count"], targetLocale)] ?? value["other"] ?? key;
    }

    if (typeof value === "function") {
      return (value as (p?: Record<string, any>) => string)(params);
    }

    if (typeof value === "string") {
      return params
        ? value.replace(/\{(\w+)\}/g, (_, name) => {
            const param = params[name];
            if (param === undefined) return `{${name}}`;
            return name === "count" && typeof param === "number"
              ? formatNumber(targetLocale, param)
              : String(param);
          })
        : value;
    }
    if (isObjectRecord(value)) return JSON.stringify(value);
    return value != null ? String(value as string | number | boolean) : "";
  },
  {
    raw: tRaw,
    array: tArray,
    plural: (count: number, locale?: string) =>
      getPluralCategory(count, locale ?? getCurrentLocale()),
  },
);

/**
 * Resolves localized text from a polymorphic value (localized dictionary object, plain string, or null/undefined).
 *
 * @param val The value to extract localized text from (e.g., `{ en: "Hello", pt: "Olá" }` or `"Hello"`).
 * @param targetLocale The desired locale code.
 * @param fallbackLocale Optional fallback locale if the requested locale is not found (default: "en").
 * @returns The resolved localized string, fallback string, or empty string.
 */
export function getLocalizedText(
  val: unknown,
  targetLocale: string,
  fallbackLocale: string = "en",
): string {
  if (isObjectRecord(val)) {
    const localized = val[targetLocale];
    if (typeof localized === "string" && localized.length > 0) return localized;

    const fallback = val[fallbackLocale];
    if (typeof fallback === "string") return fallback;
    return "";
  }
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}

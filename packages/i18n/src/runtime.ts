import type { TranslationLoader, WritableAtom } from "./types";

/**
 * Creates a lightweight reactive atom store compatible with Nanostores / Svelte store contracts.
 */
export function atom<T>(initialValue: T): WritableAtom<T> {
  let value = initialValue;
  const listeners = new Set<(val: T) => void>();

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
    subscribe: (listener: (val: T) => void): (() => void) => {
      listeners.add(listener);
      listener(value);
      return () => {
        listeners.delete(listener);
      };
    },
    listen: (listener: (val: T) => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
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
  /**
   * Optional dynamic loader called when a locale or component is not in cache.
   */
  get?: TranslationLoader | undefined;
}

/**
 * Initializes the i18n system. Must be called once before any other i18n functions are used (the
 * integration virtual module does this automatically).
 */
export function initializeI18n(options: InitializeI18nOptions): void {
  const { defaultLocale, translations } = options;
  baseLocaleDefault = defaultLocale;
  rawTranslationsDict = translations ? { ...translations } : {};

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

function getLocaleCandidateChain(activeLocale: string, defaultLocale: string): string[] {
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

  return chain;
}

function getCachedComponent(
  locale: string,
  componentName: string
): Record<string, any> | undefined {
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
    return getCachedComponent(activeLocale, key) ?? getCachedComponent(baseLocaleDefault, key);
  }

  const componentName = key.slice(0, dotIndex);
  const keyName = key.slice(dotIndex + 1);

  return resolveKeyInLocales(activeLocale, componentName, keyName);
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
 * nested/array paths like `t("page_resume.experiences.0.role")`).
 */
export function t(key: string, params?: Record<string, any>): string {
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
}

t.raw = tRaw;
t.array = tArray;

/**
 * Returns the plural category (e.g. 'one', 'few', 'many', 'other') for a given number and locale
 * using the native browser Intl.PluralRules API.
 */
export function getPluralCategory(count: number, locale: string = "en"): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(count);
}

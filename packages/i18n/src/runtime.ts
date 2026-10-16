import virtualConfig from "virtual:rimelight-i18n";
import type { I18nContextStore, RimelightTranslationKeys, TranslationKey } from "./types";

export type { I18nContextStore, RimelightTranslationKeys, TranslationKey };

export const config = {
  locales: [...(virtualConfig?.locales ?? ["en"])],
  defaultLocale: virtualConfig?.defaultLocale ?? "en",
  prefixDefaultLocale: virtualConfig?.prefixDefaultLocale ?? true,
  skipPaths: [...(virtualConfig?.skipPaths ?? ["/api", "/_"])],
  translations: (virtualConfig?.translations ?? {}) as Record<string, Record<string, unknown>>,
};

let currentLocale = config.defaultLocale;

/** Returns the supported locale codes. */
export const getLocales = (): string[] => [...config.locales];

/** Returns the default locale code. */
export const getDefaultLocale = (): string => config.defaultLocale;

/** Returns the active locale code. */
export const getCurrentLocale = (): string =>
  globalThis.__rimelight_i18n?.getStore()?.locale ?? currentLocale;

/** Sets the active locale code. */
export const setCurrentLocale = (locale: string): void => {
  currentLocale = locale;
};

/** Generates a localized relative URL path. */
export const getLocaleUrl = (path: string, locale = getCurrentLocale()): string =>
  /^(?:[a-z]+:|\/\/|#)/i.test(path)
    ? path
    : `${config.prefixDefaultLocale || locale !== config.defaultLocale ? `/${locale}` : ""}/${path.replace(new RegExp(`^/(?:${config.locales.join("|")})(?=[/?#]|$)`, "i"), "").replace(/^\/+/, "")}`;

/** Resolves an asset for the current or fallback locale. */
export const getLocaleAsset = <T>(assets: Record<string, T>, locale = getCurrentLocale()): T =>
  (assets[locale] ?? assets[config.defaultLocale]) as T;

export interface TFunction {
  (key: TranslationKey, params?: Record<string, unknown>, locale?: string): string;
  raw: <T = unknown>(key: TranslationKey, fallback?: T, locale?: string) => T;
  array: <T = string>(key: TranslationKey, fallback?: T[], locale?: string) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, unknown>, locale = getCurrentLocale()): string => {
    let value: unknown = t.raw(key, undefined, locale);

    if (typeof params?.["count"] === "number") {
      const cat = t.plural(params["count"], locale);
      const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
      value =
        obj?.[cat] ??
        obj?.["other"] ??
        t.raw(`${key}.${cat}`, undefined, locale) ??
        t.raw(`${key}.other`, value, locale);
    }

    const resolved = value ?? key;
    if (typeof resolved === "function") return String(resolved(params));
    if (typeof resolved === "string" && params) {
      return resolved.replace(/\{\s*(\w+)\s*\}/g, (match, paramKey) => {
        const val = params[paramKey];
        if (val == null) return match;
        return paramKey === "count" && typeof val === "number"
          ? val.toLocaleString(locale)
          : String(val as string | number | boolean);
      });
    }
    return typeof resolved === "object" && resolved
      ? JSON.stringify(resolved)
      : String(resolved as string | number | boolean);
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, locale = getCurrentLocale()): T => {
      const store = globalThis.__rimelight_i18n?.getStore();
      const get = (loc: string) => {
        const dict = ((store && (store.locale === loc || !loc) && store.translations) ||
          config.translations[loc]) as Record<string, unknown> | undefined;
        if (!dict) return undefined;
        if (key in dict) return dict[key];
        if (!key.includes(".")) return undefined;
        return key
          .split(".")
          .reduce<unknown>(
            (d, part) =>
              d && typeof d === "object" ? (d as Record<string, unknown>)[part] : undefined,
            dict,
          );
      };
      const val = get(locale) ?? get(config.defaultLocale);
      return (val !== undefined ? val : fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = [], locale = getCurrentLocale()): T[] => {
      const value = t.raw(key, undefined, locale);
      return Array.isArray(value) ? (value as T[]) : fallback;
    },
    plural: (count: number, locale = getCurrentLocale()): Intl.LDMLPluralRule =>
      new Intl.PluralRules(locale).select(count),
    localize: (value: unknown, locale = getCurrentLocale()): string => {
      if (value && typeof value === "object") {
        const dict = value as Record<string, unknown>;
        return String(
          (dict[locale] ?? dict[config.defaultLocale] ?? "") as string | number | boolean,
        );
      }
      return value != null ? String(value as string | number | boolean) : "";
    },
  },
);

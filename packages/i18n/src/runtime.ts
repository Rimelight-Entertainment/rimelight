import { AsyncLocalStorage } from "node:async_hooks";
import generatedConfig from "#rimelight/i18n";

export interface I18nContext {
  locale: string;
  translations?: Record<string, unknown> | undefined;
}

export const i18nContext = new AsyncLocalStorage<I18nContext>();

export interface RimelightTranslationKeys {
  keys: string;
}

export type TranslationKey = RimelightTranslationKeys["keys"];

export interface I18nConfig {
  locales: readonly string[];
  defaultLocale: string;
  prefixDefaultLocale: boolean;
  skipPaths: readonly string[];
  translations: Record<string, Record<string, unknown>>;
}

export const config: I18nConfig = {
  locales: generatedConfig?.locales ?? ["en"],
  defaultLocale: generatedConfig?.defaultLocale ?? "en",
  prefixDefaultLocale: generatedConfig?.prefixDefaultLocale ?? true,
  skipPaths: generatedConfig?.skipPaths ?? ["/api", "/_"],
  translations: generatedConfig?.translations ?? {},
};

let currentLocale = config.defaultLocale;

/** Returns the supported locale codes. */
export const getLocales = (): string[] => [...config.locales];

/** Returns the default locale code. */
export const getDefaultLocale = (): string => config.defaultLocale;

/** Returns the active locale code. */
export const getCurrentLocale = (): string => i18nContext.getStore()?.locale ?? currentLocale;

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
      const category = t.plural(params["count"], locale);
      value =
        typeof value === "object" && value
          ? ((value as Record<string, unknown>)[category] ??
            (value as Record<string, unknown>)["other"])
          : (t.raw(`${key}.${category}`, undefined, locale) ??
            t.raw(`${key}.other`, value, locale));
    }

    const resolved = value ?? key;
    if (typeof resolved === "function") return String(resolved(params));
    if (typeof resolved === "string" && params) {
      return resolved.replace(/\{\s*(\w+)\s*}/g, (match, paramKey) =>
        params[paramKey] == null
          ? match
          : paramKey === "count" && typeof params[paramKey] === "number"
            ? (params[paramKey] as number).toLocaleString(locale)
            : String(params[paramKey] as string | number | boolean),
      );
    }
    return typeof resolved === "object" && resolved
      ? JSON.stringify(resolved)
      : String(resolved as string | number | boolean);
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, locale = getCurrentLocale()): T => {
      const store = i18nContext.getStore();
      const get = (loc: string) => {
        const dict =
          (store && (store.locale === loc || !loc) && store.translations) ||
          config.translations[loc];
        if (!dict) return undefined;
        if (key in dict) return dict[key];
        return key
          .split(".")
          .reduce<unknown>(
            (d, part) =>
              d && typeof d === "object" ? (d as Record<string, unknown>)[part] : undefined,
            dict,
          );
      };
      return (get(locale) ?? get(config.defaultLocale) ?? fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = [], locale = getCurrentLocale()): T[] => {
      const value = t.raw(key, undefined, locale);
      return Array.isArray(value) ? (value as T[]) : fallback;
    },
    plural: (count: number, locale = getCurrentLocale()): Intl.LDMLPluralRule =>
      new Intl.PluralRules(locale).select(count),
    localize: (value: unknown, locale = getCurrentLocale()): string =>
      String(
        (value && typeof value === "object"
          ? ((value as Record<string, unknown>)[locale] ??
            (value as Record<string, unknown>)[config.defaultLocale] ??
            "")
          : (value ?? "")) as string | number | boolean,
      ),
  },
);

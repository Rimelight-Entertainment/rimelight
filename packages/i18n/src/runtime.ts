import { config } from "virtual:rimelight-i18n";
import type { TFunction } from "./types";

const AsyncLocalStorage =
  typeof window === "undefined" && typeof document === "undefined"
    ? (await import("node:async_hooks")).AsyncLocalStorage
    : undefined;

const storage = AsyncLocalStorage
  ? new AsyncLocalStorage<{
      locale: string;
      translations?: Record<string, unknown> | undefined;
    }>()
  : undefined;

export const withLocale = <R>(locale: string, fn: () => R): R =>
  storage ? storage.run({ locale, translations: activeConfig.translations[locale] }, fn) : fn();

const translations: Record<string, Record<string, unknown>> = Object.fromEntries(
  Object.entries(config?.translations ?? {}).map(([p, d]) => [
    p.replace(/^.*[\\/]|\.json$/g, ""),
    d,
  ]),
);

export const activeConfig = {
  locales: [
    ...(config?.locales ??
      (Object.keys(translations).length ? Object.keys(translations).sort() : ["en"])),
  ],
  defaultLocale: config?.defaultLocale ?? "en",
  prefixDefaultLocale: config?.prefixDefaultLocale ?? true,
  skipPaths: [...(config?.skipPaths ?? ["/api", "/_"])],
  translations,
};

let currentLocale = activeConfig.defaultLocale;

/** Returns the supported locale codes. */
export const getLocales = (): string[] => [...activeConfig.locales];

/** Returns the default locale code. */
export const getDefaultLocale = (): string => activeConfig.defaultLocale;

/** Returns the active locale code. */
export const getCurrentLocale = (): string => storage?.getStore()?.locale ?? currentLocale;

/** Sets the active locale code. */
export const setCurrentLocale = (locale: string): void => {
  currentLocale = locale;
};

/** Generates a localized relative URL path. */
export const getLocaleUrl = (path: string, locale = getCurrentLocale()): string =>
  /^(?:[a-z]+:|\/\/|#)/i.test(path)
    ? path
    : `${activeConfig.prefixDefaultLocale || locale !== activeConfig.defaultLocale ? `/${locale}` : ""}/${path.replace(new RegExp(`^/(?:${activeConfig.locales.join("|")})(?=[/?#]|$)`, "i"), "").replace(/^\/+/, "")}`;

/** Resolves an asset for the current or fallback locale. */
export const getLocaleAsset = <T>(assets: Record<string, T>, locale = getCurrentLocale()): T =>
  (assets[locale] ?? assets[activeConfig.defaultLocale]) as T;

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
      return resolved.replace(/\{\s*(\w+)\s*}/g, (match, paramKey) => {
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
      const store = storage?.getStore();
      const get = (loc: string) => {
        const dict = ((store && (store.locale === loc || !loc) && store.translations) ||
          activeConfig.translations[loc]) as Record<string, unknown> | undefined;
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
      const val = get(locale) ?? get(activeConfig.defaultLocale);
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
          (dict[locale] ?? dict[activeConfig.defaultLocale] ?? "") as string | number | boolean,
        );
      }
      return value != null ? String(value as string | number | boolean) : "";
    },
  },
);

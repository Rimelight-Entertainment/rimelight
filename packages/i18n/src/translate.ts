import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  (key: string, params?: Record<string, unknown>, locale?: string): string;
  raw: <T = unknown>(key: string, fallback?: T, locale?: string) => T;
  array: <T = string>(key: string, fallback?: T[], locale?: string) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, unknown>, locale = getCurrentLocale()): string => {
    let val: unknown = t.raw(key, undefined, locale);

    if (typeof params?.["count"] === "number") {
      const cat = t.plural(params["count"], locale);
      val =
        typeof val === "object" && val
          ? ((val as Record<string, unknown>)[cat] ?? (val as Record<string, unknown>)["other"])
          : (t.raw(`${key}.${cat}`, undefined, locale) ?? t.raw(`${key}.other`, val, locale));
    }

    const res = val ?? key;
    if (typeof res === "function") return String(res(params));
    if (typeof res === "string" && params) {
      return res.replace(/\{\s*(\w+)\s*\}/g, (m, k) =>
        params[k] == null
          ? m
          : k === "count" && typeof params[k] === "number"
            ? (params[k] as number).toLocaleString(locale)
            : String(params[k] as string | number | boolean),
      );
    }
    return typeof res === "object" && res
      ? JSON.stringify(res)
      : String(res as string | number | boolean);
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, locale = getCurrentLocale()): T => {
      const get = (loc: string) =>
        key
          .split(".")
          .reduce<unknown>(
            (o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined),
            config.translations[loc],
          );
      return (get(locale) ?? get(config.defaultLocale) ?? fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = [], locale = getCurrentLocale()): T[] => {
      const val = t.raw(key, undefined, locale);
      return Array.isArray(val) ? (val as T[]) : fallback;
    },
    plural: (count: number, locale = getCurrentLocale()): Intl.LDMLPluralRule =>
      new Intl.PluralRules(locale).select(count),
    localize: (value: unknown, locale = getCurrentLocale()): string =>
      typeof value === "object" && value
        ? String(
            ((value as Record<string, unknown>)[locale] ??
              (value as Record<string, unknown>)[config.defaultLocale] ??
              "") as string | number | boolean,
          )
        : String((value as string | number | boolean) ?? ""),
  },
);

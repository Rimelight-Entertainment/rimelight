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
      const get = (targetLocale: string) =>
        key
          .split(".")
          .reduce<unknown>(
            (dict, part) =>
              dict && typeof dict === "object"
                ? (dict as Record<string, unknown>)[part]
                : undefined,
            config.translations[targetLocale],
          );
      return (get(locale) ?? get(config.defaultLocale) ?? fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = [], locale = getCurrentLocale()): T[] => {
      const value = t.raw(key, undefined, locale);
      return Array.isArray(value) ? (value as T[]) : fallback;
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

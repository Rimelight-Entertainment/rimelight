import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  (key: string, params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T, locale?: string) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, any>): string => {
    const locale = getCurrentLocale();
    let value = t.raw<any>(key, undefined, locale);

    if (typeof params?.["count"] === "number") {
      const category = t.plural(params["count"], locale);
      value =
        typeof value === "object" && value
          ? (value[category] ?? value["other"])
          : (value ??
            t.raw(`${key}.${category}`, t.raw(`${key}.other`, undefined, locale), locale));
    }
    value = value ?? key;

    if (typeof value === "function") return value(params);
    if (typeof value === "string" && params) {
      return value.replace(/\{(\w+)\}/g, (_, k) =>
        params[k] == null
          ? `{${k}}`
          : k === "count" && typeof params[k] === "number"
            ? (params[k] as number).toLocaleString(locale)
            : String(params[k]),
      );
    }
    return value == null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value as string | number | boolean);
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, locale = getCurrentLocale()): T => {
      const get = (dict?: Record<string, any>) =>
        key
          .split(".")
          .reduce((acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined), dict);
      return (get(config.translations[locale]) ??
        get(config.translations[config.defaultLocale]) ??
        fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = []): T[] => {
      const value = t.raw(key);
      return Array.isArray(value) ? (value as T[]) : fallback;
    },
    plural: (count: number, locale = getCurrentLocale()): Intl.LDMLPluralRule =>
      new Intl.PluralRules(locale).select(count),
    localize: (value: unknown, locale = getCurrentLocale()): string =>
      value == null
        ? ""
        : typeof value === "object"
          ? String(
              ((value as Record<string, any>)[locale] ??
                (value as Record<string, any>)[config.defaultLocale] ??
                "") as string | number | boolean,
            )
          : String(value as string | number | boolean),
  },
);

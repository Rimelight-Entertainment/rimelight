import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  <K extends string = string>(key: K | (string & {}), params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T, locale?: string) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, any>): string => {
    const locale = getCurrentLocale();
    let value: unknown = t.raw(key, undefined, locale) ?? key;

    if (
      typeof params?.["count"] === "number" &&
      value instanceof Object &&
      value.constructor === Object
    ) {
      const plurals = value as Record<string, string>;
      value = plurals[t.plural(params["count"], locale)] ?? plurals["other"] ?? key;
    }

    if (typeof value === "function") return (value as (p?: any) => string)(params);

    if (typeof value === "string" && params) {
      return value.replace(/\{(\w+)\}/g, (_, placeholder) => {
        const param = params[placeholder];
        return placeholder === "count" && typeof param === "number"
          ? param.toLocaleString(locale)
          : String(param ?? `{${placeholder}}`);
      });
    }

    return value instanceof Object && value.constructor === Object
      ? JSON.stringify(value)
      : value != null
        ? String(value as string | number | boolean)
        : "";
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, locale = getCurrentLocale()): T => {
      const get = (dict?: Record<string, any>) =>
        dict && (dict[key] ?? key.split(".").reduce((target, segment) => target?.[segment], dict));
      return (get(config.translations[locale]) ??
        get(config.translations[config.defaultLocale]) ??
        fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = []): T[] => {
      const value = t.raw(key);
      return (Array.isArray(value) ? value : fallback) as T[];
    },
    plural: (count: number, locale = getCurrentLocale()): Intl.LDMLPluralRule =>
      new Intl.PluralRules(locale).select(count),
    localize: (value: unknown, locale = getCurrentLocale()): string =>
      value instanceof Object && value.constructor === Object
        ? String(
            (value as Record<string, string>)[locale] ||
              (value as Record<string, string>)[config.defaultLocale] ||
              "",
          )
        : value != null && typeof value !== "object"
          ? String(value as string | number | boolean)
          : "",
  },
);

import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  <K extends string = string>(key: K | (string & {}), params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pluralRules = new Map<string, Intl.PluralRules>();
const numberFormats = new Map<string, Intl.NumberFormat>();

const resolve = (key: string, locale = getCurrentLocale()): unknown => {
  const get = (dict?: Record<string, unknown>) =>
    dict?.[key] ??
    key.split(".").reduce<unknown>((target: any, segment) => target?.[segment], dict);
  return get(config.translations[locale]) ?? get(config.translations[config.defaultLocale]);
};

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, any>): string => {
    const locale = getCurrentLocale();
    let value = resolve(key, locale) ?? key;

    if (params && typeof params["count"] === "number" && isRecord(value)) {
      value = value[t.plural(params["count"], locale)] ?? value["other"] ?? key;
    }

    if (typeof value === "function") return value(params);

    if (typeof value === "string" && params) {
      return value.replace(/\{(\w+)\}/g, (_, placeholder) => {
        const param = params[placeholder];
        if (placeholder === "count" && typeof param === "number") {
          let formatter = numberFormats.get(locale);
          if (!formatter) numberFormats.set(locale, (formatter = new Intl.NumberFormat(locale)));
          return formatter.format(param);
        }
        return String(param ?? `{${placeholder}}`);
      });
    }

    if (isRecord(value)) return JSON.stringify(value);
    return value != null ? String(value as string | number | boolean) : "";
  },
  {
    raw: <T = unknown>(key: string, fallback?: T): T => (resolve(key) ?? fallback) as T,
    array: <T = string>(key: string, fallback: T[] = []): T[] => {
      const value = resolve(key);
      return (Array.isArray(value) ? value : fallback) as T[];
    },
    plural: (count: number, locale = getCurrentLocale()): Intl.LDMLPluralRule => {
      let rules = pluralRules.get(locale);
      if (!rules) pluralRules.set(locale, (rules = new Intl.PluralRules(locale)));
      return rules.select(count);
    },
    localize: (value: unknown, locale = getCurrentLocale()): string => {
      if (isRecord(value)) return String(value[locale] || value[config.defaultLocale] || "");
      return value != null && typeof value !== "object"
        ? String(value as string | number | boolean)
        : "";
    },
  },
);

import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  <K extends string = string>(key: K | (string & {}), params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (val: unknown, locale?: string) => string;
}

const isRecord = (v: any): v is Record<string, any> =>
  v && typeof v === "object" && !Array.isArray(v);
const numberFormats = new Map<string, Intl.NumberFormat>();

const getVal = (dict: any, path: string): unknown =>
  dict && (path in dict ? dict[path] : path.split(".").reduce((acc, p) => acc?.[p], dict));

const resolveKey = (key: string, locale = getCurrentLocale()): unknown =>
  getVal(config.translations[locale], key) ??
  (locale !== config.defaultLocale
    ? getVal(config.translations[config.defaultLocale], key)
    : undefined);

export const getPluralCategory = (count: number, locale = "en"): Intl.LDMLPluralRule =>
  new Intl.PluralRules(locale).select(count);

export const t: TFunction = Object.assign(
  function t(key: string, params?: Record<string, any>): string {
    if (!key.includes(".")) return key;

    const locale = getCurrentLocale();
    let val = resolveKey(key, locale) ?? key;

    if (params && typeof params["count"] === "number" && isRecord(val)) {
      val = val[getPluralCategory(params["count"], locale)] ?? val["other"] ?? key;
    }

    if (typeof val === "function") return val(params);

    if (typeof val === "string") {
      return params
        ? val.replace(/\{(\w+)\}/g, (_, k) => {
            const p = params[k];
            if (p === undefined) return `{${k}}`;
            if (k === "count" && typeof p === "number") {
              if (!numberFormats.has(locale))
                numberFormats.set(locale, new Intl.NumberFormat(locale));
              return numberFormats.get(locale)!.format(p);
            }
            return String(p);
          })
        : val;
    }

    return isRecord(val)
      ? JSON.stringify(val)
      : val != null
        ? String(val as string | number | boolean)
        : "";
  },
  {
    raw: <T = unknown>(key: string, fallback?: T): T => (resolveKey(key) ?? fallback) as T,
    array: <T = string>(key: string, fallback: T[] = []): T[] => {
      const v = resolveKey(key);
      return Array.isArray(v) ? (v as T[]) : fallback;
    },
    plural: (count: number, locale?: string) =>
      getPluralCategory(count, locale ?? getCurrentLocale()),
    localize: (val: unknown, locale = getCurrentLocale()): string => {
      if (isRecord(val)) {
        const loc = val[locale] || val[config.defaultLocale];
        return typeof loc === "string" ? loc : "";
      }
      return val != null && typeof val !== "object" ? String(val as string | number | boolean) : "";
    },
  },
);

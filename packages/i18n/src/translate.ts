import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  <K extends string = string>(key: K | (string & {}), params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (val: unknown, locale?: string) => string;
}

const isRecord = (v: unknown): v is Record<string, any> =>
  Boolean(v && typeof v === "object" && !Array.isArray(v));

const cache = new Map<string, any>();
const intl = (type: "p" | "n", loc: string) =>
  cache.get(type + loc) ??
  cache
    .set(type + loc, type === "p" ? new Intl.PluralRules(loc) : new Intl.NumberFormat(loc))
    .get(type + loc);

const resolve = (key: string, loc = getCurrentLocale()): unknown => {
  const get = (d: any) => d?.[key] ?? key.split(".").reduce((a, p) => a?.[p], d);
  return get(config.translations[loc]) ?? get(config.translations[config.defaultLocale]);
};

export const getPluralCategory = (count: number, locale = "en"): Intl.LDMLPluralRule =>
  intl("p", locale).select(count);

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, any>): string => {
    if (!key.includes(".")) return key;
    const loc = getCurrentLocale();
    let val = resolve(key, loc) ?? key;

    if (params && typeof params["count"] === "number" && isRecord(val)) {
      val = val[getPluralCategory(params["count"], loc)] ?? val["other"] ?? key;
    }
    if (typeof val === "function") return val(params);
    if (typeof val === "string" && params) {
      return val.replace(/\{(\w+)\}/g, (_, k) =>
        k === "count" && typeof params[k] === "number"
          ? intl("n", loc).format(params[k])
          : String(params[k] ?? `{${k}}`),
      );
    }
    return isRecord(val)
      ? JSON.stringify(val)
      : val != null
        ? String(val as string | number | boolean)
        : "";
  },
  {
    raw: <T = unknown>(k: string, fb?: T): T => (resolve(k) ?? fb) as T,
    array: <T = string>(k: string, fb: T[] = []): T[] =>
      (Array.isArray(resolve(k)) ? resolve(k) : fb) as T[],
    plural: (c: number, loc?: string) => getPluralCategory(c, loc ?? getCurrentLocale()),
    localize: (v: unknown, loc = getCurrentLocale()): string =>
      isRecord(v)
        ? String(v[loc] || v[config.defaultLocale] || "")
        : v != null && typeof v !== "object"
          ? String(v as string | number | boolean)
          : "",
  },
);

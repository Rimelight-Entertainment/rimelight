import { config, getCurrentLocale } from "./locale";

export interface TFunction {
  (key: string, params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T, locale?: string) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

const plurals = new Map<string, Intl.PluralRules>();

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, any>): string => {
    const loc = getCurrentLocale();
    let val: unknown = t.raw(key, undefined, loc);

    if (typeof params?.["count"] === "number") {
      const cat = t.plural(params["count"], loc);
      if (val && typeof val === "object")
        val = (val as Record<string, any>)[cat] ?? (val as Record<string, any>)["other"];
      else if (val === undefined)
        val = t.raw(`${key}.${cat}`, undefined, loc) ?? t.raw(`${key}.other`, undefined, loc);
    }
    val = val ?? key;

    if (typeof val === "function") return (val as (p?: any) => string)(params);
    if (typeof val === "string") {
      return params
        ? val.replace(/\{(\w+)\}/g, (_: string, k: string) =>
            k === "count" && typeof params[k] === "number"
              ? (params[k] as number).toLocaleString(loc)
              : String(params[k] ?? `{${k}}`),
          )
        : val;
    }
    return val && typeof val === "object"
      ? JSON.stringify(val)
      : val != null
        ? String(val as string | number | boolean)
        : "";
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, loc = getCurrentLocale()): T => {
      const get = (dict?: Record<string, any>) =>
        dict && (key in dict ? dict[key] : key.split(".").reduce((acc, p) => acc?.[p], dict));
      return (get(config.translations[loc]) ??
        get(config.translations[config.defaultLocale]) ??
        fallback) as T;
    },
    array: <T = string>(key: string, fallback: T[] = []): T[] => {
      const val = t.raw(key);
      return Array.isArray(val) ? (val as T[]) : fallback;
    },
    plural: (count: number, loc = getCurrentLocale()): Intl.LDMLPluralRule =>
      (plurals.get(loc) ?? plurals.set(loc, new Intl.PluralRules(loc)).get(loc)!).select(count),
    localize: (val: unknown, loc = getCurrentLocale()): string =>
      val && typeof val === "object"
        ? String(
            (val as Record<string, any>)[loc] ||
              (val as Record<string, any>)[config.defaultLocale] ||
              "",
          )
        : val != null && typeof val !== "object"
          ? String(val as string | number | boolean)
          : "",
  },
);

import generatedConfig from "#rimelight/i18n";
import { defaultLocale, getCurrentLocale, setLocaleConfig } from "./locale";

export interface TFunction {
  (key: string, params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
}

export let translations: Record<string, Record<string, any>> = generatedConfig?.translations
  ? { ...generatedConfig.translations }
  : {};

export function isObjectRecord(obj: unknown): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null;
}

/** Test/runtime helper to set in-memory translations. */
export function setTranslations(
  data: Record<string, Record<string, any>>,
  options?: {
    defaultLocale?: string;
    locales?: string[];
    prefixDefaultLocale?: boolean;
    skipPaths?: string[];
  },
): void {
  translations = { ...data };
  if (options) {
    setLocaleConfig(options);
  }
}

/** Resolves dot-notation or array paths inside a translation dictionary. */
export function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  if (Object.hasOwn(obj, path)) {
    return (obj as Record<string, unknown>)[path];
  }

  const segments = path.split(".");
  let current: any = obj;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    if (current == null || typeof current !== "object") return undefined;

    if (Object.hasOwn(current, segment) || (Array.isArray(current) && segment in current)) {
      current = current[segment];
    } else {
      const literalKey = segments.slice(i).join(".");
      return Object.hasOwn(current, literalKey) ? current[literalKey] : undefined;
    }
  }

  return current;
}

function resolveKey(key: string, targetLocale: string): unknown {
  const dotIndex = key.indexOf(".");
  const component = dotIndex === -1 ? key : key.slice(0, dotIndex);
  const subKey = dotIndex === -1 ? undefined : key.slice(dotIndex + 1);

  // 1. Try target locale
  const targetDict = translations[targetLocale];
  if (isObjectRecord(targetDict)) {
    const compData = targetDict[component];
    if (compData !== undefined) {
      const val = subKey === undefined ? compData : resolvePath(compData, subKey);
      if (val !== undefined) return val;
    }
  }

  // 2. Fallback to default locale
  if (targetLocale !== defaultLocale) {
    const defaultDict = translations[defaultLocale];
    if (isObjectRecord(defaultDict)) {
      const compData = defaultDict[component];
      if (compData !== undefined) {
        const val = subKey === undefined ? compData : resolvePath(compData, subKey);
        if (val !== undefined) return val;
      }
    }
  }

  return undefined;
}

function tRaw<T = unknown>(key: string, fallback?: T): T {
  const targetLocale = getCurrentLocale() || defaultLocale;
  const val = resolveKey(key, targetLocale);
  return val !== undefined ? (val as T) : (fallback as T);
}

function tArray<T = string>(key: string, fallback: T[] = []): T[] {
  const targetLocale = getCurrentLocale() || defaultLocale;
  const val = resolveKey(key, targetLocale);
  return Array.isArray(val) ? (val as T[]) : fallback;
}

export function getPluralCategory(count: number, targetLocale: string = "en"): Intl.LDMLPluralRule {
  return new Intl.PluralRules(targetLocale).select(count);
}

const numberFormats = new Map<string, Intl.NumberFormat>();

function formatNumber(locale: string, value: number): string {
  let formatter = numberFormats.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormats.set(locale, formatter);
  }
  return formatter.format(value);
}

export const t: TFunction = Object.assign(
  function t(key: string, params?: Record<string, any>): string {
    const dotIndex = key.indexOf(".");
    if (dotIndex === -1) return key;

    const targetLocale = getCurrentLocale() || defaultLocale;
    let value = resolveKey(key, targetLocale) ?? key;

    // Pluralization
    if (
      params &&
      typeof params["count"] === "number" &&
      isObjectRecord(value) &&
      !Array.isArray(value)
    ) {
      value = value[getPluralCategory(params["count"], targetLocale)] ?? value["other"] ?? key;
    }

    if (typeof value === "function") {
      return (value as (p?: Record<string, any>) => string)(params);
    }

    if (typeof value === "string") {
      return params
        ? value.replace(/\{(\w+)\}/g, (_, name) => {
            const param = params[name];
            if (param === undefined) return `{${name}}`;
            return name === "count" && typeof param === "number"
              ? formatNumber(targetLocale, param)
              : String(param);
          })
        : value;
    }

    if (isObjectRecord(value)) return JSON.stringify(value);
    return value != null ? String(value as string | number | boolean) : "";
  },
  {
    raw: tRaw,
    array: tArray,
    plural: (count: number, locale?: string) =>
      getPluralCategory(count, locale ?? getCurrentLocale()),
  },
);

export function getLocalizedText(
  val: unknown,
  targetLocale: string,
  fallbackLocale: string = "en",
): string {
  if (isObjectRecord(val)) {
    const localized = val[targetLocale];
    if (typeof localized === "string" && localized.length > 0) return localized;

    const fallback = val[fallbackLocale];
    if (typeof fallback === "string") return fallback;
    return "";
  }
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}

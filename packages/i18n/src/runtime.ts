import { config } from "virtual:rimelight-i18n";
import { PLACEHOLDER } from "./placeholders";
import type { LocaleInfo, LocaleOptions, TFunction } from "./types";

const translations: Record<string, Record<string, unknown>> = config?.translations ?? {};

const configuredLocales = config?.locales;
const localeOptions: Record<string, LocaleOptions> =
  configuredLocales && !Array.isArray(configuredLocales)
    ? Object.fromEntries(
        Object.entries(configuredLocales as Record<string, string | LocaleOptions>).map(
          ([k, v]) => [k, typeof v === "string" ? { tag: v } : v],
        ),
      )
    : {};

interface ActiveI18nConfig {
  locales: string[];
  defaultLocale: string;
  prefixDefaultLocale: boolean;
  skipPaths: string[];
  translations: Record<string, Record<string, unknown>>;
}

export const activeConfig: ActiveI18nConfig = {
  locales: configuredLocales
    ? Array.isArray(configuredLocales)
      ? [...(configuredLocales as readonly string[])]
      : Object.keys(configuredLocales)
    : Object.keys(translations).length
      ? Object.keys(translations).sort()
      : ["en"],
  defaultLocale: config?.defaultLocale ?? "en",
  prefixDefaultLocale: config?.prefixDefaultLocale ?? true,
  skipPaths: [...(config?.skipPaths ?? ["/api", "/_", "/.well-known", "/cdn-cgi"])],
  translations,
};

interface LocaleIndex {
  /** The `activeConfig.locales` array this index was built from. Rebuilt when it is replaced. */
  source: readonly string[];
  byLowerCase: Map<string, string>;
  /** Matches a leading locale segment, e.g. `/pt-BR/` in `/pt-BR/about`. */
  prefix: RegExp;
}

let index: LocaleIndex | undefined;

const localeIndex = (): LocaleIndex => {
  if (index?.source !== activeConfig.locales) {
    const locales = activeConfig.locales;
    index = {
      source: locales,
      byLowerCase: new Map(locales.map((l) => [l.toLowerCase(), l])),
      prefix: new RegExp(
        `^/(?:${locales.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?=[/?#]|$)`,
        "i",
      ),
    };
  }
  return index;
};

/** The configured locale whose code equals `value`, ignoring case. `undefined` when none does. */
export const matchLocale = (value: string | undefined): string | undefined =>
  value ? localeIndex().byLowerCase.get(value.toLowerCase()) : undefined;

let resolveRequestLocale: (() => string | undefined) | undefined;

/**
 * Lets server code resolve the locale per request (e.g. from AsyncLocalStorage). The middleware
 * registers itself when `i18n()` is called; without it, `getCurrentLocale()` skips this step.
 */
export const registerLocaleResolver = (resolve: () => string | undefined): void => {
  resolveRequestLocale = resolve;
};

let currentLocale: string | undefined;

const resolveBrowserLocale = (): string | undefined => {
  const fromPath =
    typeof window !== "undefined"
      ? matchLocale(window.location?.pathname?.split("/")[1])
      : undefined;
  if (fromPath) return fromPath;

  const lang = typeof document !== "undefined" ? document.documentElement?.lang : undefined;
  return lang ? (matchLocale(lang) ?? lang) : undefined;
};

/** Returns the supported locale codes. */
export const getLocales = (): string[] => [...activeConfig.locales];

const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ckb"]);
const localeInfoCache = new Map<string, LocaleInfo>();

/**
 * Tag, display name and direction for a locale (default: the current one).
 * Derived with `Intl` unless overridden in the i18n config.
 */
export const getLocaleInfo = (code: string = getCurrentLocale()): LocaleInfo => {
  const cached = localeInfoCache.get(code);
  if (cached) return cached;

  const options = localeOptions[code] ?? {};
  let tag = options.tag;
  let label = options.label;
  try {
    if (!tag) {
      const locale = new Intl.Locale(code);
      const region = locale.region ?? locale.maximize().region;
      tag = region ? `${locale.language}-${region}` : code;
    }
    if (!label) {
      const name = new Intl.DisplayNames([code], { type: "language" }).of(code);
      label = name ? name.charAt(0).toLocaleUpperCase(code) + name.slice(1) : code;
    }
  } catch {
    tag ??= code;
    label ??= code;
  }
  const dir = options.dir ?? (RTL_LANGUAGES.has(code.split("-")[0]!.toLowerCase()) ? "rtl" : "ltr");

  const info: LocaleInfo = { code, tag: tag!, label: label!, dir };
  localeInfoCache.set(code, info);
  return info;
};

/** Returns the default locale code. */
export const getDefaultLocale = (): string => activeConfig.defaultLocale;

/** Returns the active locale code. */
export const getCurrentLocale = (): string =>
  resolveRequestLocale?.() ?? currentLocale ?? resolveBrowserLocale() ?? activeConfig.defaultLocale;

/** Sets the active locale code. */
export const setCurrentLocale = (locale: string): void => {
  currentLocale = locale;
};

/** Whether a pathname is left out of locale handling (API, internals, files). Shared with the middleware. */
export const isSkippedPath = (pathname: string): boolean =>
  /\.[a-z0-9]{1,16}$/i.test(pathname) ||
  activeConfig.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`));

/** Generates a localized relative URL path. External, hash, skipped and file paths are returned unchanged. */
export const getLocaleUrl = (path: string, locale: string = getCurrentLocale()): string => {
  const { defaultLocale, prefixDefaultLocale } = activeConfig;

  if (/^(?:[a-z]+:|\/\/|#)/i.test(path) || isSkippedPath(path.split(/[?#]/)[0]!)) return path;

  const rest = path.replace(localeIndex().prefix, "").replace(/^\/+/, ""); // drop an existing locale prefix
  const prefix = prefixDefaultLocale || locale !== defaultLocale ? `/${locale}` : "";

  return `${prefix}/${rest}`;
};

/** Resolves an asset for the current or fallback locale. */
export const getLocaleAsset = <T>(
  assets: Record<string, T>,
  locale: string = getCurrentLocale(),
): T => (assets[locale] ?? assets[activeConfig.defaultLocale]) as T;

const pluralRules = new Map<string, Intl.PluralRules>();

const rulesFor = (locale: string): Intl.PluralRules => {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules;
};

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
      return resolved.replace(PLACEHOLDER, (match, paramKey: string) => {
        const val = Object.hasOwn(params, paramKey) ? params[paramKey] : undefined;
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
      // hasOwn, not `in`: plain objects inherit `constructor`, `toString`, etc.
      const get = (loc: string) => {
        if (!Object.hasOwn(activeConfig.translations, loc)) return undefined;
        const dict = activeConfig.translations[loc]!;
        if (Object.hasOwn(dict, key)) return dict[key];
        return key
          .split(".")
          .reduce<unknown>(
            (d, part) =>
              d && typeof d === "object" && Object.hasOwn(d, part)
                ? (d as Record<string, unknown>)[part]
                : undefined,
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
      rulesFor(locale).select(count),
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

import { config } from "virtual:rimelight-i18n";
import { chunkId, PLACEHOLDER } from "./shared";
import type { LocaleInfo, LocaleOptions, TFunction } from "./types";

type NamespaceLoader = () => Promise<{ default: Record<string, unknown> }>;

/** What plugin.ts generates into the virtual module. */
interface VirtualI18nConfig {
  defaultLocale?: string;
  translations?: Record<string, Record<string, unknown>>;
  routeBuckets?: Record<string, string[]>;
  globalBuckets?: string[];
  /** Each bucket's own keys, per locale. */
  namespaces?: Record<string, Record<string, NamespaceLoader>>;
  /** Each bucket's default-locale values that a locale lacks. Only present where there are some. */
  fallbacks?: Record<string, Record<string, NamespaceLoader>>;
  patterns?: Array<[string, RegExp]>;
  /** Chunks in memory, by chunk id: the locale they merge into and their values. */
  loaded?: Map<string, LoadedChunk>;
  /** Set on the server config during `vite dev`, which has no build manifest. */
  devServer?: boolean;
}

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
  devServer: boolean;
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
  devServer: (config as VirtualI18nConfig | undefined)?.devServer ?? false,
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

const merge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> => {
  for (const [key, value] of Object.entries(source)) {
    if (key === "__proto__") continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      merge((target[key] ??= {}) as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
};

const warnedMissing = new Set<string>();

/**
 * Whether any chunk of a locale is in memory. Reads the `loaded` map on the shared config, not a
 * module-level one, because some bundles carry their own copy of this module.
 */
const localeLoaded = (locale: string): boolean =>
  [...((config as VirtualI18nConfig | undefined)?.loaded?.values() ?? [])].some(
    (chunk) => chunk.locale === locale,
  );

/** One fetchable chunk: its id, the locale its keys merge into, and how to load it. */
interface Chunk {
  id: string;
  locale: string;
  load: NamespaceLoader;
}

interface LoadedChunk {
  locale: string;
  data: Record<string, unknown>;
}

/**
 * Loads translations per URL. A URL needs, per route bucket, its locale's own keys and, when the
 * locale lacks some, the default-locale values for exactly those keys. Nothing else.
 */
const createLoader = (cfg: VirtualI18nConfig) => {
  const loaded = (cfg.loaded ??= new Map<string, LoadedChunk>());
  const dicts = (cfg.translations ??= {});
  const defaultLocale = cfg.defaultLocale ?? "en";
  /** Each chunk's fetch, in flight or done. */
  const fetches = new Map<string, Promise<void>>();

  /** The locale a URL renders in: the one in its first segment, otherwise the default. */
  const localeOf = (pathname: string): string =>
    matchLocale(pathname.split("/")[1]) ?? defaultLocale;

  /** The buckets a URL needs: the global ones, and those of every route matching it (or the 404 route). */
  const bucketsOf = (pathname: string): Set<string> => {
    const routeBuckets = cfg.routeBuckets ?? {};
    const patterns = cfg.patterns ?? [];
    const matched = patterns.filter(([, re]) => re.test(pathname)).map(([key]) => key);
    const keys = matched.length
      ? matched
      : patterns.map(([key]) => key).filter((key) => key === "404" || key.endsWith("/404"));
    return new Set([
      ...(cfg.globalBuckets ?? []),
      ...keys.flatMap((key) => routeBuckets[key] ?? []),
    ]);
  };

  /** The chunks of one bucket in one locale. A locale that has every key of the bucket has no fallback chunk. */
  const chunksOfBucket = (bucket: string, locale: string): Chunk[] => {
    const chunks: Chunk[] = [];
    const own = cfg.namespaces?.[bucket]?.[locale];
    if (own) chunks.push({ id: chunkId(bucket, locale, false), locale, load: own });
    const missing = cfg.fallbacks?.[bucket]?.[locale];
    if (missing) chunks.push({ id: chunkId(bucket, locale, true), locale, load: missing });
    return chunks;
  };

  const chunksOf = (pathname: string): Chunk[] => {
    const locale = localeOf(pathname);
    return [...bucketsOf(pathname)].flatMap((bucket) => chunksOfBucket(bucket, locale));
  };

  /** Merges a chunk's translations into its locale, and records them so payloads can carry them. */
  const absorb = (id: string, locale: string, data: Record<string, unknown>): void => {
    merge((dicts[locale] ??= {}), data);
    loaded.set(id, { locale, data });
  };

  /** Each chunk is fetched once. A failed fetch is forgotten, so the next attempt retries it. */
  const loadChunk = ({ id, locale, load }: Chunk): Promise<void> => {
    if (loaded.has(id)) return Promise.resolve();
    let fetch = fetches.get(id);
    if (!fetch) {
      fetch = load().then(
        (mod) => absorb(id, locale, mod.default),
        (error) => {
          fetches.delete(id);
          throw error;
        },
      );
      fetches.set(id, fetch);
    }
    return fetch;
  };

  return {
    isPathnameLoaded: (pathname: string): boolean =>
      chunksOf(pathname).every(({ id }) => loaded.has(id)),
    loadPathname: async (pathname: string): Promise<void> => {
      await Promise.all(chunksOf(pathname).map(loadChunk));
    },
    /** The translations a URL renders with, as plain data. The server hands this to the client. */
    payloadOf: (pathname: string): TranslationPayload => ({
      locale: localeOf(pathname),
      chunks: Object.fromEntries(
        chunksOf(pathname).map(({ id }) => [id, loaded.get(id)?.data ?? {}]),
      ),
    }),
    /** Takes in a payload: its translations are merged, and its chunks count as loaded. Fetches nothing. */
    applyPayload: (payload: TranslationPayload): void => {
      for (const [id, data] of Object.entries(payload.chunks)) absorb(id, payload.locale, data);
    },
    /** Every chunk of one locale, for whole-dictionary consumers such as `/locales/:locale.json`. */
    loadLocale: async (locale: string): Promise<void> => {
      const buckets = new Set([
        ...Object.keys(cfg.namespaces ?? {}),
        ...Object.keys(cfg.fallbacks ?? {}),
      ]);
      await Promise.all([...buckets].flatMap((b) => chunksOfBucket(b, locale)).map(loadChunk));
    },
  };
};

const defaultLoader = createLoader((config ?? {}) as VirtualI18nConfig);

/** Whether everything `loadPathname` would load for a URL is already in. Always `true` on the server. */
export const isPathnameLoaded: (pathname: string) => boolean = defaultLoader.isPathnameLoaded;

/** Loads the namespaces a URL needs, for the locale in its path (or the default). */
export const loadPathname: (pathname: string) => Promise<void> = defaultLoader.loadPathname;

/** A URL's translations as plain data: its locale, and each chunk's values by chunk id. */
export interface TranslationPayload {
  locale: string;
  chunks: Record<string, Record<string, unknown>>;
}

/** The payload for a URL, once `loadPathname` has loaded it. */
export const payloadOf: (pathname: string) => TranslationPayload = defaultLoader.payloadOf;

/** Takes in a payload, so the client renders the server's translations without fetching them. */
export const applyPayload: (payload: TranslationPayload) => void = defaultLoader.applyPayload;

/** Loads every namespace of one locale. Server only: the middleware calls it for `/locales/:locale.json`. */
export const loadLocale: (locale: string) => Promise<void> = defaultLoader.loadLocale;

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

  // `<html lang>` carries the full tag (`pt-BR`); the configured code is its base (`pt`).
  const lang = typeof document !== "undefined" ? document.documentElement?.lang : undefined;
  return lang ? (matchLocale(lang) ?? matchLocale(lang.split("-")[0])) : undefined;
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

/** A key in one locale's dictionary: the flat key first, then the dotted path. `undefined` when absent. */
const lookup = (locale: string, key: string): unknown => {
  // hasOwn, not `in`: plain objects inherit `constructor`, `toString`, etc.
  if (!Object.hasOwn(activeConfig.translations, locale)) return undefined;
  const dict = activeConfig.translations[locale]!;
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

/** Fills `{name}` placeholders. A placeholder without a param is left as written. */
const fillPlaceholders = (text: string, params: Record<string, unknown>, locale: string): string =>
  text.replace(PLACEHOLDER, (match, name: string) => {
    const val = Object.hasOwn(params, name) ? params[name] : undefined;
    if (val == null) return match;
    return name === "count" && typeof val === "number"
      ? val.toLocaleString(locale)
      : String(val as string | number | boolean);
  });

export const t: TFunction = Object.assign(
  (key: string, params?: Record<string, unknown>, locale = getCurrentLocale()): string => {
    let value: unknown = t.raw(key, undefined, locale);

    // A numeric `count` picks the plural form, falling back to `other`.
    if (typeof params?.["count"] === "number" && value && typeof value === "object") {
      const forms = value as Record<string, unknown>;
      value = forms[t.plural(params["count"], locale)] ?? forms["other"] ?? value;
    }

    const resolved = value ?? key;
    if (typeof resolved === "function") return String(resolved(params));
    if (typeof resolved === "string" && params) return fillPlaceholders(resolved, params, locale);
    return typeof resolved === "object" && resolved
      ? JSON.stringify(resolved)
      : String(resolved as string | number | boolean);
  },
  {
    raw: <T = unknown>(key: string, fallback?: T, locale = getCurrentLocale()): T => {
      const val = lookup(locale, key) ?? lookup(activeConfig.defaultLocale, key);
      if (val === undefined && activeConfig.devServer && !localeLoaded(locale)) {
        const id = `${locale} ${key}`;
        if (!warnedMissing.has(id)) {
          warnedMissing.add(id);
          console.warn(
            `[i18n] "${key}" is read in "${locale}", which isn't loaded. Await loadLocale("${locale}") first.`,
          );
        }
      }
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

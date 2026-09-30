import type {
  ComponentsJSON,
  TranslationLoader,
  KVNamespaceBinding,
  TranslationKey,
  CustomTranslations,
  NestedTranslationKeys,
  ReadableAtom,
  WritableAtom
} from "./types";
import {
  atom,
  t as baseT,
  tRaw as baseTRaw,
  tArray as baseTArray,
  getRawTranslation,
  currentLocale,
  initializeI18n,
  getPluralCategory
} from "./runtime";
// Only the *types* from `./plugin` are imported here. The `i18n` Vite plugin
// factory is Node-only (it uses `node:fs` / `node:path` / `node:child_process`),
// so re-exporting it from this runtime entry would drag those Node built-ins
// into the browser bundle. Import it from `@rimelight/i18n/plugin` in your
// `vite.config.ts` instead.
import type { RimelightI18nOptions, RimelightI18nPlugins } from "./plugin";

let locales: string[] = ["en"];
let defaultLocale: string = "en";
let prefixDefaultLocale: boolean = true;
let translations: Record<string, any> = {};

try {
  const cfg = await import("virtual:rimelight-i18n-config");
  if (cfg) {
    if (cfg.locales) locales = cfg.locales;
    if (cfg.defaultLocale) defaultLocale = cfg.defaultLocale;
    if (cfg.prefixDefaultLocale !== undefined) prefixDefaultLocale = cfg.prefixDefaultLocale;
    if (cfg.translations) translations = cfg.translations;
  }
} catch {
  // Virtual module is resolved inside Vite during app bundle, not in Node config evaluation
}

// Auto-initialize runtime state from Vite plugin config
if (translations && Object.keys(translations).length > 0) {
  initializeI18n({
    defaultLocale: defaultLocale || "en",
    translations,
    get: createTranslationLoader(translations)
  });
}

export {
  atom,
  currentLocale,
  initializeI18n,
  locales,
  defaultLocale,
  prefixDefaultLocale,
  baseTRaw as tRaw,
  baseTArray as tArray,
  getRawTranslation,
  getPluralCategory
};
export type { RimelightI18nOptions, RimelightI18nPlugins };
export type {
  TranslationKey,
  CustomTranslations,
  NestedTranslationKeys,
  ReadableAtom,
  WritableAtom
};

export interface TFunction {
  <K extends string = TranslationKey>(
    key: K | TranslationKey,
    params?: Record<string, any>
  ): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
}

/**
 * Translates a single string key using dot-notation (e.g. `t("page_home.section_hero_title")`).
 * When augmented via CustomTranslations, keys are strictly type-checked and autocompleted. Also
 * provides `t.raw()` and `t.array()` methods to retrieve structured data or string arrays.
 */
export const t: TFunction = Object.assign(
  function <K extends string = TranslationKey>(
    key: K | TranslationKey,
    params?: Record<string, any>
  ): string {
    return baseT(key, params);
  },
  {
    raw: baseTRaw,
    array: baseTArray
  }
);

export function getLocale(): string {
  return currentLocale.get() || defaultLocale || "en";
}

/**
 * Returns a standard BCP 47 / RFC 5646 language tag suitable for HTML `<html lang="...">`. Maps
 * 2-letter codes like 'en' to 'en-US', 'pt' to 'pt-BR', 'es' to 'es-ES', etc.
 */
export function getHtmlLang(): string {
  const loc = getLocale();
  const langMap: Record<string, string> = {
    en: "en-US",
    pt: "pt-BR",
    es: "es-ES"
  };
  return langMap[loc] || loc;
}

/**
 * Returns an OpenGraph-compliant locale tag (e.g. 'en_US', 'pt_BR', 'es_ES').
 */
export function getOgLocale(): string {
  const loc = getLocale();
  const ogMap: Record<string, string> = {
    en: "en_US",
    pt: "pt_BR",
    es: "es-ES"
  };
  return ogMap[loc] || `${loc}_${loc.toUpperCase()}`;
}

export function getRelativeLocaleUrl(path: string): string;
export function getRelativeLocaleUrl(locale: string, path: string): string;
export function getRelativeLocaleUrl(arg1: string, arg2?: string): string {
  let targetLocale: string;
  let targetPath: string;

  if (arg2 !== undefined) {
    targetLocale = arg1;
    targetPath = arg2;
  } else {
    targetLocale = getLocale();
    targetPath = arg1;
  }

  // Handle external / absolute URLs or hash / mailto / tel directly
  if (
    /^(?:[a-z]+:|\/\/|#)/i.test(targetPath) ||
    targetPath.startsWith("mailto:") ||
    targetPath.startsWith("tel:")
  ) {
    return targetPath;
  }

  const [pathWithoutQueryAndHash, queryAndHash] = (() => {
    const match = targetPath.match(/^([^?#]*)([?#].*)?$/);
    return [match?.[1] ?? "", match?.[2] ?? ""];
  })();

  const rawCleanPath = pathWithoutQueryAndHash.replace(/^\/+/, "");
  const segments = rawCleanPath ? rawCleanPath.split("/") : [];

  // If the path already begins with a known locale (e.g. /en/about), strip it
  if (segments.length > 0 && locales.includes(segments[0]!)) {
    segments.shift();
  }

  const cleanPath = segments.join("/");
  const shouldPrefix = prefixDefaultLocale || targetLocale !== defaultLocale;
  const prefix = shouldPrefix ? `/${targetLocale}` : "";

  if (!cleanPath) {
    // Return root path with trailing slash if prefix is present: e.g. /en/
    return `${prefix ? `${prefix}/` : "/"}${queryAndHash}`;
  }

  const hasTrailingSlash = pathWithoutQueryAndHash.endsWith("/");
  const formattedPath = `${prefix}/${cleanPath}${hasTrailingSlash ? "/" : ""}`;
  return `${formattedPath}${queryAndHash}`;
}

export function getRelativeLocaleUrlList(path: string = "/"): string[] {
  return locales.map((locale) => getRelativeLocaleUrl(locale, path));
}

export interface LanguageAlternate {
  hreflang: string;
  href: string;
}

/**
 * Generates an array of hreflang alternates for SEO tags (<link rel="alternate" hreflang="...">).
 * Automatically includes all supported locales and 'x-default'.
 */
export function getLanguageAlternates(pathname: string, siteUrl: string = ""): LanguageAlternate[] {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const alternates: LanguageAlternate[] = locales.map((loc) => ({
    hreflang: loc,
    href: `${normalizedSiteUrl}${getRelativeLocaleUrl(loc, pathname)}`
  }));

  alternates.push({
    hreflang: "x-default",
    href: `${normalizedSiteUrl}${getRelativeLocaleUrl(defaultLocale, pathname)}`
  });

  return alternates;
}

let kvBinding: KVNamespaceBinding | null = null;

export function setKVBinding(kv: KVNamespaceBinding) {
  kvBinding = kv;
}

export function createTranslationLoader(
  translations: Record<string, ComponentsJSON>
): TranslationLoader {
  return async (locale, components) => {
    const localeTranslations = translations[locale] || {};

    // If components is not provided, is not an array, or is empty, return the entire locale's translations.
    if (!components || !Array.isArray(components) || components.length === 0) {
      return localeTranslations;
    }

    const activeKv = kvBinding;
    if (activeKv) {
      try {
        const results = await Promise.all(
          components.map(async (name) => {
            const key = `locale:${locale}:${name}`;
            const data = await activeKv.get(key, "json");
            // Fall back to bundled translation for this component if missing in KV
            if (data == null) {
              return { [name]: localeTranslations[name] ?? {} };
            }
            return { [name]: data };
          })
        );
        return Object.assign({}, ...results);
      } catch {
        // KV read failed — fall through to static
      }
    }

    const results = await Promise.all(
      components.map(async (name) => {
        const data = localeTranslations[name];
        return { [name]: data ?? {} };
      })
    );
    return Object.assign({}, ...results);
  };
}

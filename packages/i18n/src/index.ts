import { currentLocale } from "./runtime";
import { locales, defaultLocale, prefixDefaultLocale } from "./config";

export {
  atom,
  t,
  currentLocale,
  initializeI18n,
  tRaw,
  tArray,
  getRawTranslation,
  getPluralCategory,
} from "./runtime";
export { setKVBinding, createTranslationLoader } from "./kv";
export { locales, defaultLocale, prefixDefaultLocale } from "./config";
export { getLocalizedText } from "./utils";

// Only the *types* from `./plugin` are re-exported here. The `i18n` Vite plugin
// factory is Node-only (it uses `node:fs` / `node:path` / `node:child_process`),
// so re-exporting it from this runtime entry would drag those Node built-ins
// into the browser bundle. Import it from `@rimelight/i18n/plugin` in your
// `vite.config.ts` instead.
export type { RimelightI18nOptions, RimelightI18nPlugins } from "./plugin";
export type {
  TranslationKey,
  CustomTranslations,
  NestedTranslationKeys,
  ReadableAtom,
  WritableAtom,
  TFunction,
} from "./types";

/**
 * Returns the first path segment of a pathname if it is one of the configured locales
 * (compared case-insensitively), otherwise null.
 */
function localeFromPathname(pathname: string): string | null {
  const segment = pathname.split("/").find(Boolean)?.toLowerCase();
  return segment && locales.includes(segment) ? segment : null;
}

export function getLocale(): string {
  const explicit = currentLocale.get();
  if (explicit) return explicit;

  // Browser auto-detection
  if (typeof window !== "undefined" && window.location?.pathname) {
    const segment = localeFromPathname(window.location.pathname);
    if (segment) return segment;
  }

  // Universal / SSR context auto-detection (AsyncLocalStorage or framework request global)
  try {
    const g = globalThis as any;
    const reqUrl = g.__RIMELIGHT_REQUEST_URL__ || g.__request_url__;
    if (reqUrl) {
      const segment = localeFromPathname(new URL(reqUrl).pathname);
      if (segment) return segment;
    }
  } catch {
    // Ignore URL parse errors
  }

  return defaultLocale || "en";
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
    es: "es-ES",
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
    es: "es-ES",
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
    href: `${normalizedSiteUrl}${getRelativeLocaleUrl(loc, pathname)}`,
  }));

  alternates.push({
    hreflang: "x-default",
    href: `${normalizedSiteUrl}${getRelativeLocaleUrl(defaultLocale, pathname)}`,
  });

  return alternates;
}

import {
  currentLocale,
  defaultLocale,
  prefixDefaultLocale,
  localeFromPathname,
  locales,
  stripLocalePrefix,
} from "./runtime";

export {
  atom,
  t,
  currentLocale,
  initializeI18n,
  tRaw,
  tArray,
  getRawTranslation,
  getPluralCategory,
  getLocalizedText,
} from "./runtime";
export { setKVBinding, createTranslationLoader } from "./kv";
export { locales, defaultLocale, prefixDefaultLocale } from "./runtime";

export type {
  TranslationKey,
  CustomTranslations,
  NestedTranslationKeys,
  ReadableAtom,
  WritableAtom,
  TFunction,
} from "./types";

/**
 * Returns the active locale: the explicitly set one, otherwise auto-detected from the pathname
 * (browser URL or universal/SSR request global), otherwise the configured default.
 */
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
 * Canonical HTML (`lang`) and OpenGraph (`og:locale`) tags for the known locales. Unknown locales
 * fall back to their raw code (HTML) or `<code>_<CODE>` (OG).
 */
const LOCALE_TAGS: Record<string, { html: string; og: string }> = {
  en: { html: "en-US", og: "en_US" },
  pt: { html: "pt-BR", og: "pt_BR" },
  es: { html: "es-ES", og: "es_ES" },
};

/**
 * Returns a standard BCP 47 / RFC 5646 language tag suitable for HTML `<html lang="...">`. Maps
 * 2-letter codes like 'en' to 'en-US', 'pt' to 'pt-BR', 'es' to 'es-ES', etc.
 */
export function getHtmlLang(): string {
  const loc = getLocale();
  return LOCALE_TAGS[loc]?.html ?? loc;
}

/**
 * Returns an OpenGraph-compliant locale tag (e.g. 'en_US', 'pt_BR', 'es_ES').
 */
export function getOgLocale(): string {
  const loc = getLocale();
  return LOCALE_TAGS[loc]?.og ?? `${loc}_${loc.toUpperCase()}`;
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

  // Strip a leading locale segment (e.g. /en/about → about) so locales are never doubled up
  const cleanPath = stripLocalePrefix(pathWithoutQueryAndHash);
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

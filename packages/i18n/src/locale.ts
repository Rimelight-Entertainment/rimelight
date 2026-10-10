import generatedConfig from "#rimelight/i18n";

const raw = (
  generatedConfig && typeof generatedConfig === "object" ? generatedConfig : {}
) as Record<string, any>;

export const config = {
  locales: Array.isArray(raw["locales"]) ? raw["locales"] : ["en"],
  defaultLocale: typeof raw["defaultLocale"] === "string" ? raw["defaultLocale"] : "en",
  prefixDefaultLocale:
    typeof raw["prefixDefaultLocale"] === "boolean" ? raw["prefixDefaultLocale"] : true,
  skipPaths: Array.isArray(raw["skipPaths"]) ? raw["skipPaths"] : ["/api", "/_"],
};

let activeLocale = config.defaultLocale;

/** Returns the active locale code. */
export function getCurrentLocale(): string {
  return activeLocale || config.defaultLocale;
}

/** Sets the active locale code. */
export function setCurrentLocale(value: string): void {
  activeLocale = value;
}

/** Returns the supported locale codes. */
export function getLocales(): string[] {
  return [...config.locales];
}

/** Returns the default locale code. */
export function getDefaultLocale(): string {
  return config.defaultLocale;
}

/** Returns the configured locale from the first pathname segment, or null. */
export function localeFromPathname(
  pathname: string,
  supported: readonly string[] = config.locales,
): string | null {
  return (
    supported.find((c) => c.toLowerCase() === pathname.split(/[/?#]/)[1]?.toLowerCase()) ?? null
  );
}

/** Removes leading locale prefix from pathname. */
export function stripLocalePrefix(
  path: string,
  supported: readonly string[] = config.locales,
): string {
  return path.replace(new RegExp(`^/(?:${supported.join("|")})(?=[/?#]|$)`, "i"), "");
}

/** Generates a localized relative URL path. */
export function getLocaleUrl(path: string, locale = getCurrentLocale()): string {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(path)) return path;
  const target = stripLocalePrefix(path).replace(/^\/?/, "/");
  return config.prefixDefaultLocale || locale !== config.defaultLocale
    ? `/${locale}${target}`
    : target;
}

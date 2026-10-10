import generatedConfig from "#rimelight/i18n";

export const config = {
  locales: (generatedConfig?.locales ?? ["en"]) as readonly string[],
  defaultLocale: (generatedConfig?.defaultLocale ?? "en") as string,
  prefixDefaultLocale: (generatedConfig?.prefixDefaultLocale ?? true) as boolean,
  skipPaths: (generatedConfig?.skipPaths ?? ["/api", "/_"]) as readonly string[],
  translations: (generatedConfig?.translations ?? {}) as Record<string, Record<string, any>>,
};

let currentLocale = config.defaultLocale;

/** Returns the active locale code. */
export function getCurrentLocale(): string {
  return currentLocale;
}

/** Sets the active locale code. */
export function setCurrentLocale(locale: string): void {
  currentLocale = locale;
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

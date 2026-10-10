import generatedConfig from "#rimelight/i18n";

interface I18nConfig {
  locales: readonly string[];
  defaultLocale: string;
  prefixDefaultLocale: boolean;
  skipPaths: readonly string[];
  translations: Record<string, Record<string, unknown>>;
}

export const config: I18nConfig = {
  locales: generatedConfig?.locales ?? ["en"],
  defaultLocale: generatedConfig?.defaultLocale ?? "en",
  prefixDefaultLocale: generatedConfig?.prefixDefaultLocale ?? true,
  skipPaths: generatedConfig?.skipPaths ?? ["/api", "/_"],
  translations: generatedConfig?.translations ?? {},
};

let currentLocale = config.defaultLocale;

/** Returns the supported locale codes. */
export const getLocales = (): string[] => [...config.locales];

/** Returns the default locale code. */
export const getDefaultLocale = (): string => config.defaultLocale;

/** Returns the active locale code. */
export const getCurrentLocale = (): string => currentLocale;

/** Sets the active locale code. */
export const setCurrentLocale = (locale: string): void => {
  currentLocale = locale;
};

/** Generates a localized relative URL path. */
export const getLocaleUrl = (path: string, locale = getCurrentLocale()): string =>
  /^(?:[a-z]+:|\/\/|#)/i.test(path)
    ? path
    : `${config.prefixDefaultLocale || locale !== config.defaultLocale ? `/${locale}` : ""}/${path.replace(new RegExp(`^/(?:${config.locales.join("|")})(?=[/?#]|$)`, "i"), "").replace(/^\/+/, "")}`;

/** Resolves an asset for the current or fallback locale. */
export const getLocaleAsset = <T>(assets: Record<string, T>, locale = getCurrentLocale()): T =>
  (assets[locale] ?? assets[config.defaultLocale]) as T;

import generatedConfig from "#rimelight/i18n";

const rawConfig: Record<string, any> =
  generatedConfig && typeof generatedConfig === "object"
    ? (generatedConfig as Record<string, any>)
    : {};

export let locales: string[] = Array.isArray(rawConfig["locales"])
  ? [...rawConfig["locales"]]
  : ["en"];

export let defaultLocale: string =
  typeof rawConfig["defaultLocale"] === "string" ? rawConfig["defaultLocale"] : "en";

export let prefixDefaultLocale: boolean =
  typeof rawConfig["prefixDefaultLocale"] === "boolean" ? rawConfig["prefixDefaultLocale"] : true;

export let skipPaths: string[] = Array.isArray(rawConfig["skipPaths"])
  ? [...rawConfig["skipPaths"]]
  : ["/api", "/_"];

let activeLocale = defaultLocale;

/** Returns the active locale code. */
export function getCurrentLocale(): string {
  return activeLocale || defaultLocale;
}

/** Sets the active locale code. */
export function setCurrentLocale(value: string): void {
  activeLocale = value;
}

/** Returns the supported locale codes. */
export function getLocales(): string[] {
  return [...locales];
}

/** Returns the default locale code. */
export function getDefaultLocale(): string {
  return defaultLocale;
}

/** Test/runtime helper to update locale configuration. */
export function setLocaleConfig(options: {
  defaultLocale?: string;
  locales?: string[];
  prefixDefaultLocale?: boolean;
  skipPaths?: string[];
}): void {
  if (options.defaultLocale) defaultLocale = options.defaultLocale;
  if (options.locales) locales = [...options.locales];
  if (options.prefixDefaultLocale !== undefined) prefixDefaultLocale = options.prefixDefaultLocale;
  if (options.skipPaths) skipPaths = [...options.skipPaths];

  if (!activeLocale) {
    setCurrentLocale(defaultLocale);
  }
}

/** Returns the configured locale from the first pathname segment, or null. */
export function localeFromPathname(
  pathname: string,
  supported: readonly string[] = locales,
): string | null {
  const segment = pathname.split("/").find(Boolean);
  if (!segment) return null;
  return supported.find((code) => code.toLowerCase() === segment.toLowerCase()) ?? null;
}

/** Removes leading locale prefix from pathname. */
export function stripLocalePrefix(path: string, supported: readonly string[] = locales): string {
  const segments = path.replace(/^\/+/, "").split("/");
  const first = segments[0];
  if (first && supported.some((code) => code.toLowerCase() === first.toLowerCase())) {
    segments.shift();
  }
  return segments.join("/");
}

/** Generates a localized relative URL path. */
export function getRelativeLocaleUrl(
  path: string,
  { locale: targetLocale = getCurrentLocale() }: { locale?: string } = {},
): string {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(path)) return path;

  const splitAt = path.search(/[?#]/);
  const pathname = splitAt === -1 ? path : path.slice(0, splitAt);
  const suffix = splitAt === -1 ? "" : path.slice(splitAt);

  const cleanPath = stripLocalePrefix(pathname);
  const prefix = prefixDefaultLocale || targetLocale !== defaultLocale ? `/${targetLocale}` : "";

  if (!cleanPath) return `${prefix}/${suffix}`;

  const trailingSlash = pathname.endsWith("/") ? "/" : "";
  return `${prefix}/${cleanPath}${trailingSlash}${suffix}`;
}

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
export let kvBinding: string =
  typeof rawConfig["kvBinding"] === "string" ? rawConfig["kvBinding"] : "TRANSLATIONS_KV";
export let skipPaths: string[] = Array.isArray(rawConfig["skipPaths"])
  ? [...rawConfig["skipPaths"]]
  : ["/api", "/_"];

let activeLocale = defaultLocale;

/**
 * Returns the active locale code.
 */
export function getCurrentLocale(): string {
  return activeLocale || defaultLocale;
}

/**
 * Sets the active locale code.
 */
export function setCurrentLocale(value: string): void {
  activeLocale = value;
}

/**
 * Returns the supported locale codes (e.g. `["en", "pt"]`), inferred from the translations
 * directory by the Vite plugin.
 */
export function getLocales(): string[] {
  return [...locales];
}

/**
 * Returns the default/fallback locale code (e.g. `"en"`).
 */
export function getDefaultLocale(): string {
  return defaultLocale;
}

/**
 * Internal/test helper to mutate locale configuration.
 */
export function setLocaleConfig(options: {
  defaultLocale?: string;
  locales?: string[];
  prefixDefaultLocale?: boolean;
  kvBinding?: string;
  skipPaths?: string[];
}): void {
  if (options.defaultLocale) defaultLocale = options.defaultLocale;
  if (options.locales) locales = [...options.locales];
  if (options.prefixDefaultLocale !== undefined) prefixDefaultLocale = options.prefixDefaultLocale;
  if (options.kvBinding) kvBinding = options.kvBinding;
  if (options.skipPaths) skipPaths = [...options.skipPaths];

  if (!activeLocale) {
    setCurrentLocale(defaultLocale);
  }
}

/**
 * Returns the configured locale matching the first path segment of a pathname (compared
 * case-insensitively, returning the configured spelling, e.g. `pt-BR`), otherwise null. Shared by
 * the Hono middleware and URL utilities so both agree on what counts as a locale prefix.
 */
export function localeFromPathname(
  pathname: string,
  supported: readonly string[] = locales,
): string | null {
  const segment = pathname.split("/").find(Boolean);
  if (!segment) return null;
  return supported.find((code) => code.toLowerCase() === segment.toLowerCase()) ?? null;
}

/**
 * Removes a leading locale segment from a path (`/en/about` → `about`, `/pt` → ``), returning the
 * remainder without a leading slash. Segments are matched case-insensitively against `supported`.
 */
export function stripLocalePrefix(path: string, supported: readonly string[] = locales): string {
  const segments = path.replace(/^\/+/, "").split("/");
  const first = segments[0];
  if (first && supported.some((code) => code.toLowerCase() === first.toLowerCase())) {
    segments.shift();
  }
  return segments.join("/");
}

export function getRelativeLocaleUrl(
  path: string,
  { locale: targetLocale = getCurrentLocale() }: { locale?: string } = {},
): string {
  // External / absolute URLs, hash anchors, and scheme links (mailto:, tel:, ...) pass through
  if (/^(?:[a-z]+:|\/\/|#)/i.test(path)) return path;

  const splitAt = path.search(/[?#]/);
  const pathname = splitAt === -1 ? path : path.slice(0, splitAt);
  const suffix = splitAt === -1 ? "" : path.slice(splitAt);

  // Strip a leading locale segment (e.g. /en/about → about) so locales are never doubled up
  const cleanPath = stripLocalePrefix(pathname);
  const prefix = prefixDefaultLocale || targetLocale !== defaultLocale ? `/${targetLocale}` : "";

  // Root path keeps a trailing slash when prefixed: e.g. /en/
  if (!cleanPath) return `${prefix}/${suffix}`;

  const trailingSlash = pathname.endsWith("/") ? "/" : "";
  return `${prefix}/${cleanPath}${trailingSlash}${suffix}`;
}

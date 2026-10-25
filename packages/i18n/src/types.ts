export type KeyCasing = "kebab-case" | "camelCase" | "snake_case" | "any";

export interface I18nLintConfig {
  casing?: KeyCasing;
  disallowSelfNested?: boolean;
  disallowFlatUnderscores?: boolean;
}

export interface LocaleOptions {
  /** BCP 47 tag for hreflang, `og:locale`, `<html lang>` and formatting. Default: derived, e.g. `pt` → `pt-BR`. */
  tag?: string;
  /** Display name. Default: the language's own name, e.g. "Português". */
  label?: string;
  /** Text direction. Default: `rtl` for right-to-left languages, otherwise `ltr`. */
  dir?: "ltr" | "rtl";
}

export interface LocaleInfo {
  code: string;
  tag: string;
  label: string;
  dir: "ltr" | "rtl";
}

export interface I18nConfig {
  /**
   * Locale codes (URL prefixes / JSON file names). Defaults to the JSON files found.
   * Use an object to override derived info, e.g. `{ en: {}, pt: { tag: "pt-PT" } }` or `{ pt: "pt-PT" }`.
   */
  locales?: readonly string[] | Record<string, string | LocaleOptions>;
  defaultLocale?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: readonly string[];
  lint?: I18nLintConfig;
  translations?: Record<string, Record<string, unknown>>;
}

export interface TFunction<K extends string = string> {
  (key: K, params?: Record<string, unknown>, locale?: string): string;
  raw<T = unknown>(key: K, fallback?: T, locale?: string): T;
  array<T = string>(key: K, fallback?: T[], locale?: string): T[];
  plural(count: number, locale?: string): Intl.LDMLPluralRule;
  localize(value: unknown, locale?: string): string;
}

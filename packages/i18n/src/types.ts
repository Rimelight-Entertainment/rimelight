import type { TranslationRegistry } from "./index";

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
  translations?: Record<string, Record<string, unknown>>;
}

/** Keys `t()` accepts: the registry's, or any string while the registry is empty (before generation). */
export type TranslationKey<R = TranslationRegistry> = [keyof R] extends [never]
  ? string
  : Extract<keyof R, string>;

/** Arguments after the key. Params are required exactly when the key has placeholders or plurals. */
export type TranslationArgs<K extends string, R = TranslationRegistry> = string extends K
  ? [params?: Record<string, unknown> | undefined, locale?: string | undefined]
  : K extends keyof R
    ? [R[K]] extends [never]
      ? [params?: undefined, locale?: string | undefined]
      : [params: R[K], locale?: string | undefined]
    : [params?: Record<string, unknown> | undefined, locale?: string | undefined];

export interface TFunction<R = TranslationRegistry> {
  <K extends TranslationKey<R>>(key: K, ...args: TranslationArgs<K, R>): string;
  /** Untyped lookup for dynamic keys and non-string values (objects, namespaces). */
  raw<T = unknown>(key: string, fallback?: T, locale?: string): T;
  array<T = string>(key: string, fallback?: T[], locale?: string): T[];
  plural(count: number, locale?: string): Intl.LDMLPluralRule;
  localize(value: unknown, locale?: string): string;
}

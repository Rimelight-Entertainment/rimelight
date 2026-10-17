export interface I18nConfig {
  locales?: readonly string[];
  defaultLocale?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: readonly string[];
  translations?: Record<string, Record<string, unknown>>;
}

export interface TFunction<K extends string = string> {
  (key: K, params?: Record<string, unknown>, locale?: string): string;
  raw<T = unknown>(key: K, fallback?: T, locale?: string): T;
  array<T = string>(key: K, fallback?: T[], locale?: string): T[];
  plural(count: number, locale?: string): Intl.LDMLPluralRule;
  localize(value: unknown, locale?: string): string;
}

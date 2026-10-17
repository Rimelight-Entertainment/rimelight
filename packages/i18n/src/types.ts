import type { AsyncLocalStorage } from "node:async_hooks";

export interface I18nConfig {
  locales?: readonly string[];
  defaultLocale?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: readonly string[];
  translations?: Record<string, Record<string, unknown>>;
}

export interface I18nContextStore {
  locale: string;
  translations?: Record<string, unknown> | undefined;
}

declare global {
  var __rimelight_i18n: AsyncLocalStorage<I18nContextStore> | undefined;
}

export interface RimelightTranslationKeys {
  keys: string;
}

type TranslationKey = RimelightTranslationKeys["keys"];

export interface TFunction {
  (key: TranslationKey, params?: Record<string, unknown>, locale?: string): string;
  raw: <T = unknown>(key: TranslationKey, fallback?: T, locale?: string) => T;
  array: <T = string>(key: TranslationKey, fallback?: T[], locale?: string) => T[];
  plural: (count: number, locale?: string) => Intl.LDMLPluralRule;
  localize: (value: unknown, locale?: string) => string;
}

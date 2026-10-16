export interface I18nConfig {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: string[];
  types?: boolean | string;
}

export interface ResolvedI18nConfig extends Omit<I18nConfig, "skipPaths"> {
  readonly locales: readonly string[];
  readonly defaultLocale: string;
  readonly prefixDefaultLocale: boolean;
  readonly skipPaths: readonly string[];
  readonly translations: Record<string, Record<string, unknown>>;
}

export interface I18nContextStore {
  locale: string;
  translations?: Record<string, unknown> | undefined;
}

export interface RimelightTranslationKeys {
  keys: string;
}

export type TranslationKey = RimelightTranslationKeys["keys"];

export type TFunction = {
  (key: TranslationKey, params?: Record<string, unknown>): string;
  raw: (key: string, params?: Record<string, unknown>) => string;
  array: (key: string) => string[];
  plural: (key: string, count: number, params?: Record<string, unknown>) => string;
  localize: (obj: unknown, locale?: string) => string;
};

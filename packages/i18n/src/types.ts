import type { ComponentsJSON } from "@nanostores/i18n"

export type { ComponentsJSON }

export interface FlattenedTranslations {
  [key: string]: string
}

export interface LocaleFile {
  [component: string]: {
    [key: string]: string
  }
}

export interface KVNamespaceBinding {
  get(key: string, type: "json"): Promise<Record<string, string> | null>
  put(key: string, value: string): Promise<void>
}

/**
 * Derives dot-notated nested translation keys (e.g. "page_home.section_hero_title") from a
 * translation schema type.
 */
export type NestedTranslationKeys<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends object
        ? `${K}.${NestedTranslationKeys<T[K]>}`
        : `${K}`
    }[keyof T & (string | number)]
  : never

/**
 * Augmented interface for app-level strongly typed translation keys. Applications can declare:
 *
 * ```ts
 * declare module "@rimelight/i18n" {
 *   interface CustomTranslations extends typeof import("./translations/en.json") {}
 * }
 * ```
 */
export interface CustomTranslations {}

export type TranslationKey = [keyof CustomTranslations] extends [never]
  ? string
  : NestedTranslationKeys<CustomTranslations>

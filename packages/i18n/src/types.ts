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
 * Derives dot-notated nested translation keys (e.g. "page_home.section_hero_title" or
 * "page_resume.experiences.0.role") from a translation schema type.
 */
export type NestedTranslationKeys<T> = T extends (infer U)[]
  ? `${number}` | (U extends object ? `${number}.${NestedTranslationKeys<U>}` : never)
  : T extends object
    ? {
        [K in keyof T & (string | number)]: T[K] extends (infer U)[]
          ?
              | `${K}`
              | `${K}.${number}`
              | (U extends object ? `${K}.${number}.${NestedTranslationKeys<U>}` : never)
          : T[K] extends object
            ? `${K}` | `${K}.${NestedTranslationKeys<T[K]>}`
            : `${K}`
      }[keyof T & (string | number)]
    : never

/**
 * Augmented interface for app-level strongly typed translation keys. Applications can declare:
 *
 * ```ts
 * declare module "@rimelight/i18n" {
 *   interface CustomTranslations extends typeof import("./i18n/en.json") {}
 * }
 * ```
 */
export interface CustomTranslations {}

export type TranslationKey = [keyof CustomTranslations] extends [never]
  ? string
  : NestedTranslationKeys<CustomTranslations>

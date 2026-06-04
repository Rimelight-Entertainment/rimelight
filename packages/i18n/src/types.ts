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

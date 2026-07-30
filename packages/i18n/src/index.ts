import type { TranslationLoader } from "@nanostores/i18n"
import type { ComponentsJSON, KVNamespaceBinding } from "./types"
import {
  useI18n as baseUseI18n,
  useI18nAsync as baseUseI18nAsync,
  t,
  currentLocale,
  useFormat,
  clearCache,
  getI18nInstance,
  getFormatterInstance
} from "@rimelight/i18n:runtime"
import type { Translations } from "@nanostores/i18n"

export { t, currentLocale, useFormat, clearCache, getI18nInstance, getFormatterInstance }

export interface ComponentMessages {
  [key: string]: string
}

export function useI18n(componentName: string): ComponentMessages
export function useI18n<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): ComponentMessages & Body
export function useI18n(
  astro: { currentLocale?: string | undefined; params?: Record<string, any> } | undefined | null,
  componentName: string
): ComponentMessages
export function useI18n<Body extends Translations>(
  astro: { currentLocale?: string | undefined; params?: Record<string, any> } | undefined | null,
  componentName: string,
  baseTranslations: Body
): ComponentMessages & Body
export function useI18n(arg1: any, arg2?: any, arg3?: any): any {
  if (typeof arg1 === "string") {
    return baseUseI18n(arg1, arg2)
  } else {
    const locale = arg1?.currentLocale || arg1?.params?.locale
    if (locale) {
      currentLocale.set(locale)
    }
    return baseUseI18n(arg2, arg3)
  }
}

export function useI18nAsync(componentName: string): Promise<Record<string, string>>
export function useI18nAsync<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): Promise<Record<string, string> & Body>
export function useI18nAsync(
  astro: { currentLocale?: string | undefined; params?: Record<string, any> } | undefined | null,
  componentName: string
): Promise<Record<string, string>>
export function useI18nAsync<Body extends Translations>(
  astro: { currentLocale?: string | undefined; params?: Record<string, any> } | undefined | null,
  componentName: string,
  baseTranslations: Body
): Promise<Record<string, string> & Body>
export function useI18nAsync(arg1: any, arg2?: any, arg3?: any): any {
  if (typeof arg1 === "string") {
    return baseUseI18nAsync(arg1, arg2)
  } else {
    const locale = arg1?.currentLocale || arg1?.params?.locale
    if (locale) {
      currentLocale.set(locale)
    }
    return baseUseI18nAsync(arg2, arg3)
  }
}

import { getRelativeLocaleUrl as astroGetRelativeLocaleUrl } from "astro:i18n"

export function getLocale(): string {
  return currentLocale.get() || "en"
}

export function getRelativeLocaleUrl(path: string): string
export function getRelativeLocaleUrl(locale: string, path: string): string
export function getRelativeLocaleUrl(arg1: string, arg2?: string): string {
  if (arg2 !== undefined) {
    return astroGetRelativeLocaleUrl(arg1, arg2)
  } else {
    const locale = getLocale()
    return astroGetRelativeLocaleUrl(locale, arg1)
  }
}

let kvBinding: KVNamespaceBinding | null = null

export function setKVBinding(kv: KVNamespaceBinding) {
  kvBinding = kv
}

export function createTranslationLoader(
  translations: Record<string, ComponentsJSON>
): TranslationLoader {
  return async (locale, components) => {
    const localeTranslations = translations[locale] || {}

    // If components is not provided, is not an array, or is empty, return the entire locale's translations.
    if (!components || !Array.isArray(components) || components.length === 0) {
      return localeTranslations
    }

    const activeKv = kvBinding
    if (activeKv) {
      try {
        const results = await Promise.all(
          components.map(async (name) => {
            const key = `locale:${locale}:${name}`
            const data = await activeKv.get(key, "json")
            // Fall back to bundled translation for this component if missing in KV
            if (data == null) {
              return { [name]: localeTranslations[name] ?? {} }
            }
            return { [name]: data }
          })
        )
        return Object.assign({}, ...results)
      } catch {
        // KV read failed — fall through to static
      }
    }

    const results = await Promise.all(
      components.map(async (name) => {
        const data = localeTranslations[name]
        return { [name]: data ?? {} }
      })
    )
    return Object.assign({}, ...results)
  }
}

/**
 * Returns the plural category (e.g. 'one', 'few', 'many', 'other') for a given number and locale
 * using the native browser Intl.PluralRules API.
 */
export function getPluralCategory(count: number, locale: string = "en"): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(count)
}

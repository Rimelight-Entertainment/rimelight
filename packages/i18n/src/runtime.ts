import { createI18n, formatter, translationsLoading } from "@nanostores/i18n"
import type {
  TranslationLoader,
  Translations,
  I18n,
  Components,
  ComponentsJSON
} from "@nanostores/i18n"
import { atom } from "nanostores"

/**
 * A reactive store containing the current locale code. Set by middleware on each request, or
 * manually via `currentLocale.set(locale)`.
 */
export const currentLocale = atom("")

type I18nInstance = I18n
type FormatterInstance = ReturnType<typeof formatter>

let i18nInstance: I18nInstance | undefined
let formatterInstance: FormatterInstance | undefined
let baseLocaleDefault: string = "en"
let rawTranslationsDict: Record<string, Components> = {}

function throwNotInitialized(): never {
  throw new Error("i18n not initialized. Call initializeI18n first.")
}

/**
 * Wraps a TranslationLoader so that the returned object is guaranteed to contain a key for every
 * requested component.
 *
 * The nanostores i18n library uses the keys of the object returned from `get` to clear its internal
 * "requested" set. If a requested component is missing from the result (e.g. because the backend
 * has no translations for it in the given locale yet), the internal loading atom is never set back
 * to `false`, which causes useI18nAsync / translationsLoading to hang forever.
 *
 * This wrapper normalises the loader output so missing components are filled in with empty
 * translation objects, falling back to the base translations defined at the call site.
 */
function wrapLoader(loader: TranslationLoader): TranslationLoader {
  return async (code, components): Promise<ComponentsJSON> => {
    const raw = await loader(code, components)
    const normalised: ComponentsJSON = Array.isArray(raw)
      ? Object.assign({} as ComponentsJSON, ...raw)
      : { ...raw }
    for (const component of components) {
      if (!(component in normalised)) normalised[component] = {}
    }
    return normalised
  }
}

export interface InitializeI18nOptions {
  /**
   * The default locale code (e.g. 'en').
   */
  defaultLocale: string
  /**
   * Pre-loaded translations keyed by locale then component.
   */
  translations: Record<string, Components>
  /**
   * Optional dynamic loader called when a locale is not in cache.
   */
  get?: TranslationLoader
}

/**
 * Initializes the i18n system. Must be called once before any other i18n functions are used (the
 * integration virtual module does this automatically).
 */
export function initializeI18n(options: InitializeI18nOptions): void {
  const { defaultLocale, translations, get } = options
  baseLocaleDefault = defaultLocale
  rawTranslationsDict = translations || {}

  if (!i18nInstance) {
    currentLocale.set(defaultLocale)

    // Convert plain JSON dictionaries to nanostores atoms expected by nanostores/i18n cache
    const formattedCache: Record<string, Components> = {}
    for (const [locale, components] of Object.entries(translations)) {
      formattedCache[locale] = {}
      for (const [compName, compBody] of Object.entries(components)) {
        let bodyObj: Record<string, string> = {}
        if (isStringRecord(compBody)) {
          bodyObj = compBody
        } else if (isStoreWithGet(compBody)) {
          const res: unknown = compBody.get()
          if (isStringRecord(res)) {
            bodyObj = res
          }
        }
        formattedCache[locale][compName] = atom(bodyObj)
      }
    }

    i18nInstance = createI18n(currentLocale, {
      baseLocale: defaultLocale,
      get: wrapLoader(get ?? (async (): Promise<ComponentsJSON> => ({}))),
      cache: formattedCache,
      isSSR: true
    })
  }
  formatterInstance = formatter(currentLocale)
}

/**
 * Returns the underlying nanostores/i18n instance. Throws if not initialized.
 */
export function getI18nInstance(): I18nInstance {
  if (!i18nInstance) throwNotInitialized()
  return i18nInstance
}

/**
 * Returns the formatter instance. Throws if not initialized.
 */
export function getFormatterInstance(): FormatterInstance {
  if (!formatterInstance) throwNotInitialized()
  return formatterInstance
}

/**
 * Returns a Formatter object for the current locale with methods for formatting numbers, dates, and
 * relative times using the native Intl API.
 */
export function useFormat(): ReturnType<FormatterInstance["get"]> {
  return getFormatterInstance().get()
}

/**
 * Helper to safely extract raw translation JSON object from cache regardless of whether it is an
 * atom or object. Checks exact locale code (e.g. 'zh-CN'), base language code (e.g. 'zh'), and
 * default locale fallback.
 */
interface StoreWithGet {
  get: () => unknown
}

function isStoreWithGet(obj: unknown): obj is StoreWithGet {
  if (typeof obj !== "object" || obj === null) return false
  const getFn = Reflect.get(obj, "get")
  return typeof getFn === "function"
}

function isStringRecord(obj: unknown): obj is Record<string, string> {
  return typeof obj === "object" && obj !== null
}

function getCachedComponent(
  locale: string,
  componentName: string
): Record<string, string> | undefined {
  const normalizedLocale = locale.toLowerCase()
  const baseLanguage = normalizedLocale.split("-")[0] ?? normalizedLocale

  const candidates = [locale, normalizedLocale, baseLanguage, baseLocaleDefault]

  for (const code of candidates) {
    const rawComp: unknown = rawTranslationsDict[code]?.[componentName]
    if (isStoreWithGet(rawComp)) {
      const res: unknown = rawComp.get()
      if (isStringRecord(res)) return res
    } else if (isStringRecord(rawComp)) {
      return rawComp
    }
  }

  if (!i18nInstance) return undefined
  for (const code of candidates) {
    const rawComp: unknown = i18nInstance.cache[code]?.[componentName]
    if (isStoreWithGet(rawComp)) {
      const res: unknown = rawComp.get()
      if (isStringRecord(res)) return res
    } else if (isStringRecord(rawComp)) {
      return rawComp
    }
  }

  return undefined
}

/**
 * Returns the translated strings for a component in the current locale. Falls back to defaultLocale
 * loaded translations or `baseTranslations` if provided.
 */
export interface ComponentMessages {
  [key: string]: string
}

export function useI18n(componentName: string): ComponentMessages
export function useI18n<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): ComponentMessages & Body
export function useI18n(componentName: string, baseTranslations?: Translations): ComponentMessages {
  const i18n = getI18nInstance()
  const activeLocale = currentLocale.get() || baseLocaleDefault
  const fallbackDict: Record<string, string> = isStringRecord(baseTranslations)
    ? baseTranslations
    : {}
  const baseDict =
    getCachedComponent(activeLocale, componentName) ??
    getCachedComponent(baseLocaleDefault, componentName) ??
    fallbackDict

  const store = i18n(componentName, baseDict)
  const targetObj = store.get()

  return new Proxy(targetObj, {
    get(target: Record<string, string>, prop: string | symbol): string {
      if (typeof prop === "symbol" || prop in Object.prototype) {
        const val: unknown = Reflect.get(target, prop)
        return typeof val === "string" ? val : ""
      }
      const val = target[prop] ?? baseDict[prop]
      return val ?? prop
    }
  })
}

/**
 * Async version of useI18n that waits for translations to finish loading.
 */
export async function useI18nAsync(componentName: string): Promise<ComponentMessages>
export async function useI18nAsync<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): Promise<ComponentMessages & Body>
export async function useI18nAsync(
  componentName: string,
  baseTranslations?: Translations
): Promise<ComponentMessages> {
  const i18n = getI18nInstance()
  const activeLocale = currentLocale.get() || baseLocaleDefault
  const cachedActive = getCachedComponent(activeLocale, componentName)
  const cachedDefault = getCachedComponent(baseLocaleDefault, componentName)
  let baseDict: Record<string, string> = cachedActive ?? cachedDefault ?? {}
  if (!cachedActive && !cachedDefault && isStringRecord(baseTranslations)) {
    baseDict = baseTranslations
  }

  const store = i18n(componentName, baseDict)
  const unsubscribe = store.listen(() => {})
  await translationsLoading(i18n)
  unsubscribe()
  return store.get()
}

/**
 * Translates a single string key using dot-notation (e.g. `t("page_home.section_hero_title")`).
 */
export function t(key: string, params?: Record<string, any>): string {
  const dotIndex = key.indexOf(".")
  if (dotIndex === -1) {
    return key
  }
  const componentName = key.slice(0, dotIndex)
  const keyName = key.slice(dotIndex + 1)

  const activeLocale = currentLocale.get() || baseLocaleDefault
  const componentDict =
    getCachedComponent(activeLocale, componentName) ??
    getCachedComponent(baseLocaleDefault, componentName) ??
    {}

  let value = componentDict[keyName] ?? key

  // Pluralization support if count parameter is provided and translation value is a plural object
  if (params && typeof params.count === "number" && typeof value === "object" && value !== null) {
    const pluralCategory = getPluralCategory(params.count, activeLocale)
    value =
      (value as Record<string, any>)[pluralCategory] ?? (value as Record<string, any>).other ?? key
  }

  if (typeof value === "function") {
    return (value as Function)(params)
  }

  if (params && typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }

  return typeof value === "string" ? value : String(value)
}

/**
 * Returns the plural category (e.g. 'one', 'few', 'many', 'other') for a given number and locale
 * using the native browser Intl.PluralRules API.
 */
export function getPluralCategory(count: number, locale: string = "en"): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(count)
}

/**
 * Clears the translation cache.
 *
 * @param locale - If provided, clears only that locale's cache. Otherwise clears all.
 */
export function clearCache(locale?: string): void {
  if (!i18nInstance) throwNotInitialized()
  const cache = i18nInstance.cache
  if (locale) {
    cache[locale] = {}
  } else {
    for (const key in cache) cache[key] = {}
  }
}

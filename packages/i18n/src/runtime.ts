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
  if (!i18nInstance) {
    currentLocale.set(defaultLocale)
    i18nInstance = createI18n(currentLocale, {
      baseLocale: defaultLocale,
      get: wrapLoader(get ?? (async (): Promise<ComponentsJSON> => ({}))),
      cache: translations,
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
 * Returns the translated strings for a component in the current locale. Falls back to
 * `baseTranslations` for any key not present in the loaded locale.
 */
export function useI18n<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): Body {
  return getI18nInstance()(componentName, baseTranslations).get()
}

/**
 * Async version of useI18n that waits for translations to finish loading. Required when using a
 * dynamic translationLoader (e.g. KV-backed loading).
 */
export async function useI18nAsync<Body extends Translations>(
  componentName: string,
  baseTranslations: Body
): Promise<Body> {
  const i18n = getI18nInstance()
  const store = i18n(componentName, baseTranslations)
  const unsubscribe = store.listen(() => {})
  await translationsLoading(i18n)
  unsubscribe()
  return store.get()
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

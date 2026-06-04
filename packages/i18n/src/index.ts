import type { TranslationLoader } from "@nanostores/i18n"
import type { ComponentsJSON, KVNamespaceBinding } from "./types"

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

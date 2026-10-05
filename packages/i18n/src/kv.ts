import type { ComponentsJSON, KVNamespaceBinding, TranslationLoader } from "./types";

let kvBinding: KVNamespaceBinding | null = null;

/**
 * Binds a KV namespace used by `createTranslationLoader` (set by the Hono middleware from the
 * worker environment on each request).
 */
export function setKVBinding(kv: KVNamespaceBinding): void {
  kvBinding = kv;
}

/**
 * Creates a translation loader that reads per-component translations from the bound KV namespace
 * (keyed `locale:<locale>:<component>`), falling back to the bundled translations for that locale.
 * With no `components` list the entire locale is returned.
 */
export function createTranslationLoader(
  translations: Record<string, ComponentsJSON>,
): TranslationLoader {
  return async (locale, components) => {
    const localeTranslations = translations[locale] || {};

    // If components is not provided, is not an array, or is empty, return the entire locale's translations.
    if (!components || !Array.isArray(components) || components.length === 0) {
      return localeTranslations;
    }

    const activeKv = kvBinding;
    if (activeKv) {
      try {
        const results = await Promise.all(
          components.map(async (name) => {
            const key = `locale:${locale}:${name}`;
            const data = await activeKv.get(key, "json");
            // Fall back to bundled translation for this component if missing in KV
            if (data == null) {
              return { [name]: localeTranslations[name] ?? {} };
            }
            return { [name]: data };
          }),
        );
        return Object.assign({}, ...results);
      } catch {
        // KV read failed — fall through to static
      }
    }

    const results = await Promise.all(
      components.map(async (name) => {
        const data = localeTranslations[name];
        return { [name]: data ?? {} };
      }),
    );
    return Object.assign({}, ...results);
  };
}

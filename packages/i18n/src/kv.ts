import type { ComponentsJSON, KVNamespaceBinding, TranslationLoader } from "./types";

let kvBinding: KVNamespaceBinding | null = null;

/**
 * Builds the KV key used to store a single component's translations for a locale. Single source
 * of truth shared by the Vite plugin's seed writer and `createTranslationLoader`.
 */
export function kvTranslationKey(locale: string, component: string): string {
  return `locale:${locale}:${component}`;
}

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
    const results = await Promise.all(
      components.map(async (name) => {
        if (activeKv) {
          try {
            const data = await activeKv.get(kvTranslationKey(locale, name), "json");
            // Fall back to bundled translation for this component if missing in KV
            if (data != null) return { [name]: data };
          } catch {
            // KV read failed — fall through to static
          }
        }
        return { [name]: localeTranslations[name] ?? {} };
      }),
    );
    return Object.assign({}, ...results);
  };
}

/**
 * Flattens translations into the `{ key, value }` entries written to
 * `<outDir>/_translations-seed.json` for `wrangler kv:bulk put`. The key format matches
 * `kvTranslationKey`.
 */
export function buildKvSeed(translations: Record<string, Record<string, any>>): {
  keys: { key: string; value: string }[];
} {
  const keys: { key: string; value: string }[] = [];
  for (const [locale, localeData] of Object.entries(translations)) {
    for (const [component, componentData] of Object.entries(localeData)) {
      keys.push({
        key: kvTranslationKey(locale, component),
        value: JSON.stringify(componentData),
      });
    }
  }
  return { keys };
}

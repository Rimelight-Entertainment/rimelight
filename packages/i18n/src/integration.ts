import type { AstroIntegration } from "astro"
import fs from "node:fs"
import path from "node:path"

export interface RimelightI18nOptions {
  validateExtraction?: boolean
  translations?: Record<string, Record<string, any>>
  kvBinding?: string
  translationLoader?: string
}

export function rimelightI18n(options?: RimelightI18nOptions): AstroIntegration[] {
  const validateExtraction = options?.validateExtraction ?? true
  const translations = options?.translations
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV"
  const translationLoader = options?.translationLoader ?? "./src/i18n/loader.ts"

  // Normalise locale keys: "pt" → "pt-br" for nanostores compatibility
  const normalisedTranslations: Record<string, any> = {}
  if (translations) {
    for (const [locale, val] of Object.entries(translations)) {
      normalisedTranslations[locale === "pt" ? "pt-br" : locale] = val
    }
  }

  // ---------- Vite virtual module: @rimelight/i18n:runtime ----------
  // This replicates what astro-nanostores-i18n integration.js used to do:
  // it creates a virtual module that calls initializeI18n() once at module
  // evaluation time and re-exports all runtime helpers.
  const VIRTUAL_MODULE_ID = "@rimelight/i18n:runtime"
  const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID

  // Use the package export specifier so Vite resolves it through normal
  // module resolution rather than an absolute filesystem path.
  const runtimeSpecifier = "@rimelight/i18n/runtime"

  const loaderImport = translationLoader
    ? `import translationLoader from ${JSON.stringify(translationLoader)};`
    : ""
  const loaderOption = translationLoader ? ", get: translationLoader" : ""

  // ----------------------------------------------------------------

  const rimelightI18nCore: AstroIntegration = {
    name: "@rimelight/i18n",
    hooks: {
      "astro:config:setup": ({ config, addMiddleware, updateConfig, logger }) => {
        const locales = config.i18n?.locales ?? ["en"]
        const defaultLocale = config.i18n?.defaultLocale ?? "en"

        const virtualModuleContent = `\
import { initializeI18n, useFormat, useI18n, useI18nAsync,
         currentLocale, getI18nInstance, getFormatterInstance, clearCache }
  from ${JSON.stringify(runtimeSpecifier)};
${loaderImport}

initializeI18n({
  defaultLocale: ${JSON.stringify(defaultLocale)},
  translations: ${JSON.stringify(normalisedTranslations)}${loaderOption}
});

export { useFormat, useI18n, useI18nAsync, currentLocale,
         getI18nInstance, getFormatterInstance, clearCache };
`

        addMiddleware({
          entrypoint: "@rimelight/i18n/middleware",
          order: "pre"
        })

        updateConfig({
          vite: {
            ssr: {
              noExternal: ["@rimelight/i18n"]
            },
            plugins: [
              // Virtual module: @rimelight/i18n:runtime
              {
                name: "vite-plugin-rimelight-i18n-runtime",
                resolveId(id) {
                  if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
                  return null
                },
                load(id) {
                  if (id === RESOLVED_VIRTUAL_MODULE_ID) return virtualModuleContent
                  return null
                }
              },
              // Virtual module: virtual:rimelight-i18n-config (locale metadata)
              {
                name: "vite-plugin-rimelight-i18n-config",
                resolveId(id) {
                  if (id === "virtual:rimelight-i18n-config") return "\0" + id
                  return null
                },
                load(id) {
                  if (id === "\0virtual:rimelight-i18n-config") {
                    return `
                      export const locales = ${JSON.stringify(locales)};
                      export const defaultLocale = ${JSON.stringify(defaultLocale)};
                    `
                  }
                  return null
                }
              }
            ]
          }
        })

        if (validateExtraction) {
          logger.info("i18n extraction validation active")
        }
      },

      "astro:config:done": ({ injectTypes }) => {
        // Inject ambient type declarations for the virtual module so TypeScript
        // and editor tooling know the shape of @rimelight/i18n:runtime.
        injectTypes({
          filename: "rimelight-i18n.d.ts",
          content: `\
declare module "@rimelight/i18n:runtime" {
  import type { Translations } from '@nanostores/i18n';
  export type { InitializeI18nOptions } from '@rimelight/i18n/runtime';
  export const currentLocale: import('nanostores').PreinitializedWritableAtom<string> & object;
  export declare function initializeI18n(options: import('@rimelight/i18n/runtime').InitializeI18nOptions): void;
  export declare function useFormat(): import('@nanostores/i18n').Formatter;
  export declare function useI18n<Body extends Translations>(componentName: string, baseTranslations: Body): Body;
  export declare function useI18nAsync<Body extends Translations>(componentName: string, baseTranslations: Body): Promise<Body>;
  export declare function getI18nInstance(): ReturnType<typeof import('@nanostores/i18n').createI18n>;
  export declare function getFormatterInstance(): ReturnType<typeof import('@nanostores/i18n').formatter>;
  export declare function clearCache(locale?: string): void;
}
`
        })
      },

      "astro:build:done": async ({ logger }) => {
        if (translations) {
          const seedData: { keys: { key: string; value: string }[] } = { keys: [] }
          for (const [locale, localeData] of Object.entries(translations)) {
            for (const [component, componentData] of Object.entries(localeData)) {
              seedData.keys.push({
                key: `locale:${locale}:${component}`,
                value: JSON.stringify(componentData)
              })
            }
          }
          const outDir = process.env.WRANGLER_OUT_DIR ?? "dist"
          const seedFile = path.join(outDir, "_translations-seed.json")
          fs.mkdirSync(path.dirname(seedFile), { recursive: true })
          fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2))
          logger.info(`translations seed file written to ${seedFile}`)

          try {
            const { execSync } = await import("node:child_process")
            execSync(`npx wrangler kv:bulk put --binding "${kvBinding}" "${seedFile}"`, {
              stdio: "pipe",
              timeout: 30_000
            })
            logger.info(`KV "${kvBinding}" seeded with translations`)
          } catch {
            logger.warn(
              `could not seed KV automatically — run ` +
                `"npx wrangler kv:bulk put --binding "${kvBinding}" "${seedFile}"" ` +
                `to seed translations into KV`
            )
          }
        } else {
          logger.info("i18n build complete (no translations to seed)")
        }
      }
    }
  }

  return [rimelightI18nCore]
}

import fs from "node:fs"
import path from "node:path"

export interface RimelightI18nOptions {
  /**
   * List of supported locale codes (e.g. `["en", "pt"]`).
   */
  locales?: string[]
  /**
   * The default locale code (e.g. `"en"`).
   */
  defaultLocale?: string
  /**
   * Whether to prefix the default locale in URLs.
   *
   * - `true` (default): all locales are prefixed — `/en/about`, `/pt/about`
   * - `false`: the default locale has no prefix — `/about`, `/pt/about`
   */
  prefixDefaultLocale?: boolean
  validateExtraction?: boolean
  translations?: Record<string, Record<string, any>>
  kvBinding?: string
  translationLoader?: string
}

export interface RimelightI18nVitePlugin {
  name: string
  enforce?: "pre" | "post"
  resolveId?: (id: string) => string | null | undefined
  load?: (id: string) => string | null | undefined
  config?: (config: any) => any
  closeBundle?: () => Promise<void> | void
  [key: string]: any
}

export type RimelightI18nPlugins = RimelightI18nVitePlugin[]

/**
 * Pure Vite plugin for Rimelight i18n. Provides virtual modules `@rimelight/i18n:runtime` and
 * `virtual:rimelight-i18n-config`.
 */
export function i18n(options?: RimelightI18nOptions): RimelightI18nPlugins {
  const translations = options?.translations
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV"

  const locales = options?.locales ?? ["en"]
  const defaultLocale = options?.defaultLocale ?? "en"
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true

  // Normalise translations passed in options
  const normalisedTranslations: Record<string, any> = {}
  if (translations) {
    for (const [locale, val] of Object.entries(translations)) {
      normalisedTranslations[locale] = val
    }
  }

  return [
    {
      name: "vite-plugin-rimelight-i18n-config",
      resolveId(id: string) {
        if (id === "virtual:rimelight-i18n-config") return "\0" + id
        return null
      },
      load(id: string) {
        if (id === "\0virtual:rimelight-i18n-config") {
          return `
            export const locales = ${JSON.stringify(locales)};
            export const defaultLocale = ${JSON.stringify(defaultLocale)};
            export const prefixDefaultLocale = ${JSON.stringify(prefixDefaultLocale)};
            export const translations = ${JSON.stringify(normalisedTranslations)};
          `
        }
        return null
      },
      async closeBundle() {
        if (!translations) return

        const seedData: { keys: { key: string; value: string }[] } = { keys: [] }
        for (const [locale, localeData] of Object.entries(translations)) {
          for (const [component, componentData] of Object.entries(localeData)) {
            seedData.keys.push({
              key: `locale:${locale}:${component}`,
              value: JSON.stringify(componentData)
            })
          }
        }
        const outDir = process.env["WRANGLER_OUT_DIR"] ?? "dist"
        const seedFile = path.join(outDir, "_translations-seed.json")
        try {
          fs.mkdirSync(path.dirname(seedFile), { recursive: true })
          fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2))

          const autoSeed =
            process.env["WRANGLER_SEED_KV"] === "true" || process.env["CI"] === "true"
          if (autoSeed) {
            const { execSync } = await import("node:child_process")
            execSync(`npx wrangler kv:bulk put --binding "${kvBinding}" "${seedFile}"`, {
              stdio: "pipe",
              timeout: 30_000
            })
          }
        } catch {
          // Ignore if directory cannot be written or during watch mode
        }
      }
    }
  ]
}

export { i18n as rimelightI18n }

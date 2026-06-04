import type { AstroIntegration } from "astro"
import fs from "node:fs"
import path from "node:path"

export interface RimelightI18nOptions {
  validateExtraction?: boolean
  translations?: Record<string, Record<string, any>>
  kvBinding?: string
}

export function rimelightI18n(options?: RimelightI18nOptions): AstroIntegration {
  const validateExtraction = options?.validateExtraction ?? true
  const translations = options?.translations
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV"

  return {
    name: "@rimelight/i18n",
    hooks: {
      "astro:config:setup": ({ addMiddleware, updateConfig, logger }) => {
        addMiddleware({
          entrypoint: "@rimelight/i18n/middleware",
          order: "pre"
        })
        updateConfig({
          vite: {
            ssr: {
              noExternal: ["@rimelight/i18n"]
            }
          }
        })
        if (validateExtraction) {
          logger.info("i18n extraction validation active")
        }
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
}

import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

export interface RimelightI18nOptions<
  TLocale extends string = string,
  TLocales extends readonly TLocale[] = readonly TLocale[],
> {
  /**
   * List of supported locale codes (e.g. `["en", "pt"]`).
   * If omitted, locales will be automatically inferred from JSON files in `translationsDir` (or `./src/i18n`).
   */
  locales?: TLocales;
  /**
   * The default locale code (e.g. `"en"`).
   * Strictly typed according to the `locales` list.
   */
  defaultLocale?: TLocales extends readonly [any, ...any[]]
    ? TLocales[number]
    : [TLocale] extends [never]
      ? string
      : TLocale;
  /**
   * Directory containing translation JSON files (`${locale}.json`), relative to Vite project root or absolute.
   * Defaults to `"src/i18n"` (or `"./src/i18n"`).
   */
  translationsDir?: string;
  /**
   * Whether to prefix the default locale in URLs.
   *
   * - `true` (default): all locales are prefixed — `/en/about`, `/pt/about`
   * - `false`: the default locale has no prefix — `/about`, `/pt/about`
   */
  prefixDefaultLocale?: boolean;
  validateExtraction?: boolean;
  /**
   * Optional manual translations map. If omitted, translations are loaded automatically
   * from `${translationsDir}/${locale}.json`.
   */
  translations?: Record<string, Record<string, any>>;
  kvBinding?: string;
  translationLoader?: string;
}

export type RimelightI18nVitePlugin = Plugin;

export type RimelightI18nPlugins = Plugin[];

function discoverTranslations(
  root: string,
  specifiedDir?: string,
  specifiedLocales?: readonly string[],
): { locales: string[]; translations: Record<string, any>; dirPath: string | null } {
  const dirPath = path.resolve(root, specifiedDir ?? "src/i18n");
  const translations: Record<string, any> = {};
  const discoveredLocales = new Set<string>();

  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const locale = path.basename(file, ".json");
          // If explicit locales are given, only read those
          if (!specifiedLocales || specifiedLocales.includes(locale)) {
            try {
              const fullPath = path.join(dirPath, file);
              const content = fs.readFileSync(fullPath, "utf-8");
              translations[locale] = JSON.parse(content);
              discoveredLocales.add(locale);
            } catch {
              // Ignore invalid JSON / unreadable files
            }
          }
        }
      }
    } catch {
      // Ignore if readdir fails
    }
  }

  // Determine final locales list
  let finalLocales: string[];
  if (specifiedLocales && specifiedLocales.length > 0) {
    finalLocales = [...specifiedLocales];
  } else if (discoveredLocales.size > 0) {
    finalLocales = Array.from(discoveredLocales).sort();
  } else {
    finalLocales = ["en"];
  }

  return {
    locales: finalLocales,
    translations,
    dirPath: fs.existsSync(dirPath) ? dirPath : null,
  };
}

/**
 * Pure Vite plugin for Rimelight i18n. Provides virtual modules `@rimelight/i18n:runtime` and
 * `virtual:rimelight-i18n-config`.
 */
export function i18n<
  const TLocale extends string = string,
  const TLocales extends readonly TLocale[] = readonly TLocale[],
>(options?: RimelightI18nOptions<TLocale, TLocales>): RimelightI18nPlugins {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  let root = process.cwd();

  const getResolvedConfig = () => {
    const discovered = discoverTranslations(root, options?.translationsDir, options?.locales);
    const locales = options?.locales ? [...options.locales] : discovered.locales;
    const defaultLocale =
      options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));

    // Normalise translations passed in options or fallback to discovered translations
    const normalisedTranslations: Record<string, any> = {};
    if (options?.translations) {
      for (const [locale, val] of Object.entries(options.translations)) {
        normalisedTranslations[locale] = val;
      }
    } else {
      Object.assign(normalisedTranslations, discovered.translations);
    }

    return {
      locales,
      defaultLocale,
      prefixDefaultLocale,
      translations: normalisedTranslations,
      dirPath: discovered.dirPath,
    };
  };

  return [
    {
      name: "vite-plugin-rimelight-i18n-config",
      configResolved(resolvedConfig) {
        root = resolvedConfig.root ?? process.cwd();
      },
      resolveId(id: string) {
        if (id === "virtual:rimelight-i18n-config" || id === "virtual:rimelight/i18n")
          return "\0" + id;
        return null;
      },
      load(id: string) {
        if (id === "\0virtual:rimelight-i18n-config" || id === "\0virtual:rimelight/i18n") {
          const cfg = getResolvedConfig();

          // Watch all discovered translation files in the translations directory
          if (cfg.dirPath && fs.existsSync(cfg.dirPath)) {
            try {
              const files = fs.readdirSync(cfg.dirPath);
              for (const file of files) {
                if (file.endsWith(".json")) {
                  this.addWatchFile(path.join(cfg.dirPath, file));
                }
              }
            } catch {
              // Ignore watch error
            }
          }

          return `
            export const locales = ${JSON.stringify(cfg.locales)};
            export const languages = ${JSON.stringify(cfg.locales)};
            export const defaultLocale = ${JSON.stringify(cfg.defaultLocale)};
            export const prefixDefaultLocale = ${JSON.stringify(cfg.prefixDefaultLocale)};
            export const translations = ${JSON.stringify(cfg.translations)};
            export default { locales: ${JSON.stringify(cfg.locales)}, defaultLocale: ${JSON.stringify(cfg.defaultLocale)} };
          `;
        }
        return null;
      },
      async handleHotUpdate(ctx) {
        const { dirPath } = getResolvedConfig();
        if (dirPath && ctx.file.startsWith(dirPath) && ctx.file.endsWith(".json")) {
          const mod = ctx.server.moduleGraph.getModuleById("\0virtual:rimelight-i18n-config");
          const modAlias = ctx.server.moduleGraph.getModuleById("\0virtual:rimelight/i18n");
          if (mod) ctx.server.moduleGraph.invalidateModule(mod);
          if (modAlias) ctx.server.moduleGraph.invalidateModule(modAlias);
          ctx.server.ws.send({
            type: "full-reload",
          });
        }
      },
      async closeBundle() {
        const cfg = getResolvedConfig();
        if (!cfg.translations || Object.keys(cfg.translations).length === 0) return;

        const seedData: { keys: { key: string; value: string }[] } = { keys: [] };
        for (const [locale, localeData] of Object.entries(cfg.translations)) {
          for (const [component, componentData] of Object.entries(
            localeData as Record<string, any>,
          )) {
            seedData.keys.push({
              key: `locale:${locale}:${component}`,
              value: JSON.stringify(componentData),
            });
          }
        }
        const outDir = process.env["WRANGLER_OUT_DIR"] ?? "dist";
        const seedFile = path.join(outDir, "_translations-seed.json");
        try {
          fs.mkdirSync(path.dirname(seedFile), { recursive: true });
          fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

          const autoSeed =
            process.env["WRANGLER_SEED_KV"] === "true" || process.env["CI"] === "true";
          if (autoSeed) {
            const { execSync } = await import("node:child_process");
            execSync(`npx wrangler kv:bulk put --binding "${kvBinding}" "${seedFile}"`, {
              stdio: "pipe",
              timeout: 30_000,
            });
          }
        } catch {
          // Ignore if directory cannot be written or during watch mode
        }
      },
    },
  ];
}

export default i18n;

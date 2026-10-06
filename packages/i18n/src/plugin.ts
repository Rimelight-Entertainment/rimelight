import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

const VIRTUAL_CONFIG_ID = "virtual:rimelight-i18n-config";
const RESOLVED_VIRTUAL_CONFIG_ID = `\0${VIRTUAL_CONFIG_ID}`;
const DEFAULT_TRANSLATIONS_DIR = "src/i18n";

export interface RimelightI18nOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  kvBinding?: string;
  skipPaths?: string[];
}

export interface ReadLocaleFilesResult {
  files: string[];
  translations: Record<string, Record<string, any>>;
  errors: { file: string; error: unknown }[];
}

export function readLocaleFiles(dirPath: string): ReadLocaleFilesResult {
  const files: string[] = [];
  const translations: Record<string, Record<string, any>> = {};
  const errors: { file: string; error: unknown }[] = [];

  try {
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".json")) continue;
      const locale = path.basename(file, ".json");
      files.push(file);
      try {
        translations[locale] = JSON.parse(fs.readFileSync(path.join(dirPath, file), "utf-8"));
      } catch (error) {
        errors.push({ file, error });
      }
    }
  } catch {
    // Directory doesn't exist or unreadable
  }

  return { files, translations, errors };
}

export function resolveTranslationsDir(root: string, specifiedDir?: string): string {
  return path.resolve(root, specifiedDir ?? DEFAULT_TRANSLATIONS_DIR);
}

export function i18n(options?: RimelightI18nOptions): Plugin {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  const skipPaths = options?.skipPaths ?? ["/api", "/_"];
  let root = process.cwd();
  let cached: { translations: Record<string, Record<string, any>>; dirPath: string } | null = null;

  function getData() {
    if (cached) return cached;

    const dirPath = resolveTranslationsDir(root, options?.translationsDir);
    const { translations } = readLocaleFiles(dirPath);
    cached = { translations, dirPath };
    return cached;
  }

  return {
    name: "vite-plugin-rimelight-i18n-config",
    configResolved(resolvedConfig) {
      root = resolvedConfig.root ?? process.cwd();
      cached = null;
    },
    resolveId(id: string) {
      if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
      return null;
    },
    load(id: string) {
      if (id === RESOLVED_VIRTUAL_CONFIG_ID) {
        const { translations, dirPath } = getData();
        const locales = Object.keys(translations).sort();
        const defaultLocale =
          options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));

        if (dirPath && fs.existsSync(dirPath)) {
          try {
            for (const file of fs.readdirSync(dirPath)) {
              if (file.endsWith(".json")) this.addWatchFile(path.join(dirPath, file));
            }
          } catch {
            // Ignore watch errors
          }
        }

        return `export default ${JSON.stringify({
          locales,
          defaultLocale,
          prefixDefaultLocale,
          translations,
          kvBinding,
          skipPaths,
        })};`;
      }
      return null;
    },
    async closeBundle() {
      const { translations } = getData();
      if (!translations || Object.keys(translations).length === 0) return;

      const keys: { key: string; value: string }[] = [];
      for (const [locale, localeData] of Object.entries(translations)) {
        keys.push({ key: `locale:${locale}`, value: JSON.stringify(localeData) });
        for (const [component, componentData] of Object.entries(
          localeData as Record<string, any>,
        )) {
          keys.push({ key: `locale:${locale}:${component}`, value: JSON.stringify(componentData) });
        }
      }

      const outDir = process.env["WRANGLER_OUT_DIR"] ?? "dist";
      const seedFile = path.join(outDir, "_translations-seed.json");

      try {
        fs.mkdirSync(path.dirname(seedFile), { recursive: true });
        fs.writeFileSync(seedFile, JSON.stringify({ keys }, null, 2));
      } catch {
        // Ignore write errors
      }
    },
  };
}

import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";

const DEFAULT_TRANSLATIONS_DIR = "src/i18n";

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  kvBinding?: string;
  skipPaths?: string[];
}

export type RimelightI18nPlugin = Plugin;

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

export function i18n(options?: RimelightI18nPluginOptions): Plugin {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  const skipPaths = options?.skipPaths ?? ["/api", "/_"];
  let cached: { translations: Record<string, Record<string, any>>; dirPath: string } | null = null;

  function getData(root: string) {
    if (cached) return cached;
    const dirPath = resolveTranslationsDir(root, options?.translationsDir);
    const { translations } = readLocaleFiles(dirPath);
    cached = { translations, dirPath };
    return cached;
  }

  return defineRimelightArtifactPlugin({
    pkgName: "i18n",
    watch: ({ root }) => [resolveTranslationsDir(root, options?.translationsDir)],
    config({ root }) {
      cached = null;
      const { translations } = getData(root);
      const locales = Object.keys(translations).sort();
      const defaultLocale =
        options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));

      return {
        locales,
        defaultLocale,
        prefixDefaultLocale,
        translations,
        kvBinding,
        skipPaths,
      };
    },
    async closeBundle() {
      if (!cached?.translations || Object.keys(cached.translations).length === 0) return;

      const keys: { key: string; value: string }[] = [];
      for (const [locale, localeData] of Object.entries(cached.translations)) {
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
  });
}

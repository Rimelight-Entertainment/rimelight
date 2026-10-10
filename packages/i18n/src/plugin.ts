import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
}

export const resolveTranslationsDir = (root: string, specifiedDir = "src/i18n"): string =>
  path.resolve(root, specifiedDir);

export const readLocaleFiles = (
  dirPath: string,
): {
  files: string[];
  translations: Record<string, Record<string, any>>;
  errors: { file: string; error: unknown }[];
} => {
  const files: string[] = [];
  const translations: Record<string, Record<string, any>> = {};
  const errors: { file: string; error: unknown }[] = [];

  try {
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".json")) continue;
      files.push(file);
      try {
        translations[path.basename(file, ".json")] = JSON.parse(
          fs.readFileSync(path.join(dirPath, file), "utf-8"),
        );
      } catch (error) {
        errors.push({ file, error });
      }
    }
  } catch {}

  return { files, translations, errors };
};

export const i18n = (options?: RimelightI18nPluginOptions): Plugin => {
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  let cachedTranslations: Record<string, Record<string, any>> | null = null;

  return defineRimelightArtifactPlugin({
    pkgName: "i18n",
    watch: ({ root }) => [resolveTranslationsDir(root, options?.translationsDir)],
    config({ root }) {
      const { translations } = readLocaleFiles(
        resolveTranslationsDir(root, options?.translationsDir),
      );
      cachedTranslations = translations;
      const locales = Object.keys(translations).sort();
      const defaultLocale =
        options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));

      return {
        locales,
        defaultLocale,
        prefixDefaultLocale,
        translations,
        skipPaths: ["/api", "/_"],
      };
    },
    async closeBundle() {
      if (!cachedTranslations || Object.keys(cachedTranslations).length === 0) return;

      const outDir = path.join(process.env["WRANGLER_OUT_DIR"] ?? "dist", "locales");
      try {
        fs.mkdirSync(outDir, { recursive: true });
        for (const [locale, data] of Object.entries(cachedTranslations)) {
          fs.writeFileSync(path.join(outDir, `${locale}.json`), JSON.stringify(data, null, 2));
        }
      } catch {}
    },
  });
};

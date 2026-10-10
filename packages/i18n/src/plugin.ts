import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
}

export const i18n = (options?: RimelightI18nPluginOptions): Plugin => {
  let cachedTranslations: Record<string, Record<string, any>> | null = null;

  const flattenTranslations = (
    obj: Record<string, any>,
    prefix = "",
    target: Record<string, any> = {},
  ): Record<string, any> => {
    for (const [key, value] of Object.entries(obj)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      const fullPath = prefix ? `${prefix}.${key}` : key;
      target[fullPath] = value;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        flattenTranslations(value, fullPath, target);
      }
    }
    return target;
  };

  return defineRimelightArtifactPlugin({
    pkgName: "i18n",
    watch: ({ root }) => [path.resolve(root, options?.translationsDir ?? "src/i18n")],
    config: ({ root }) => {
      const translationsDir = path.resolve(root, options?.translationsDir ?? "src/i18n");
      const translations: Record<string, Record<string, any>> = {};

      try {
        for (const file of fs.readdirSync(translationsDir)) {
          if (file.endsWith(".json")) {
            translations[path.basename(file, ".json")] = JSON.parse(
              fs.readFileSync(path.join(translationsDir, file), "utf-8"),
            );
          }
        }
      } catch {}

      cachedTranslations = translations;
      const locales = Object.keys(translations).sort();

      const indexedTranslations: Record<string, Record<string, any>> = {};
      for (const [locale, data] of Object.entries(translations)) {
        indexedTranslations[locale] = flattenTranslations(data);
      }

      return {
        locales,
        defaultLocale:
          options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en")),
        prefixDefaultLocale: options?.prefixDefaultLocale ?? true,
        translations: indexedTranslations,
        skipPaths: ["/api", "/_"],
      };
    },
    closeBundle: async () => {
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

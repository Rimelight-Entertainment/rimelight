import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: string[];
}

export const i18n = (options: RimelightI18nPluginOptions = {}): Plugin => {
  let translations: Record<string, any> = {};

  const flatten = (target: any, prefix = "", result: Record<string, any> = {}) => {
    for (const [key, value] of Object.entries(target || {})) {
      if (key in Object.prototype) continue;
      const fullKey = prefix ? `${prefix}.${key}` : key;
      result[fullKey] = value;
      if (value?.constructor === Object) flatten(value, fullKey, result);
    }
    return result;
  };

  return {
    ...defineRimelightArtifactPlugin({
      pkgName: "i18n",
      watch: ({ root }) => [path.resolve(root, options.translationsDir ?? "src/i18n")],
      config: ({ root }) => {
        const dir = path.resolve(root, options.translationsDir ?? "src/i18n");
        translations = fs.existsSync(dir)
          ? Object.fromEntries(
              fs
                .readdirSync(dir)
                .filter((file) => file.endsWith(".json"))
                .map((file) => [
                  path.basename(file, ".json"),
                  flatten(JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"))),
                ]),
            )
          : {};

        const locales = Object.keys(translations).sort();
        return {
          locales,
          defaultLocale:
            options.defaultLocale ?? (locales.includes("en") ? "en" : locales[0]) ?? "en",
          ...options,
          translations,
        };
      },
    }),
    generateBundle() {
      for (const [locale, data] of Object.entries(translations)) {
        this.emitFile({
          type: "asset",
          fileName: `locales/${locale}.json`,
          source: JSON.stringify(data, null, 2),
        });
      }
    },
  };
};

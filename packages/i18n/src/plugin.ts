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

  const flatten = (obj: any, prefix = "", target: Record<string, any> = {}) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
      const key = prefix ? `${prefix}.${k}` : k;
      target[key] = v;
      if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, target);
    }
    return target;
  };

  return {
    ...defineRimelightArtifactPlugin({
      pkgName: "i18n",
      watch: ({ root }) => [path.resolve(root, options.translationsDir ?? "src/i18n")],
      config: ({ root }) => {
        const dir = path.resolve(root, options.translationsDir ?? "src/i18n");
        const files = fs.existsSync(dir)
          ? fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
          : [];

        translations = {};
        for (const file of files) {
          const locale = path.basename(file, ".json");
          translations[locale] = flatten(
            JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8")),
          );
        }

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
    generateBundle(this: any) {
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

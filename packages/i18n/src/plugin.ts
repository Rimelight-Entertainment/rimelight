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

  const flatten = (obj: any, p = "", out: Record<string, any> = {}) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (k in Object.prototype) continue;
      const key = p ? `${p}.${k}` : k;
      out[key] = v;
      if (v?.constructor === Object) flatten(v, key, out);
    }
    return out;
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

        translations = Object.fromEntries(
          files.map((f) => [
            path.basename(f, ".json"),
            flatten(JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))),
          ]),
        );

        const locales = Object.keys(translations).sort();
        return {
          locales,
          defaultLocale:
            options.defaultLocale ?? locales.find((l) => l === "en") ?? locales[0] ?? "en",
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

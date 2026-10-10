import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";
import { flatten } from "./cli";

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: string[];
}

export const i18n = (options: RimelightI18nPluginOptions = {}): Plugin => {
  let translations: Record<string, any> = {};

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
        const defaultLocale =
          options.defaultLocale ?? (locales.includes("en") ? "en" : locales[0]) ?? "en";

        return { ...options, locales, defaultLocale, translations };
      },
      emit: () => {
        const locales = Object.keys(translations).sort();
        const defaultLoc =
          options.defaultLocale ?? (locales.includes("en") ? "en" : locales[0]) ?? "en";
        const firstLocale = locales[0];
        const keys = Object.keys(
          translations[defaultLoc] ?? (firstLocale ? translations[firstLocale] : undefined) ?? {},
        );
        const keyUnion =
          keys.length > 0 ? keys.map((k) => JSON.stringify(k)).join(" | ") : "string";

        return {
          files: {
            "types.d.ts": `declare module "@rimelight/i18n" {\n  interface RimelightTranslationKeys {\n    keys: ${keyUnion};\n  }\n}\n`,
          },
        };
      },
    }),
    generateBundle() {
      Object.entries(translations).forEach(([locale, data]) =>
        this.emitFile({
          type: "asset",
          fileName: `locales/${locale}.json`,
          source: JSON.stringify(data, null, 2),
        }),
      );
    },
  };
};

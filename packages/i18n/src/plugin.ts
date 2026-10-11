import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { flatten, generateTypeDeclarations, writeTypeDeclarations } from "./cli";

export const VIRTUAL_ID = "virtual:rimelight-i18n";
export const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
export const VIRTUAL_SERVER_ID = "virtual:rimelight-i18n/server";
export const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: string[];
  types?: boolean | string;
}

export const i18n = (options: RimelightI18nPluginOptions = {}): Plugin => {
  let root = process.cwd();
  let cachedTranslations: Record<string, Record<string, string>> | null = null;

  const getTranslations = () => {
    if (cachedTranslations) return cachedTranslations;

    const dir = path.resolve(root, options.translationsDir ?? "src/i18n");
    cachedTranslations = fs.existsSync(dir)
      ? Object.fromEntries(
          fs
            .readdirSync(dir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => [
              path.basename(f, ".json"),
              flatten(JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))),
            ]),
        )
      : {};
    return cachedTranslations;
  };

  const emitTypes = () => {
    if (options.types === false) return;
    const typesPath =
      typeof options.types === "string" ? options.types : "node_modules/.rimelight/i18n/keys.d.ts";
    const trans = getTranslations();
    const locales = Object.keys(trans).sort();
    if (locales.length === 0) return;
    const defaultLocale =
      options.defaultLocale ?? (locales.includes("en") ? "en" : locales[0]) ?? "en";
    const baseDict = trans[defaultLocale];
    if (!baseDict) return;

    writeTypeDeclarations(path.resolve(root, typesPath), generateTypeDeclarations(baseDict));
  };

  return {
    name: "rimelight:i18n",
    configResolved(c) {
      const newRoot = c.root ? path.resolve(c.root) : root;
      if (newRoot !== root) {
        root = newRoot;
        cachedTranslations = null;
      }
      emitTypes();
    },
    handleHotUpdate({ file }) {
      if (file.endsWith(".json")) {
        cachedTranslations = null;
        emitTypes();
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        const trans = getTranslations();
        const locales = Object.keys(trans).sort();
        const defaultLocale =
          options.defaultLocale ?? (locales.includes("en") ? "en" : locales[0]) ?? "en";
        const prefixDefaultLocale = options.prefixDefaultLocale ?? true;
        const skipPaths = options.skipPaths ?? ["/api", "/_"];

        return [
          `export const locales = ${JSON.stringify(locales)};`,
          `export const defaultLocale = ${JSON.stringify(defaultLocale)};`,
          `export const prefixDefaultLocale = ${JSON.stringify(prefixDefaultLocale)};`,
          `export const skipPaths = ${JSON.stringify(skipPaths)};`,
          `export const translations = {};`,
          `export default { locales, defaultLocale, prefixDefaultLocale, skipPaths, translations };`,
        ].join("\n");
      }

      if (id === RESOLVED_VIRTUAL_SERVER_ID) {
        return `export const translations = ${JSON.stringify(getTranslations())};\nexport default translations;`;
      }
      return null;
    },
    generateBundle() {
      Object.entries(getTranslations()).forEach(([locale, data]) =>
        this.emitFile({
          type: "asset",
          fileName: `locales/${locale}.json`,
          source: JSON.stringify(data, null, 2),
        }),
      );
    },
  };
};

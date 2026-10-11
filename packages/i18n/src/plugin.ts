import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { flatten, generateTypeDeclarations, writeTypeDeclarations } from "./cli";

const CLIENT_ID = "virtual:rimelight-i18n";
const SERVER_ID = "virtual:rimelight-i18n/server";
const RESOLVED = (id: string) => `\0${id}`;

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
  skipPaths?: string[];
  types?: boolean | string;
}

export const i18n = (options: RimelightI18nPluginOptions = {}): Plugin => {
  let root = process.cwd();
  let cache: Record<string, Record<string, string>> | null = null;

  const loadTranslations = () => {
    if (cache) return cache;
    const dir = path.resolve(root, options.translationsDir ?? "src/i18n");
    if (!fs.existsSync(dir)) return (cache = {});

    return (cache = Object.fromEntries(
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => [
          path.basename(f, ".json"),
          flatten(JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))),
        ]),
    ));
  };

  const getLocales = () => Object.keys(loadTranslations()).sort();
  const getDefaultLocale = (locales = getLocales()) =>
    options.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));

  const emitTypes = () => {
    if (options.types === false) return;
    const trans = loadTranslations();
    const defaultLocale = getDefaultLocale();
    if (!trans[defaultLocale]) return;

    const target = path.resolve(
      root,
      typeof options.types === "string" ? options.types : "node_modules/.rimelight/i18n/keys.d.ts",
    );
    writeTypeDeclarations(target, generateTypeDeclarations(trans[defaultLocale]!));
  };

  return {
    name: "rimelight:i18n",

    configResolved(config) {
      if (config.root && config.root !== root) {
        root = path.resolve(config.root);
        cache = null;
      }
      emitTypes();
    },

    handleHotUpdate({ file }) {
      if (file.endsWith(".json")) {
        cache = null;
        emitTypes();
      }
    },

    resolveId(id) {
      if (id === CLIENT_ID || id === SERVER_ID) return RESOLVED(id);
      return null;
    },

    load(id) {
      if (id === RESOLVED(CLIENT_ID)) {
        const locales = getLocales();
        return `export default ${JSON.stringify({
          locales,
          defaultLocale: getDefaultLocale(locales),
          prefixDefaultLocale: options.prefixDefaultLocale ?? true,
          skipPaths: options.skipPaths ?? ["/api", "/_"],
          translations: {},
        })};`;
      }

      if (id === RESOLVED(SERVER_ID)) {
        return `export default ${JSON.stringify(loadTranslations())};`;
      }
      return null;
    },

    generateBundle() {
      for (const [locale, data] of Object.entries(loadTranslations())) {
        this.emitFile({
          type: "asset",
          fileName: `locales/${locale}.json`,
          source: JSON.stringify(data, null, 2),
        });
      }
    },
  };
};

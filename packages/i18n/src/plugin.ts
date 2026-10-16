import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite-plus";
import { generateTypeDeclarations, writeTypeDeclarations } from "./cli";
import type { I18nConfig } from "./types";

const VIRTUAL_ID = "virtual:rimelight-i18n";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const VIRTUAL_SERVER_ID = "virtual:rimelight-i18n/server";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

export function i18n(options: I18nConfig = {}): Plugin {
  let root = process.cwd();
  let cache: Record<string, Record<string, unknown>> | null = null;

  const getTranslationsDir = () => path.resolve(root, options.translationsDir ?? "src/i18n");

  const loadTranslations = () => {
    if (cache) return cache;
    const dir = getTranslationsDir();
    if (!fs.existsSync(dir)) return (cache = {});

    return (cache = Object.fromEntries(
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => [
          path.basename(f, ".json"),
          JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as Record<string, unknown>,
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

  const isTranslationFile = (file: string): boolean => {
    if (!file.endsWith(".json")) return false;
    const rel = path.relative(getTranslationsDir(), file);
    return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
  };

  const resetTranslations = () => {
    cache = null;
    emitTypes();
  };

  const invalidateVirtualModules = (server: ViteDevServer) => {
    const graphs: Array<{
      getModuleById?: (id: string) => unknown;
      invalidateModule?: (mod: unknown) => void;
    }> = server.environments
      ? Object.values(server.environments).map((env) => env.moduleGraph)
      : ([server.moduleGraph].filter(Boolean) as { getModuleById?: (id: string) => unknown }[]);
    for (const graph of graphs) {
      for (const id of [RESOLVED_VIRTUAL_ID, RESOLVED_VIRTUAL_SERVER_ID]) {
        const mod = graph.getModuleById?.(id);
        if (mod) graph.invalidateModule?.(mod);
      }
    }
  };

  return {
    name: "rimelight:i18n",
    enforce: "pre",

    configResolved(config) {
      if (config.root && config.root !== root) {
        root = path.resolve(config.root);
        cache = null;
      }
      emitTypes();
    },

    hotUpdate(options) {
      if ((this as { environment?: { name?: string } }).environment?.name !== "client") return;
      if (!isTranslationFile(options.file)) return;
      resetTranslations();
      invalidateVirtualModules(options.server);
      options.server.ws.send({ type: "full-reload" });
      return [];
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        const locales = getLocales();
        return `export default ${JSON.stringify({
          locales,
          defaultLocale: getDefaultLocale(locales),
          prefixDefaultLocale: options.prefixDefaultLocale ?? true,
          skipPaths: options.skipPaths ?? ["/api", "/_"],
          translations: {},
        })};`;
      }

      if (id === RESOLVED_VIRTUAL_SERVER_ID) {
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
}

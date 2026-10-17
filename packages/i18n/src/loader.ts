import fs from "node:fs";
import path from "node:path";
import type { I18nConfig } from "./types";
import { generateTypeDeclarations, writeTypeDeclarations } from "./cli";

export interface I18nLoader {
  root: string;
  getTranslationsDir: () => string;
  loadTranslations: () => Record<string, Record<string, unknown>>;
  getLocales: () => string[];
  getDefaultLocale: (locales?: string[]) => string;
  emitTypes: () => void;
  isTranslationFile: (file: string) => boolean;
  resetTranslations: () => void;
  invalidateVirtualModules: (server: any, resolvedId: string) => void;
  buildConfigPayload: () => {
    locales: string[];
    defaultLocale: string;
    prefixDefaultLocale: boolean;
    skipPaths: readonly string[] | string[];
    translations: Record<string, Record<string, unknown>>;
  };
}

export function createI18nLoader(options: I18nConfig = {}): I18nLoader {
  const root = options.root ? path.resolve(options.root) : process.cwd();
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

  const invalidateVirtualModules = (server: any, resolvedId: string) => {
    const graphs: Array<{
      getModuleById?: (id: string) => unknown;
      invalidateModule?: (mod: unknown) => void;
    }> = server.environments
      ? Object.values(server.environments).map((env: any) => env.moduleGraph)
      : ([server.moduleGraph].filter(Boolean) as { getModuleById?: (id: string) => unknown }[]);
    for (const graph of graphs) {
      const mod = graph.getModuleById?.(resolvedId);
      if (mod) graph.invalidateModule?.(mod);
    }
  };

  const buildConfigPayload = () => {
    emitTypes();
    const locales = getLocales();
    return {
      locales,
      defaultLocale: getDefaultLocale(locales),
      prefixDefaultLocale: options.prefixDefaultLocale ?? true,
      skipPaths: options.skipPaths ?? ["/api", "/_"],
      translations: loadTranslations(),
    };
  };

  return {
    root,
    getTranslationsDir,
    loadTranslations,
    getLocales,
    getDefaultLocale,
    emitTypes,
    isTranslationFile,
    resetTranslations,
    invalidateVirtualModules,
    buildConfigPayload,
  };
}

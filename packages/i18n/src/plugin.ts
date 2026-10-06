import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

/** Default directory containing `<locale>.json` files, relative to the project root. */
export const DEFAULT_TRANSLATIONS_DIR = "src/i18n";

/** Candidate directories the CLI searches when no `--dir` is passed. */
export const TRANSLATIONS_DIR_CANDIDATES = [
  "src/i18n",
  "i18n",
  "src/locales",
  "locales",
  "src/assets/i18n",
];

/**
 * Resolves the translations directory for the Vite plugin (fixed default or explicitly configured,
 * relative to `root` or absolute).
 */
export function resolveTranslationsDir(root: string, specifiedDir?: string): string {
  return path.resolve(root, specifiedDir ?? DEFAULT_TRANSLATIONS_DIR);
}

/**
 * Finds the translations directory for the CLI: an explicit `--dir` must exist, otherwise the
 * well-known candidate directories are probed in order.
 */
export function findTranslationsDir(cwd: string, customDir?: string): string | null {
  if (customDir) {
    const resolved = path.resolve(cwd, customDir);
    return fs.existsSync(resolved) ? resolved : null;
  }

  for (const rel of TRANSLATIONS_DIR_CANDIDATES) {
    const resolved = path.join(cwd, rel);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      return resolved;
    }
  }

  return null;
}

export interface ReadLocaleFilesResult {
  /** All `<locale>.json` file names found in the directory. */
  files: string[];
  /** Parsed translations keyed by locale. */
  translations: Record<string, Record<string, any>>;
  /** Files that could not be parsed, in directory order. */
  errors: { file: string; error: unknown }[];
}

/**
 * Reads every `<locale>.json` file in `dirPath`, optionally restricted to `locales`. Unreadable or
 * invalid JSON files are reported through `errors` instead of throwing.
 */
export function readLocaleFiles(
  dirPath: string,
  locales?: readonly string[],
): ReadLocaleFilesResult {
  const files: string[] = [];
  const translations: Record<string, Record<string, any>> = {};
  const errors: { file: string; error: unknown }[] = [];

  let entries: string[];
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return { files, translations, errors };
  }

  for (const file of entries) {
    if (!file.endsWith(".json")) continue;
    const locale = path.basename(file, ".json");
    if (locales && !locales.includes(locale)) continue;

    files.push(file);
    try {
      const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
      translations[locale] = JSON.parse(content);
    } catch (error) {
      errors.push({ file, error });
    }
  }

  return { files, translations, errors };
}

/**
 * Flattens translations into the `{ key, value }` entries written to
 * `<outDir>/_translations-seed.json` for `wrangler kv:bulk put`. Each locale is written twice: as
 * an aggregate `locale:<locale>` key (one read per request by the middleware) and as per-component
 * `locale:<locale>:<component>` keys for granular access.
 */
function buildKvSeed(translations: Record<string, Record<string, any>>): {
  keys: { key: string; value: string }[];
} {
  const keys: { key: string; value: string }[] = [];
  for (const [locale, localeData] of Object.entries(translations)) {
    keys.push({ key: `locale:${locale}`, value: JSON.stringify(localeData) });
    for (const [component, componentData] of Object.entries(localeData)) {
      keys.push({
        key: `locale:${locale}:${component}`,
        value: JSON.stringify(componentData),
      });
    }
  }
  return { keys };
}

const VIRTUAL_CONFIG_ID = "virtual:rimelight-i18n-config";
const RESOLVED_VIRTUAL_CONFIG_ID = `\0${VIRTUAL_CONFIG_ID}`;

export interface RimelightI18nOptions<
  TLocale extends string = string,
  TLocales extends readonly TLocale[] = readonly TLocale[],
> {
  /**
   * List of supported locale codes (e.g. `["en", "pt"]`).
   * If omitted, locales will be automatically inferred from JSON files in `translationsDir` (or `./src/i18n`).
   */
  locales?: TLocales;
  /**
   * The default locale code (e.g. `"en"`).
   * Strictly typed according to the `locales` list.
   */
  defaultLocale?: TLocales extends readonly [any, ...any[]]
    ? TLocales[number]
    : [TLocale] extends [never]
      ? string
      : TLocale;
  /**
   * Directory containing translation JSON files (`${locale}.json`), relative to Vite project root or absolute.
   * Defaults to `"src/i18n"` (or `"./src/i18n"`).
   */
  translationsDir?: string;
  /**
   * Whether to prefix the default locale in URLs.
   *
   * - `true` (default): all locales are prefixed — `/en/about`, `/pt/about`
   * - `false`: the default locale has no prefix — `/about`, `/pt/about`
   */
  prefixDefaultLocale?: boolean;
  /**
   * The Cloudflare KV namespace binding name used when seeding translations (default: "TRANSLATIONS_KV").
   */
  kvBinding?: string;
  /**
   * Optional manual translations map. If omitted, translations are loaded automatically
   * from `${translationsDir}/${locale}.json`.
   */
  translations?: Record<string, Record<string, any>>;
}

export type RimelightI18nPlugins = Plugin[];

function discoverTranslations(
  root: string,
  specifiedDir?: string,
  specifiedLocales?: readonly string[],
): { locales: string[]; translations: Record<string, any>; dirPath: string | null } {
  const dirPath = resolveTranslationsDir(root, specifiedDir);
  const { translations } = readLocaleFiles(dirPath, specifiedLocales);

  let finalLocales: string[];
  if (specifiedLocales && specifiedLocales.length > 0) {
    finalLocales = [...specifiedLocales];
  } else {
    const discovered = Object.keys(translations).sort();
    finalLocales = discovered.length > 0 ? discovered : ["en"];
  }

  return {
    locales: finalLocales,
    translations,
    dirPath: fs.existsSync(dirPath) ? dirPath : null,
  };
}

/**
 * Pure Vite plugin for Rimelight i18n. Provides the virtual module
 * `virtual:rimelight-i18n-config` with locales, defaultLocale, prefixDefaultLocale, and
 * translations, plus KV seed generation on `closeBundle`.
 */
export function i18n<
  const TLocale extends string = string,
  const TLocales extends readonly TLocale[] = readonly TLocale[],
>(options?: RimelightI18nOptions<TLocale, TLocales>): RimelightI18nPlugins {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  let root = process.cwd();

  const getResolvedConfig = () => {
    const discovered = discoverTranslations(root, options?.translationsDir, options?.locales);
    const locales = options?.locales ? [...options.locales] : discovered.locales;
    const defaultLocale =
      options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));

    return {
      locales,
      defaultLocale,
      prefixDefaultLocale,
      translations: options?.translations ?? discovered.translations,
      dirPath: discovered.dirPath,
    };
  };

  return [
    {
      name: "vite-plugin-rimelight-i18n-config",
      configResolved(resolvedConfig) {
        root = resolvedConfig.root ?? process.cwd();
      },
      resolveId(id: string) {
        if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
        return null;
      },
      load(id: string) {
        if (id === RESOLVED_VIRTUAL_CONFIG_ID) {
          const cfg = getResolvedConfig();

          // Watch all discovered translation files in the translations directory
          if (cfg.dirPath && fs.existsSync(cfg.dirPath)) {
            try {
              for (const file of fs.readdirSync(cfg.dirPath)) {
                if (file.endsWith(".json")) {
                  this.addWatchFile(path.join(cfg.dirPath, file));
                }
              }
            } catch {
              // Ignore watch error
            }
          }

          const { locales, defaultLocale, prefixDefaultLocale, translations } = cfg;
          return [
            `export const locales = ${JSON.stringify(locales)};`,
            `export const defaultLocale = ${JSON.stringify(defaultLocale)};`,
            `export const prefixDefaultLocale = ${JSON.stringify(prefixDefaultLocale)};`,
            `export const translations = ${JSON.stringify(translations)};`,
            `export default { locales, defaultLocale };`,
          ].join("\n");
        }
        return null;
      },
      async handleHotUpdate(ctx) {
        const { dirPath } = getResolvedConfig();
        if (dirPath && ctx.file.startsWith(dirPath) && ctx.file.endsWith(".json")) {
          const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_CONFIG_ID);
          if (mod) ctx.server.moduleGraph.invalidateModule(mod);
          ctx.server.ws.send({
            type: "full-reload",
          });
        }
      },
      async closeBundle() {
        const cfg = getResolvedConfig();
        if (!cfg.translations || Object.keys(cfg.translations).length === 0) return;

        const seedData = buildKvSeed(cfg.translations);
        const outDir = process.env["WRANGLER_OUT_DIR"] ?? "dist";
        const seedFile = path.join(outDir, "_translations-seed.json");
        try {
          fs.mkdirSync(path.dirname(seedFile), { recursive: true });
          fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

          const autoSeed =
            process.env["WRANGLER_SEED_KV"] === "true" || process.env["CI"] === "true";
          if (autoSeed) {
            const { execSync } = await import("node:child_process");
            execSync(`npx wrangler kv:bulk put --binding "${kvBinding}" "${seedFile}"`, {
              stdio: "pipe",
              timeout: 30_000,
            });
          }
        } catch {
          // Ignore if directory cannot be written or during watch mode
        }
      },
    },
  ];
}

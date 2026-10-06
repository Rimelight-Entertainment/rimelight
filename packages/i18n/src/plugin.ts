import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

/** Default directory containing `<locale>.json` files, relative to the project root. */
export const DEFAULT_TRANSLATIONS_DIR = "src/i18n";

/**
 * Resolves the translations directory for the Vite plugin (fixed default "src/i18n" or explicitly configured,
 * relative to `root` or absolute).
 */
export function resolveTranslationsDir(root: string, specifiedDir?: string): string {
  return path.resolve(root, specifiedDir ?? DEFAULT_TRANSLATIONS_DIR);
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
 * Reads every `<locale>.json` file in `dirPath`. Unreadable or invalid JSON files are reported
 * through `errors` instead of throwing.
 */
export function readLocaleFiles(dirPath: string): ReadLocaleFilesResult {
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

export interface RimelightI18nOptions {
  /**
   * The default locale code (e.g. `"en"`).
   * If omitted, defaults to `"en"` if present, otherwise the first discovered locale.
   */
  defaultLocale?: string;
  /**
   * Directory containing translation JSON files (`${locale}.json`), relative to Vite project root or absolute.
   * Defaults to `"src/i18n"`.
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
   * The Cloudflare KV namespace binding name used when seeding translations and read by the
   * middleware for runtime translation overrides (default: "TRANSLATIONS_KV").
   */
  kvBinding?: string;
  /**
   * Path prefixes that never render a localized page: no locale redirect and no KV read. Matched
   * exactly or as a segment prefix (`/api` skips `/api` and `/api/users`, not `/apiflow`).
   * Defaults to `["/api", "/_"]`.
   */
  skipPaths?: string[];
}

export type RimelightI18nPlugins = Plugin[];

function discoverTranslations(
  root: string,
  specifiedDir?: string,
): { locales: string[]; translations: Record<string, any>; dirPath: string | null } {
  const dirPath = resolveTranslationsDir(root, specifiedDir);
  const { translations } = readLocaleFiles(dirPath);
  const discovered = Object.keys(translations).sort();
  const locales = discovered.length > 0 ? discovered : ["en"];

  return {
    locales,
    translations,
    dirPath: fs.existsSync(dirPath) ? dirPath : null,
  };
}

/**
 * Pure Vite plugin for Rimelight i18n. Provides the virtual module
 * `virtual:rimelight-i18n-config` with locales, defaultLocale, prefixDefaultLocale,
 * translations, kvBinding, and skipPaths — the single source of truth consumed by the runtime
 * and middleware — plus KV seed generation on `closeBundle`.
 */
export function i18n(options?: RimelightI18nOptions): RimelightI18nPlugins {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  const skipPaths = options?.skipPaths ?? ["/api", "/_"];
  let root = process.cwd();

  const getResolvedConfig = () => {
    const discovered = discoverTranslations(root, options?.translationsDir);
    const locales = discovered.locales;
    const defaultLocale =
      options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));
    const translations = discovered.translations;

    return {
      locales,
      defaultLocale,
      prefixDefaultLocale,
      translations,
      kvBinding,
      skipPaths,
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

          const {
            locales,
            defaultLocale,
            prefixDefaultLocale,
            translations,
            kvBinding,
            skipPaths,
          } = cfg;
          return [
            `export const locales = ${JSON.stringify(locales)};`,
            `export const defaultLocale = ${JSON.stringify(defaultLocale)};`,
            `export const prefixDefaultLocale = ${JSON.stringify(prefixDefaultLocale)};`,
            `export const translations = ${JSON.stringify(translations)};`,
            `export const kvBinding = ${JSON.stringify(kvBinding)};`,
            `export const skipPaths = ${JSON.stringify(skipPaths)};`,
            `export default { locales, defaultLocale, prefixDefaultLocale, translations, kvBinding, skipPaths };`,
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

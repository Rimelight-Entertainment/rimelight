import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

/** Default directory containing `<locale>.json` files, relative to the project root. */
export const DEFAULT_TRANSLATIONS_DIR = "src/i18n";

/** Candidate directories probed in order when no explicit directory is configured. */
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
 * Finds the translations directory: an explicit custom directory must exist, otherwise the
 * candidate directories are probed in order.
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
   * If omitted, candidate directories (`src/i18n`, `i18n`, `src/locales`, `locales`, `src/assets/i18n`) are probed in order.
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
}

export type RimelightI18nPlugins = Plugin[];

const DEFAULT_HTML_LANGS: Record<string, string> = {
  en: "en-US",
  pt: "pt-BR",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

/**
 * Infers BCP-47 HTML lang tags from locale file names, file metadata, or language defaults.
 */
function inferHtmlLangs(
  locales: readonly string[],
  translations: Record<string, Record<string, any>>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const loc of locales) {
    const dict = translations[loc];
    const explicitMetaLang =
      dict &&
      (typeof dict["_lang"] === "string"
        ? dict["_lang"]
        : typeof dict["_htmlLang"] === "string"
          ? dict["_htmlLang"]
          : typeof dict["htmlLang"] === "string"
            ? dict["htmlLang"]
            : typeof dict["meta"]?.["lang"] === "string"
              ? dict["meta"]["lang"]
              : null);

    if (explicitMetaLang) {
      result[loc] = explicitMetaLang;
    } else if (loc.includes("-") || loc.includes("_")) {
      result[loc] = loc.replace(/_/g, "-");
    } else if (DEFAULT_HTML_LANGS[loc]) {
      result[loc] = DEFAULT_HTML_LANGS[loc];
    } else {
      result[loc] = loc;
    }
  }

  return result;
}

function discoverTranslations(
  root: string,
  specifiedDir?: string,
): { locales: string[]; translations: Record<string, any>; dirPath: string | null } {
  const dirPath = specifiedDir
    ? resolveTranslationsDir(root, specifiedDir)
    : (findTranslationsDir(root) ?? resolveTranslationsDir(root, DEFAULT_TRANSLATIONS_DIR));

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
 * `virtual:rimelight-i18n-config` with locales, defaultLocale, prefixDefaultLocale, htmlLangs,
 * and translations, plus KV seed generation on `closeBundle`.
 */
export function i18n(options?: RimelightI18nOptions): RimelightI18nPlugins {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? true;
  let root = process.cwd();

  const getResolvedConfig = () => {
    const discovered = discoverTranslations(root, options?.translationsDir);
    const locales = discovered.locales;
    const defaultLocale =
      options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en"));
    const translations = discovered.translations;
    const htmlLangs = inferHtmlLangs(locales, translations);

    return {
      locales,
      defaultLocale,
      prefixDefaultLocale,
      htmlLangs,
      translations,
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

          const { locales, defaultLocale, prefixDefaultLocale, htmlLangs, translations } = cfg;
          return [
            `export const locales = ${JSON.stringify(locales)};`,
            `export const defaultLocale = ${JSON.stringify(defaultLocale)};`,
            `export const prefixDefaultLocale = ${JSON.stringify(prefixDefaultLocale)};`,
            `export const htmlLangs = ${JSON.stringify(htmlLangs)};`,
            `export const translations = ${JSON.stringify(translations)};`,
            `export default { locales, defaultLocale, prefixDefaultLocale, htmlLangs, translations };`,
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

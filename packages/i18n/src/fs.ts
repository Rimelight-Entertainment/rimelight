import fs from "node:fs";
import path from "node:path";

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

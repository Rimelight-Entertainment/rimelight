import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { readLocaleFiles, resolveTranslationsDir } from "./plugin";

type FlattenedTranslations = { [key: string]: string };

interface PlaceholderMismatch {
  key: string;
  basePlaceholders: string[];
  targetPlaceholders: string[];
}

interface TranslationAuditReport {
  isValid: boolean;
  totalKeys: number;
  locales: string[];
  defaultLocale: string;
  missingKeys: Record<string, string[]>;
  staleKeys: Record<string, string[]>;
  emptyKeys: Record<string, string[]>;
  placeholderMismatches: Record<string, PlaceholderMismatch[]>;
  stats: {
    completion: Record<string, string>;
  };
}

interface VerifyTranslationsOptions {
  defaultLocale?: string;
  allowEmpty?: boolean;
}

/** Keys skipped while flattening/unflattening (prototype pollution guard). */
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Flattens deeply nested translation objects or arrays into dot-notated paths. Arrays are
 * traversed through their numeric indices (`tags.0`), so objects and arrays share one branch.
 */
export function flatten(
  obj: Record<string, any>,
  prefix: string = "",
  result: FlattenedTranslations = {},
): FlattenedTranslations {
  if (obj == null || typeof obj !== "object") {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (UNSAFE_KEYS.has(key)) continue;

    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object") {
      flatten(value, fullPath, result);
    } else {
      result[fullPath] = value != null ? String(value) : "";
    }
  }

  return result;
}

/**
 * Unflattens a dot-notated translation map back into a nested object structure.
 */
export function unflatten(flat: FlattenedTranslations): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current: any = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (UNSAFE_KEYS.has(part)) break;

      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        if (current[part] == null || typeof current[part] !== "object") {
          current[part] = /^\d+$/.test(parts[i + 1] ?? "") ? [] : {};
        }
        current = current[part];
      }
    }
  }

  return result;
}

/**
 * Extracts all dotted translation keys from a translation dictionary.
 */
export function extractKeys(source: Record<string, any>): string[] {
  return Object.keys(flatten(source));
}

/**
 * Extracts all interpolation variables like `{name}` or `{count}` from a string.
 */
export function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}

function diffKeys(
  baseFlat: FlattenedTranslations,
  targetFlat: FlattenedTranslations,
): { missing: string[]; stale: string[] } {
  const missing: string[] = [];
  const stale: string[] = [];

  for (const key of Object.keys(baseFlat)) {
    if (!(key in targetFlat)) {
      missing.push(key);
    }
  }
  for (const key of Object.keys(targetFlat)) {
    if (!(key in baseFlat)) {
      stale.push(key);
    }
  }

  return { missing, stale };
}

/**
 * Compares a target translation dictionary against a base translation dictionary, returning any
 * missing deep dotted keys.
 */
export function findMissingKeys(base: Record<string, any>, target: Record<string, any>): string[] {
  return diffKeys(flatten(base), flatten(target)).missing;
}

/**
 * Compares a target translation dictionary against a base translation dictionary, returning any
 * stale/orphaned keys present in target but absent in base.
 */
export function findStaleKeys(base: Record<string, any>, target: Record<string, any>): string[] {
  return diffKeys(flatten(base), flatten(target)).stale;
}

/**
 * Runs a comprehensive audit across all translation dictionaries comparing against
 * base/defaultLocale. Each locale is flattened exactly once and all checks (missing, stale,
 * empty, placeholder mismatches, completion) run in a single pass over the flat maps.
 */
export function verifyTranslations(
  translations: Record<string, Record<string, any>>,
  options: VerifyTranslationsOptions = {},
): TranslationAuditReport {
  const defaultLocale = options.defaultLocale || "en";
  const allowEmpty = options.allowEmpty ?? false;
  const locales = Object.keys(translations);

  const baseFlat = flatten(translations[defaultLocale] ?? {});
  const totalKeys = Object.keys(baseFlat).length;

  const missingKeys: Record<string, string[]> = {};
  const staleKeys: Record<string, string[]> = {};
  const emptyKeys: Record<string, string[]> = {};
  const placeholderMismatches: Record<string, PlaceholderMismatch[]> = {};
  const completion: Record<string, string> = {};

  let isValid = true;

  for (const locale of locales) {
    const targetFlat = flatten(translations[locale] ?? {});
    const { missing, stale } = diffKeys(baseFlat, targetFlat);
    const empty: string[] = [];
    const mismatches: PlaceholderMismatch[] = [];

    for (const [key, val] of Object.entries(targetFlat)) {
      if (!allowEmpty && val.trim() === "") {
        empty.push(key);
      }

      if (key in baseFlat) {
        const baseHolders = extractPlaceholders(baseFlat[key] ?? "").sort();
        const targetHolders = extractPlaceholders(val).sort();
        if (JSON.stringify(baseHolders) !== JSON.stringify(targetHolders)) {
          mismatches.push({
            key,
            basePlaceholders: baseHolders,
            targetPlaceholders: targetHolders,
          });
        }
      }
    }

    if (empty.length > 0) {
      emptyKeys[locale] = empty;
      isValid = false;
    }
    if (mismatches.length > 0) {
      placeholderMismatches[locale] = mismatches;
      isValid = false;
    }
    if (locale !== defaultLocale) {
      if (missing.length > 0) {
        missingKeys[locale] = missing;
        isValid = false;
      }
      if (stale.length > 0) {
        staleKeys[locale] = stale;
        isValid = false;
      }
    }

    const percentage =
      totalKeys > 0 ? Math.round(((totalKeys - missing.length) / totalKeys) * 100) : 100;
    completion[locale] = `${percentage}%`;
  }

  return {
    isValid,
    totalKeys,
    locales,
    defaultLocale,
    missingKeys,
    staleKeys,
    emptyKeys,
    placeholderMismatches,
    stats: {
      completion,
    },
  };
}

/**
 * Formats a TranslationAuditReport into a human-readable diagnostic message.
 */
export function formatAuditReport(report: TranslationAuditReport): string {
  if (report.isValid) {
    return `✔ [i18n] Verified ${report.locales.length} locales (${report.locales.join(", ")}) — ${report.totalKeys} keys synchronized with 0 issues.`;
  }

  const lines: string[] = [];
  lines.push(`✖ [i18n] Translation verification failed:`);

  for (const locale of report.locales) {
    const missing = report.missingKeys[locale];
    const stale = report.staleKeys[locale];
    const empty = report.emptyKeys[locale];
    const mismatches = report.placeholderMismatches[locale];

    if (!missing && !stale && !empty && !mismatches) continue;

    lines.push(`\n  [${locale}] (${report.stats.completion[locale]} complete):`);

    if (missing && missing.length > 0) {
      lines.push(`    Missing Keys (${missing.length}):`);
      for (const k of missing) lines.push(`      - ${k}`);
    }

    if (stale && stale.length > 0) {
      lines.push(`    Stale Keys (${stale.length}, not in '${report.defaultLocale}'):`);
      for (const k of stale) lines.push(`      - ${k}`);
    }

    if (empty && empty.length > 0) {
      lines.push(`    Empty Keys (${empty.length}):`);
      for (const k of empty) lines.push(`      - ${k}`);
    }

    if (mismatches && mismatches.length > 0) {
      lines.push(`    Placeholder Mismatches (${mismatches.length}):`);
      for (const m of mismatches) {
        lines.push(
          `      - ${m.key}: expected {${m.basePlaceholders.join(", ")}}, found {${m.targetPlaceholders.join(", ")}}`,
        );
      }
    }
  }

  return lines.join("\n");
}

/**
 * Automatically prunes stale keys and injects missing key skeletons from the base locale.
 */
export function fixTranslations(
  translations: Record<string, Record<string, any>>,
  defaultLocale: string = "en",
): Record<string, Record<string, any>> {
  const baseFlat = flatten(translations[defaultLocale] ?? {});

  return Object.fromEntries(
    Object.entries(translations).map(([locale, dict]): [string, Record<string, any>] => {
      if (locale === defaultLocale) return [locale, dict];

      const targetFlat = flatten(dict);
      const fixedFlat: FlattenedTranslations = {};
      for (const [key, value] of Object.entries(baseFlat)) {
        fixedFlat[key] = targetFlat[key] ?? value;
      }
      return [locale, unflatten(fixedFlat)];
    }),
  );
}

// ── CLI ───────────────────────────────────────────────────────────────────────────────────────

const HELP_TEXT = `
Usage:
  rimelight-i18n [action] [options]

Actions:
  check (default)  Verify translation files across locales for missing, stale, or invalid keys

Options:
  -d, --dir <path>     Directory containing <locale>.json files (auto-discovered if omitted)
  -b, --base <locale>  Base/default locale code to compare against (default: "en")
  -f, --fix            Auto-prune stale keys and generate missing key skeletons
  --allow-empty        Do not treat empty strings as missing/invalid translations
  -h, --help           Show this help message
`;

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      dir: { type: "string", short: "d" },
      base: { type: "string", short: "b", default: "en" },
      fix: { type: "boolean", short: "f", default: false },
      "allow-empty": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    return 0;
  }

  const action = positionals[0] || "check";
  if (action !== "check") {
    console.error(`Unknown action: '${action}'. Run 'rimelight-i18n --help' for usage.`);
    return 1;
  }

  const localesDir = resolveTranslationsDir(process.cwd(), values.dir);
  if (!fs.existsSync(localesDir) || !fs.statSync(localesDir).isDirectory()) {
    console.error(
      `✖ [i18n] Could not find translation directory. Pass --dir <path> (e.g. --dir src/i18n)`,
    );
    return 1;
  }

  const { files, translations, errors } = readLocaleFiles(localesDir);
  if (files.length === 0) {
    console.error(`✖ [i18n] No .json translation files found in ${localesDir}`);
    return 1;
  }
  if (errors.length > 0) {
    const { file, error } = errors[0]!;
    console.error(`✖ [i18n] Failed to parse ${file}: ${(error as any)?.message || error}`);
    return 1;
  }

  const baseLocale = values.base || "en";
  if (!translations[baseLocale]) {
    console.error(
      `✖ [i18n] Base locale '${baseLocale}' not found in ${localesDir} (found: ${Object.keys(translations).join(", ")})`,
    );
    return 1;
  }

  let report = verifyTranslations(translations, {
    defaultLocale: baseLocale,
    allowEmpty: values["allow-empty"],
  });

  if (!report.isValid && values.fix) {
    console.log(`ℹ [i18n] Fixing translation files in ${localesDir}...`);
    const fixed = fixTranslations(translations, baseLocale);
    for (const [locale, data] of Object.entries(fixed)) {
      const filePath = path.join(localesDir, `${locale}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    }
    report = verifyTranslations(fixed, {
      defaultLocale: baseLocale,
      allowEmpty: values["allow-empty"],
    });
    console.log(`✔ [i18n] Successfully updated translation files.`);
  }

  const formatted = formatAuditReport(report);
  if (report.isValid) {
    console.log(formatted);
    return 0;
  } else {
    console.error(formatted);
    if (!values.fix) {
      console.error(
        `\nRun with --fix to automatically prune stale keys and generate missing skeletons.`,
      );
    }
    return 1;
  }
}

// Execute directly if run via CLI
if (
  process.argv[1] &&
  (import.meta.url === pathToFileURL(process.argv[1]).href ||
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/")))
) {
  void runCli().then((code) => {
    if (code !== 0) {
      process.exit(code);
    }
  });
}

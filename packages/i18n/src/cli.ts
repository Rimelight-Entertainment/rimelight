import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

type FlattenedTranslations = Record<string, string>;

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
  stats: { completion: Record<string, string> };
}

interface VerifyTranslationsOptions {
  defaultLocale?: string;
  allowEmpty?: boolean;
}

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Flattens nested translation objects or arrays into dot-notated paths. */
export function flatten(
  obj: Record<string, any>,
  prefix = "",
  result: FlattenedTranslations = {},
): FlattenedTranslations {
  if (obj == null || typeof obj !== "object") return result;
  for (const [key, value] of Object.entries(obj)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object") flatten(value, fullPath, result);
    else result[fullPath] = value;
  }
  return result;
}

/** Unflattens dot-notated translation map back into a nested object structure. */
export function unflatten(flat: FlattenedTranslations): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let cur: any = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (UNSAFE_KEYS.has(part)) break;
      if (i === parts.length - 1) {
        cur[part] = value;
      } else {
        if (cur[part] == null || typeof cur[part] !== "object") {
          cur[part] = /^\d+$/.test(parts[i + 1] ?? "") ? [] : {};
        }
        cur = cur[part];
      }
    }
  }
  return result;
}

export const extractKeys = (source: Record<string, any>): string[] => Object.keys(flatten(source));

export const extractPlaceholders = (str: string | number | boolean): string[] =>
  typeof str === "string"
    ? Array.from(new Set(str.match(/\{(\w+)\}/g)?.map((m) => m.slice(1, -1)) ?? []))
    : [];

const diffKeys = (baseFlat: FlattenedTranslations, targetFlat: FlattenedTranslations) => ({
  missing: Object.keys(baseFlat).filter((k) => !(k in targetFlat)),
  stale: Object.keys(targetFlat).filter((k) => !(k in baseFlat)),
});

export const findMissingKeys = (base: Record<string, any>, target: Record<string, any>): string[] =>
  diffKeys(flatten(base), flatten(target)).missing;

export const findStaleKeys = (base: Record<string, any>, target: Record<string, any>): string[] =>
  diffKeys(flatten(base), flatten(target)).stale;

/** Audits translation files for missing, stale, empty, or mismatched placeholder keys. */
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
      if (!allowEmpty && String(val).trim() === "") empty.push(key);
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

    if (empty.length) {
      emptyKeys[locale] = empty;
      isValid = false;
    }
    if (mismatches.length) {
      placeholderMismatches[locale] = mismatches;
      isValid = false;
    }
    if (locale !== defaultLocale) {
      if (missing.length) {
        missingKeys[locale] = missing;
        isValid = false;
      }
      if (stale.length) {
        staleKeys[locale] = stale;
        isValid = false;
      }
    }

    completion[locale] =
      `${totalKeys > 0 ? Math.round(((totalKeys - missing.length) / totalKeys) * 100) : 100}%`;
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
    stats: { completion },
  };
}

/** Formats a TranslationAuditReport into a human-readable diagnostic message. */
export function formatAuditReport(report: TranslationAuditReport): string {
  if (report.isValid) {
    return `✔ [i18n] Verified ${report.locales.length} locales (${report.locales.join(", ")}) — ${report.totalKeys} keys synchronized with 0 issues.`;
  }
  const lines = ["✖ [i18n] Translation verification failed:"];
  for (const locale of report.locales) {
    const missing = report.missingKeys[locale];
    const stale = report.staleKeys[locale];
    const empty = report.emptyKeys[locale];
    const mismatches = report.placeholderMismatches[locale];
    if (!missing && !stale && !empty && !mismatches) continue;

    lines.push(`\n  [${locale}] (${report.stats.completion[locale]} complete):`);
    if (missing?.length)
      lines.push(`    Missing Keys (${missing.length}):`, ...missing.map((k) => `      - ${k}`));
    if (stale?.length)
      lines.push(
        `    Stale Keys (${stale.length}, not in '${report.defaultLocale}'):`,
        ...stale.map((k) => `      - ${k}`),
      );
    if (empty?.length)
      lines.push(`    Empty Keys (${empty.length}):`, ...empty.map((k) => `      - ${k}`));
    if (mismatches?.length) {
      lines.push(
        `    Placeholder Mismatches (${mismatches.length}):`,
        ...mismatches.map(
          (m) =>
            `      - ${m.key}: expected {${m.basePlaceholders.join(", ")}}, found {${m.targetPlaceholders.join(", ")}}`,
        ),
      );
    }
  }
  return lines.join("\n");
}

/** Automatically prunes stale keys and injects missing key skeletons from base locale. */
export function fixTranslations(
  translations: Record<string, Record<string, any>>,
  defaultLocale = "en",
): Record<string, Record<string, any>> {
  const baseFlat = flatten(translations[defaultLocale] ?? {});
  return Object.fromEntries(
    Object.entries(translations).map(([locale, dict]) => {
      if (locale === defaultLocale) return [locale, dict];
      const targetFlat = flatten(dict);
      const fixedFlat: FlattenedTranslations = {};
      for (const [key, value] of Object.entries(baseFlat))
        fixedFlat[key] = targetFlat[key] ?? value;
      return [locale, unflatten(fixedFlat)];
    }),
  );
}

/** Generates TypeScript declaration file typing all dot-notated translation keys. */
export function generateTypeDeclarations(baseDict: Record<string, any>): string {
  const keys = extractKeys(baseDict).sort();
  const union = keys.length > 0 ? keys.map((k) => JSON.stringify(k)).join(" | ") : "string";
  return `declare module "@rimelight/i18n" {\n  export const t: import("@rimelight/i18n").TFunction<${union}>;\n}\n`;
}

/** Writes declaration file only if content changed to avoid touching filesystem mtime. */
export function writeTypeDeclarations(targetPath: string, content: string): boolean {
  if (fs.existsSync(targetPath) && fs.readFileSync(targetPath, "utf-8") === content) return false;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, "utf-8");
  return true;
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const HELP_TEXT = `
Usage:
  rimelight-i18n [action] [options]

Actions:
  check (default)  Verify translation files across locales for missing, stale, or invalid keys
  types            Generate TypeScript declaration file for translation keys

Options:
  -d, --dir <path>     Directory containing <locale>.json files (default: "src/i18n")
  -b, --base <locale>  Base/default locale code to compare against (default: "en")
  -o, --out <path>     Output path for declaration file (default: "node_modules/.rimelight/i18n/keys.d.ts")
  -t, --types          Generate declaration file during check
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
      out: { type: "string", short: "o" },
      types: { type: "boolean", short: "t", default: false },
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
  if (action !== "check" && action !== "types") {
    console.error(`Unknown action: '${action}'. Run 'rimelight-i18n --help' for usage.`);
    return 1;
  }

  const localesDir = path.resolve(process.cwd(), values.dir || "src/i18n");
  if (!fs.existsSync(localesDir) || !fs.statSync(localesDir).isDirectory()) {
    console.error(
      `✖ [i18n] Could not find translation directory. Pass --dir <path> (e.g. --dir src/i18n)`,
    );
    return 1;
  }

  const translations: Record<string, Record<string, any>> = {};
  const jsonFiles = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.error(`✖ [i18n] No .json translation files found in ${localesDir}`);
    return 1;
  }

  for (const file of jsonFiles) {
    try {
      translations[path.basename(file, ".json")] = JSON.parse(
        fs.readFileSync(path.join(localesDir, file), "utf-8"),
      );
    } catch (error) {
      console.error(`✖ [i18n] Failed to parse ${file}: ${(error as any)?.message || error}`);
      return 1;
    }
  }

  const baseLocale = values.base || "en";
  if (!translations[baseLocale]) {
    console.error(
      `✖ [i18n] Base locale '${baseLocale}' not found in ${localesDir} (found: ${Object.keys(translations).join(", ")})`,
    );
    return 1;
  }

  const outPath = path.resolve(
    process.cwd(),
    values.out || "node_modules/.rimelight/i18n/keys.d.ts",
  );

  if (action === "types") {
    const written = writeTypeDeclarations(
      outPath,
      generateTypeDeclarations(translations[baseLocale]!),
    );
    const keyCount = extractKeys(translations[baseLocale]!).length;
    console.log(
      written
        ? `✔ [i18n] Generated types for ${keyCount} keys at ${outPath}`
        : `✔ [i18n] Types at ${outPath} are already up to date.`,
    );
    return 0;
  }

  let report = verifyTranslations(translations, {
    defaultLocale: baseLocale,
    allowEmpty: values["allow-empty"],
  });

  if (!report.isValid && values.fix) {
    console.log(`ℹ [i18n] Fixing translation files in ${localesDir}...`);
    const fixed = fixTranslations(translations, baseLocale);
    for (const [locale, data] of Object.entries(fixed)) {
      fs.writeFileSync(
        path.join(localesDir, `${locale}.json`),
        JSON.stringify(data, null, 2) + "\n",
        "utf-8",
      );
    }
    report = verifyTranslations(fixed, {
      defaultLocale: baseLocale,
      allowEmpty: values["allow-empty"],
    });
    console.log(`✔ [i18n] Successfully updated translation files.`);
  }

  if (values.types) {
    const active =
      values.fix && !report.isValid ? fixTranslations(translations, baseLocale) : translations;
    writeTypeDeclarations(outPath, generateTypeDeclarations(active[baseLocale]!));
  }

  const formatted = formatAuditReport(report);
  if (report.isValid) {
    console.log(formatted);
    return 0;
  }

  console.error(formatted);
  if (!values.fix) {
    console.error(
      `\nRun with --fix to automatically prune stale keys and generate missing skeletons.`,
    );
  }
  return 1;
}

if (
  process.argv[1] &&
  (import.meta.url === pathToFileURL(process.argv[1]).href ||
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/")))
) {
  void runCli().then((code) => {
    if (code !== 0) process.exit(code);
  });
}

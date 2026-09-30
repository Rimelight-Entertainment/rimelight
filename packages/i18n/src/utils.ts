import type {
  ComponentsJSON,
  FlattenedTranslations,
  TranslationAuditReport,
  VerifyTranslationsOptions,
  PlaceholderMismatch
} from "./types";

/**
 * Flattens deeply nested translation objects or arrays into dot-notated paths.
 */
export function flatten(
  obj: Record<string, any>,
  prefix: string = "",
  result: FlattenedTranslations = {}
): FlattenedTranslations {
  if (obj == null || typeof obj !== "object") {
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, fullPath, result);
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const arrayPath = `${fullPath}.${i}`;
        if (item != null && typeof item === "object") {
          flatten(item, arrayPath, result);
        } else {
          result[arrayPath] = String(item ?? "");
        }
      }
    } else {
      result[fullPath] = value != null ? String(value) : "";
    }
  }

  return result;
}

/**
 * Unflattens a dot-notated translation map back into a nested object structure.
 */
export function unflatten(flat: FlattenedTranslations): ComponentsJSON {
  const result: ComponentsJSON = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current: any = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (part === "__proto__" || part === "constructor" || part === "prototype") {
        break;
      }

      const isLast = i === parts.length - 1;
      const nextPart = parts[i + 1];
      const nextIsNum = nextPart !== undefined && /^\d+$/.test(nextPart);

      if (isLast) {
        current[part] = value;
      } else {
        if (current[part] == null || typeof current[part] !== "object") {
          current[part] = nextIsNum ? [] : {};
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

/**
 * Compares a target translation dictionary against a base translation dictionary, returning any
 * missing deep dotted keys.
 */
export function findMissingKeys(base: Record<string, any>, target: Record<string, any>): string[] {
  const baseFlat = flatten(base);
  const targetFlat = flatten(target);
  const missing: string[] = [];

  for (const key of Object.keys(baseFlat)) {
    if (!(key in targetFlat)) {
      missing.push(key);
    }
  }

  return missing;
}

/**
 * Compares a target translation dictionary against a base translation dictionary, returning any
 * stale/orphaned keys present in target but absent in base.
 */
export function findStaleKeys(base: Record<string, any>, target: Record<string, any>): string[] {
  const baseFlat = flatten(base);
  const targetFlat = flatten(target);
  const stale: string[] = [];

  for (const key of Object.keys(targetFlat)) {
    if (!(key in baseFlat)) {
      stale.push(key);
    }
  }

  return stale;
}

/**
 * Runs a comprehensive audit across all translation dictionaries comparing against
 * base/defaultLocale.
 */
export function verifyTranslations(
  translations: Record<string, Record<string, any>>,
  options: VerifyTranslationsOptions = {}
): TranslationAuditReport {
  const defaultLocale = options.defaultLocale || "en";
  const allowEmpty = options.allowEmpty ?? false;
  const locales = Object.keys(translations);

  const baseDict = translations[defaultLocale] || {};
  const baseFlat = flatten(baseDict);
  const totalKeys = Object.keys(baseFlat).length;

  const missingKeys: Record<string, string[]> = {};
  const staleKeys: Record<string, string[]> = {};
  const emptyKeys: Record<string, string[]> = {};
  const placeholderMismatches: Record<string, PlaceholderMismatch[]> = {};
  const completion: Record<string, string> = {};

  let isValid = true;

  for (const locale of locales) {
    const targetDict = translations[locale] || {};
    const targetFlat = flatten(targetDict);

    const missing = findMissingKeys(baseDict, targetDict);
    const stale = findStaleKeys(baseDict, targetDict);
    const empty: string[] = [];
    const mismatches: PlaceholderMismatch[] = [];

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

    for (const [key, val] of Object.entries(targetFlat)) {
      if (!allowEmpty && typeof val === "string" && val.trim() === "") {
        empty.push(key);
        isValid = false;
      }

      if (key in baseFlat) {
        const baseVal = baseFlat[key] ?? "";
        const baseHolders = extractPlaceholders(baseVal).sort();
        const targetHolders = extractPlaceholders(val).sort();

        if (JSON.stringify(baseHolders) !== JSON.stringify(targetHolders)) {
          mismatches.push({
            key,
            basePlaceholders: baseHolders,
            targetPlaceholders: targetHolders
          });
          isValid = false;
        }
      }
    }

    if (empty.length > 0) {
      emptyKeys[locale] = empty;
    }
    if (mismatches.length > 0) {
      placeholderMismatches[locale] = mismatches;
    }

    const matchedCount = totalKeys - missing.length;
    const percentage = totalKeys > 0 ? Math.round((matchedCount / totalKeys) * 100) : 100;
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
      completion
    }
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
          `      - ${m.key}: expected {${m.basePlaceholders.join(", ")}}, found {${m.targetPlaceholders.join(", ")}}`
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
  defaultLocale: string = "en"
): Record<string, Record<string, any>> {
  const baseDict = translations[defaultLocale] || {};
  const baseFlat = flatten(baseDict);
  const fixed: Record<string, Record<string, any>> = {};

  for (const [locale, dict] of Object.entries(translations)) {
    if (locale === defaultLocale) {
      fixed[locale] = dict;
      continue;
    }

    const targetFlat = flatten(dict);
    const newFlat: FlattenedTranslations = {};

    // Copy only keys that exist in base (pruning stale keys) and fill missing with empty or base string
    for (const [baseKey, baseVal] of Object.entries(baseFlat)) {
      if (baseKey in targetFlat) {
        newFlat[baseKey] = targetFlat[baseKey]!;
      } else {
        newFlat[baseKey] = baseVal;
      }
    }

    fixed[locale] = unflatten(newFlat);
  }

  return fixed;
}

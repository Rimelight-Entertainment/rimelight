import type { I18nLintConfig, KeyCasing } from "./types";
import { UNSAFE_KEYS } from "./constants";
import { placeholderNames } from "./placeholders";

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
  styleIssues: Record<string, string[]>;
  stats: { completion: Record<string, string> };
}

interface VerifyTranslationsOptions {
  defaultLocale?: string;
  allowEmpty?: boolean;
  lint?: I18nLintConfig;
}

/** Validates key part against chosen casing standard (defaults to kebab-case). */
const isValidKeySegment = (segment: string, casing: KeyCasing = "kebab-case"): boolean => {
  if (casing === "any") return true;
  if (/^\d+$/.test(segment)) return true; // array index
  if (casing === "kebab-case") {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(segment);
  }
  if (casing === "snake_case") {
    return /^[a-z0-9]+(_[a-z0-9]+)*$/.test(segment);
  }
  if (casing === "camelCase") {
    return /^[a-z0-9]+([A-Z0-9][a-z0-9]*)*$/.test(segment);
  }
  return true;
};

/** Detects self-nested keys where a parent key wraps a single child of the identical name. */
const findSelfNestedKeys = (obj: Record<string, any>, prefix = ""): string[] => {
  let issues: string[] = [];
  if (obj == null || typeof obj !== "object") return issues;
  for (const [key, value] of Object.entries(obj)) {
    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      const childKeys = Object.keys(value);
      if (childKeys.length === 1 && childKeys[0] === key) {
        issues.push(prefix ? `${prefix}.${key}` : key);
      }
      issues = issues.concat(findSelfNestedKeys(value, prefix ? `${prefix}.${key}` : key));
    }
  }
  return issues;
};

/** Flattens nested translation objects or arrays into dot-notated paths. */
export const flatten = (
  obj: Record<string, any>,
  prefix = "",
  result: FlattenedTranslations = {},
): FlattenedTranslations => {
  if (obj == null || typeof obj !== "object") return result;
  for (const [key, value] of Object.entries(obj)) {
    if (UNSAFE_KEYS.has(key)) continue;
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === "object") flatten(value, fullPath, result);
    else result[fullPath] = value;
  }
  return result;
};

/** Unflattens dot-notated translation map back into a nested object structure. */
export const unflatten = (flat: FlattenedTranslations): Record<string, any> => {
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
};

// hasOwn, not `in`: a key named `constructor` or `toString` would otherwise count as present.
const diffKeys = (baseFlat: FlattenedTranslations, targetFlat: FlattenedTranslations) => ({
  missing: Object.keys(baseFlat).filter((k) => !Object.hasOwn(targetFlat, k)),
  stale: Object.keys(targetFlat).filter((k) => !Object.hasOwn(baseFlat, k)),
});

/** Audits translation files for missing, stale, empty, or mismatched placeholder keys and style consistency. */
export const verifyTranslations = (
  translations: Record<string, Record<string, any>>,
  options: VerifyTranslationsOptions = {},
): TranslationAuditReport => {
  const defaultLocale = options.defaultLocale || "en";
  const allowEmpty = options.allowEmpty ?? false;
  const lint = options.lint;
  const locales = Object.keys(translations);
  const baseFlat = flatten(translations[defaultLocale] ?? {});
  const totalKeys = Object.keys(baseFlat).length;

  const missingKeys: Record<string, string[]> = {};
  const staleKeys: Record<string, string[]> = {};
  const emptyKeys: Record<string, string[]> = {};
  const placeholderMismatches: Record<string, PlaceholderMismatch[]> = {};
  const styleIssues: Record<string, string[]> = {};
  const completion: Record<string, string> = {};
  let isValid = true;

  const targetCasing: KeyCasing = lint?.casing ?? "kebab-case";
  const disallowSelfNested = lint?.disallowSelfNested ?? true;
  const disallowFlatUnderscores = lint?.disallowFlatUnderscores ?? true;

  for (const locale of locales) {
    const rawDict = translations[locale] ?? {};
    const targetFlat = flatten(rawDict);
    const { missing, stale } = diffKeys(baseFlat, targetFlat);
    const empty: string[] = [];
    const mismatches: PlaceholderMismatch[] = [];
    const localeStyleIssues: string[] = [];

    // 1. Check self-nested keys (e.g. { "foo": { "foo": "val" } })
    if (disallowSelfNested) {
      const selfNested = findSelfNestedKeys(rawDict);
      for (const sn of selfNested) {
        localeStyleIssues.push(`Self-nested wrapper key '${sn}' should be unwrapped`);
      }
    }

    for (const [key, val] of Object.entries(targetFlat)) {
      if (!allowEmpty && String(val).trim() === "") empty.push(key);
      if (key in baseFlat) {
        const baseHolders = placeholderNames(baseFlat[key] ?? "").sort();
        const targetHolders = placeholderNames(val).sort();
        if (JSON.stringify(baseHolders) !== JSON.stringify(targetHolders)) {
          mismatches.push({
            key,
            basePlaceholders: baseHolders,
            targetPlaceholders: targetHolders,
          });
        }
      }

      // Check key segment casing & style
      const parts = key.split(".");
      for (const part of parts) {
        if (disallowFlatUnderscores && part.includes("_")) {
          localeStyleIssues.push(
            `Key path '${key}' contains flat underscore delimiter in '${part}' (use dot-nesting and kebab-case)`,
          );
        } else if (!isValidKeySegment(part, targetCasing)) {
          localeStyleIssues.push(
            `Key segment '${part}' in '${key}' does not conform to '${targetCasing}'`,
          );
        }
      }
    }

    if (localeStyleIssues.length) {
      styleIssues[locale] = localeStyleIssues;
      isValid = false;
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
    styleIssues,
    stats: { completion },
  };
};

/** Formats a TranslationAuditReport into a human-readable diagnostic message. */
export const formatAuditReport = (report: TranslationAuditReport): string => {
  if (report.isValid) {
    return `✔ [i18n] Verified ${report.locales.length} locales (${report.locales.join(", ")}) — ${report.totalKeys} keys synchronized with 0 issues.`;
  }
  const lines = ["✖ [i18n] Translation verification failed:"];
  for (const locale of report.locales) {
    const missing = report.missingKeys[locale];
    const stale = report.staleKeys[locale];
    const empty = report.emptyKeys[locale];
    const mismatches = report.placeholderMismatches[locale];
    const styles = report.styleIssues[locale];
    if (!missing && !stale && !empty && !mismatches && !styles) continue;

    lines.push(`\n  [${locale}] (${report.stats.completion[locale]} complete):`);
    if (styles?.length)
      lines.push(
        `    Style Violations (${styles.length}):`,
        ...styles.slice(0, 15).map((s) => `      - ${s}`),
        ...(styles.length > 15 ? [`      ... and ${styles.length - 15} more style issues`] : []),
      );
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
};

/** Automatically prunes stale keys and injects missing key skeletons from base locale. */
export const fixTranslations = (
  translations: Record<string, Record<string, any>>,
  defaultLocale = "en",
): Record<string, Record<string, any>> => {
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
};

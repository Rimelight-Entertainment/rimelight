import type { I18nLintConfig, KeyCasing } from "./types";
import { placeholderNames, UNSAFE_KEYS } from "./shared";

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

/** The segment shapes each casing accepts. `any` and array indexes are accepted everywhere. */
const CASING_PATTERNS: Partial<Record<KeyCasing, RegExp>> = {
  "kebab-case": /^[a-z0-9]+(-[a-z0-9]+)*$/,
  snake_case: /^[a-z0-9]+(_[a-z0-9]+)*$/,
  camelCase: /^[a-z0-9]+([A-Z0-9][a-z0-9]*)*$/,
};

/** Validates key part against chosen casing standard (defaults to kebab-case). */
const isValidKeySegment = (segment: string, casing: KeyCasing = "kebab-case"): boolean =>
  /^\d+$/.test(segment) || (CASING_PATTERNS[casing]?.test(segment) ?? true);

/** Detects self-nested keys where a parent key wraps a single child of the identical name. */
const findSelfNestedKeys = (obj: Record<string, any>, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    const childKeys = Object.keys(value);
    const self = childKeys.length === 1 && childKeys[0] === key ? [path] : [];
    return [...self, ...findSelfNestedKeys(value, path)];
  });

/** Flattens nested translation objects or arrays into dot-notated paths. */
const flatten = (
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
const unflatten = (flat: FlattenedTranslations): Record<string, any> => {
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

/** One message per key segment that breaks the flat-underscore rule or the casing rule. */
const segmentIssues = (key: string, casing: KeyCasing, disallowFlatUnderscores: boolean) =>
  key.split(".").flatMap((part) => {
    if (disallowFlatUnderscores && part.includes("_")) {
      return [
        `Key path '${key}' contains flat underscore delimiter in '${part}' (use dot-nesting and kebab-case)`,
      ];
    }
    if (!isValidKeySegment(part, casing)) {
      return [`Key segment '${part}' in '${key}' does not conform to '${casing}'`];
    }
    return [];
  });

/** Audits translation files for missing, stale, empty, or mismatched placeholder keys and style consistency. */
export const verifyTranslations = (
  translations: Record<string, Record<string, any>>,
  options: VerifyTranslationsOptions = {},
): TranslationAuditReport => {
  const defaultLocale = options.defaultLocale || "en";
  const allowEmpty = options.allowEmpty ?? false;
  const casing: KeyCasing = options.lint?.casing ?? "kebab-case";
  const disallowSelfNested = options.lint?.disallowSelfNested ?? true;
  const disallowFlatUnderscores = options.lint?.disallowFlatUnderscores ?? true;
  const locales = Object.keys(translations);
  const baseFlat = flatten(translations[defaultLocale] ?? {});
  const totalKeys = Object.keys(baseFlat).length;

  const missingKeys: Record<string, string[]> = {};
  const staleKeys: Record<string, string[]> = {};
  const emptyKeys: Record<string, string[]> = {};
  const placeholderMismatches: Record<string, PlaceholderMismatch[]> = {};
  const styleIssues: Record<string, string[]> = {};
  const completion: Record<string, string> = {};

  for (const locale of locales) {
    const rawDict = translations[locale] ?? {};
    const targetFlat = flatten(rawDict);
    const { missing, stale } = diffKeys(baseFlat, targetFlat);
    const keys = Object.keys(targetFlat);
    const empty = allowEmpty ? [] : keys.filter((k) => String(targetFlat[k]).trim() === "");
    const mismatches = keys.flatMap((key) => {
      if (!Object.hasOwn(baseFlat, key)) return [];
      const basePlaceholders = placeholderNames(baseFlat[key] ?? "").sort();
      const targetPlaceholders = placeholderNames(targetFlat[key]).sort();
      return JSON.stringify(basePlaceholders) === JSON.stringify(targetPlaceholders)
        ? []
        : [{ key, basePlaceholders, targetPlaceholders }];
    });
    const style = [
      ...(disallowSelfNested
        ? findSelfNestedKeys(rawDict).map(
            (sn) => `Self-nested wrapper key '${sn}' should be unwrapped`,
          )
        : []),
      ...keys.flatMap((key) => segmentIssues(key, casing, disallowFlatUnderscores)),
    ];

    if (style.length) styleIssues[locale] = style;
    if (empty.length) emptyKeys[locale] = empty;
    if (mismatches.length) placeholderMismatches[locale] = mismatches;
    if (locale !== defaultLocale) {
      if (missing.length) missingKeys[locale] = missing;
      if (stale.length) staleKeys[locale] = stale;
    }

    completion[locale] =
      `${totalKeys > 0 ? Math.round(((totalKeys - missing.length) / totalKeys) * 100) : 100}%`;
  }

  const isValid = [missingKeys, staleKeys, emptyKeys, placeholderMismatches, styleIssues].every(
    (issues) => Object.keys(issues).length === 0,
  );

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

/** A titled bullet list, or nothing when there are no items. */
const section = (title: string, items: string[]): string[] =>
  items.length ? [`    ${title}:`, ...items.map((item) => `      - ${item}`)] : [];

/** Formats a TranslationAuditReport into a human-readable diagnostic message. */
export const formatAuditReport = (report: TranslationAuditReport): string => {
  if (report.isValid) {
    return `✔ [i18n] Verified ${report.locales.length} locales (${report.locales.join(", ")}) — ${report.totalKeys} keys synchronized with 0 issues.`;
  }
  const lines = ["✖ [i18n] Translation verification failed:"];
  for (const locale of report.locales) {
    const styles = report.styleIssues[locale] ?? [];
    const missing = report.missingKeys[locale] ?? [];
    const stale = report.staleKeys[locale] ?? [];
    const empty = report.emptyKeys[locale] ?? [];
    const mismatches = report.placeholderMismatches[locale] ?? [];

    const body = [
      ...section(`Style Violations (${styles.length})`, styles.slice(0, 15)),
      ...(styles.length > 15 ? [`      ... and ${styles.length - 15} more style issues`] : []),
      ...section(`Missing Keys (${missing.length})`, missing),
      ...section(`Stale Keys (${stale.length}, not in '${report.defaultLocale}')`, stale),
      ...section(`Empty Keys (${empty.length})`, empty),
      ...section(
        `Placeholder Mismatches (${mismatches.length})`,
        mismatches.map(
          (m) =>
            `${m.key}: expected {${m.basePlaceholders.join(", ")}}, found {${m.targetPlaceholders.join(", ")}}`,
        ),
      ),
    ];
    if (body.length) {
      lines.push(`\n  [${locale}] (${report.stats.completion[locale]} complete):`, ...body);
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

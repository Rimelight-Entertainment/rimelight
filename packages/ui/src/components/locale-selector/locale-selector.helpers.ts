import { getLocaleInfo, getLocaleUrl, getLocales } from "@rimelight/i18n";
import type { LocaleItem } from "./locale-selector.types";

export interface LocaleSelection {
  label: string;
  code: string;
  href: string;
}

/** Expands codes into items, filling in each language's own name when no label is given. */
export const normalizeLocales = (locales?: string[] | LocaleItem[]): LocaleItem[] => {
  const list: readonly (string | LocaleItem)[] = locales ?? getLocales();
  return list.map((item) =>
    typeof item === "string"
      ? { code: item, label: getLocaleInfo(item).label }
      : { ...item, label: item.label || getLocaleInfo(item.code).label },
  );
};

/**
 * The selection for `code`, or `undefined` when no listed locale matches. The href is the item's
 * own `href`, otherwise the page at `path` in that locale.
 */
export const selectLocale = (
  locales: readonly LocaleItem[],
  code: string,
  path: string,
): LocaleSelection | undefined => {
  const item = locales.find((locale) => locale.code === code);
  if (!item) return undefined;
  return {
    label: item.label,
    code: item.code,
    href: item.href ?? getLocaleUrl(path, item.code),
  };
};

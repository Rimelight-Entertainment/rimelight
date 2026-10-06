export {
  currentLocale,
  defaultLocale,
  getHtmlLang,
  getLanguageAlternates,
  getLocale,
  getLocalizedText,
  getOgLocale,
  getPluralCategory,
  getRawTranslation,
  getRelativeLocaleUrl,
  initializeI18n,
  locales,
  prefixDefaultLocale,
  t,
  tArray,
  tRaw,
} from "./runtime";
export type { LanguageAlternate } from "./runtime";
export { createTranslationLoader, setKVBinding } from "./kv";
export type { TFunction } from "./types";

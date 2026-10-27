export {
  getLocales,
  getDefaultLocale,
  getCurrentLocale,
  setCurrentLocale,
  getLocaleUrl,
  getLocaleAsset,
  getLocaleInfo,
  loadLocale,
  t,
} from "./runtime";
export type { LocaleInfo } from "./types";

/**
 * Every `t()` key and the params it takes. Empty here; the generated `keys.d.ts` augments it.
 * It must be declared in this file: augmentation cannot merge into re-exported interfaces.
 */
export interface TranslationRegistry {}

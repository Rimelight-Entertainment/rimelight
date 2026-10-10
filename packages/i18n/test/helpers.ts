import { config, setCurrentLocale } from "../src/locale";
import { translations } from "../src/translate";

export function setLocaleConfig(options: Partial<typeof config>): void {
  Object.assign(config, options);
  setCurrentLocale(config.defaultLocale);
}

export function setTranslations(
  data: Record<string, Record<string, any>>,
  options?: Partial<typeof config>,
): void {
  for (const k in translations) delete translations[k];
  Object.assign(translations, data);
  if (options) {
    setLocaleConfig(options);
  }
}

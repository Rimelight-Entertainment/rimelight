import { config, setCurrentLocale } from "../src/locale";

export function setLocaleConfig(options: Partial<typeof config>): void {
  Object.assign(config, options);
  setCurrentLocale(config.defaultLocale);
}

export function setTranslations(
  data: Record<string, Record<string, any>>,
  options?: Partial<typeof config>,
): void {
  for (const k in config.translations) delete config.translations[k];
  Object.assign(config.translations, data);
  if (options) {
    setLocaleConfig(options);
  }
}

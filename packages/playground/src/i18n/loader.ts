import type { TranslationLoader } from "@nanostores/i18n";

const translationModules = import.meta.glob("../translations/*.json", { eager: true }) as Record<string, { default: Record<string, unknown> }>;

const loader: TranslationLoader = async (locale, _components) => {
  const key = Object.keys(translationModules).find(k => k.includes(`/${locale}.json`));
  return key ? translationModules[key].default : {};
};

export default loader;

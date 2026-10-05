import { initializeI18n } from "./runtime";

let locales: string[] = ["en"];
let defaultLocale: string = "en";
let prefixDefaultLocale: boolean = true;

let translations: Record<string, any> = {};

try {
  const cfg = await import("virtual:rimelight-i18n-config");
  if (cfg) {
    if (cfg.locales) locales = cfg.locales;
    if (cfg.defaultLocale) defaultLocale = cfg.defaultLocale;
    if (cfg.prefixDefaultLocale !== undefined) prefixDefaultLocale = cfg.prefixDefaultLocale;
    if (cfg.translations) translations = cfg.translations;
  }
} catch {
  // Virtual module is resolved inside Vite during app bundle, not in Node config evaluation
}

// Auto-initialize runtime state from Vite plugin config
if (translations && Object.keys(translations).length > 0) {
  initializeI18n({
    defaultLocale: defaultLocale || "en",
    translations,
  });
}

export { locales, defaultLocale, prefixDefaultLocale };

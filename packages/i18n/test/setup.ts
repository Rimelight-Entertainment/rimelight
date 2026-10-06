import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-i18n-config", () => ({
  locales: ["en"],
  defaultLocale: "en",
  prefixDefaultLocale: true,
  htmlLangs: { en: "en-US", pt: "pt-BR", es: "es-ES" },
  translations: {},
  default: {
    locales: ["en"],
    defaultLocale: "en",
    prefixDefaultLocale: true,
    htmlLangs: { en: "en-US", pt: "pt-BR", es: "es-ES" },
    translations: {},
  },
}));

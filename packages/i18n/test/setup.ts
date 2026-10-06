import { vi } from "vite-plus/test";

const config = {
  locales: ["en"],
  defaultLocale: "en",
  prefixDefaultLocale: true,
  htmlLangs: {},
  translations: {},
  kvBinding: "TRANSLATIONS_KV",
  skipPaths: ["/api", "/_"],
};

vi.mock("virtual:rimelight-i18n-config", () => ({
  ...config,
  default: config,
}));

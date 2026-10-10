import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-i18n", () => ({
  locales: ["en"],
  defaultLocale: "en",
  prefixDefaultLocale: true,
  skipPaths: ["/api", "/_"],
  translations: {},
  default: {
    locales: ["en"],
    defaultLocale: "en",
    prefixDefaultLocale: true,
    skipPaths: ["/api", "/_"],
    translations: {},
  },
}));

vi.mock("virtual:rimelight-i18n/server", () => ({
  translations: {},
  default: {},
}));

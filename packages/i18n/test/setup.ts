import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-i18n", () => ({
  config: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    prefixDefaultLocale: true,
    skipPaths: ["/api", "/_"],
    translations: {},
  },
}));

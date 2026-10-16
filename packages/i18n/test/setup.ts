import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-i18n", () => ({
  config: {
    locales: ["en"],
    defaultLocale: "en",
    prefixDefaultLocale: true,
    skipPaths: ["/api", "/_"],
    translations: {},
  },
}));

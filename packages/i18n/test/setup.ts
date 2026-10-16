import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-i18n", () => ({
  default: {
    locales: ["en"],
    defaultLocale: "en",
    prefixDefaultLocale: true,
    skipPaths: ["/api", "/_"],
    translations: {},
  },
}));

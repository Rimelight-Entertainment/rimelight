import { AsyncLocalStorage } from "node:async_hooks";
import { vi } from "vite-plus/test";

// Polyfill AsyncLocalStorage on globalThis in test environment so runtime.ts needs zero Node imports
(globalThis as any).AsyncLocalStorage = AsyncLocalStorage;

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

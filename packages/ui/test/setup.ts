import { afterEach, vi } from "vite-plus/test";
import { Window } from "happy-dom";

vi.mock("virtual:rimelight-ui", () => ({
  config: {},
}));

vi.mock("virtual:rimelight-i18n", () => ({
  config: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    // No prefix for the default locale, so existing href assertions stay unchanged.
    prefixDefaultLocale: false,
    translations: {
      "en.json": { rimelight: { ui: { error: { titles: { 418: "I'm a Teapot" } } } } },
    },
  },
}));

const window = new Window();

globalThis.window = window as any;
globalThis.document = window.document as any;
globalThis.KeyboardEvent = window.KeyboardEvent as any;
globalThis.Event = window.Event as any;
globalThis.CustomEvent = window.CustomEvent as any;
globalThis.HTMLElement = window.HTMLElement as any;
globalThis.Element = window.Element as any;
globalThis.Node = window.Node as any;

afterEach(() => {
  if (typeof document !== "undefined") {
    document.querySelectorAll("[data-test-root]").forEach((el) => el.remove());
  }
});

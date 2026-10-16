import { afterEach, vi } from "vite-plus/test";
import { Window } from "happy-dom";

vi.mock("virtual:rimelight-ui", () => ({
  config: {},
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

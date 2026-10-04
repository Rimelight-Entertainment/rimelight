import { describe, it, expect } from "vite-plus/test";
import { defineShortcuts, activeShortcutsStore } from "../src/shortcuts";

describe("@rimelight/ui shortcuts runtime — browser", () => {
  it("should register shortcuts into activeShortcutsStore before listeners subscribe", () => {
    const cleanup = defineShortcuts({
      meta_k: {
        handler: () => {},
        label: "Open Search",
        category: "navigation",
      },
    });

    expect(activeShortcutsStore.some((s) => s.label === "Open Search")).toBe(true);
    cleanup();
    expect(activeShortcutsStore.some((s) => s.label === "Open Search")).toBe(false);
  });

  it("should trigger multi-modifier shortcuts like meta_alt_t via Ctrl+Alt+T on Windows/Linux", () => {
    let triggered = false;
    const cleanup = defineShortcuts({
      meta_alt_t: () => {
        triggered = true;
      },
    });

    const event = new KeyboardEvent("keydown", {
      key: "t",
      code: "KeyT",
      ctrlKey: true,
      altKey: true,
      metaKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(triggered).toBe(true);
    cleanup();
  });

  it("should resolve shortcuts using codeKey when Alt produces a special character", () => {
    let triggered = false;
    const cleanup = defineShortcuts({
      meta_alt_t: () => {
        triggered = true;
      },
    });

    // On Mac / special layout, Alt+T produces '†' in e.key but 'KeyT' in e.code
    const event = new KeyboardEvent("keydown", {
      key: "†",
      code: "KeyT",
      ctrlKey: true,
      altKey: true,
      metaKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(triggered).toBe(true);
    cleanup();
  });
});

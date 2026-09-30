import { describe, it, expect } from "vite-plus/test";
import { normalizeModifier, formatShortcutKeys } from "../src/shortcuts";
import { createStore } from "solid-js";
import { toasts, addToast, removeToast, clearToasts } from "../src/components/toast/store";

describe("@rimelight/ui shortcuts and reactive solid stores", () => {
  describe("normalizeModifier & formatShortcutKeys", () => {
    it("should normalize modifier aliases", () => {
      expect(normalizeModifier("cmd")).toBe("meta");
      expect(normalizeModifier("command")).toBe("meta");
      expect(normalizeModifier("control")).toBe("ctrl");
      expect(normalizeModifier("opt")).toBe("alt");
      expect(normalizeModifier("option")).toBe("alt");
      expect(normalizeModifier("shift")).toBe("shift");
    });

    it("should format shortcut strings into human-readable keys", () => {
      const keys = formatShortcutKeys("meta_shift_k");
      expect(keys).toContain("Shift");
      expect(keys).toContain("K");
    });
  });

  describe("solid stores", () => {
    it("should create and update an isolated solid store", () => {
      const [state, setState] = createStore({ theme: "dark", active: true });
      expect(state.theme).toBe("dark");

      setState((s) => ({ ...s, theme: "light", active: false }));
      expect(state.theme).toBe("light");
      expect(state.active).toBe(false);
    });

    it("should add, remove, and clear toasts via the solid toast store", () => {
      clearToasts();
      expect(toasts.length).toBe(0);

      const item = addToast({ title: "Hello", description: "World" });
      expect(toasts.length).toBe(1);
      expect(toasts[0]!.title).toBe("Hello");

      removeToast(item.id);
      expect(toasts.length).toBe(0);

      addToast({ title: "A" });
      addToast({ title: "B" });
      expect(toasts.length).toBe(2);
      clearToasts();
      expect(toasts.length).toBe(0);
    });
  });
});

import { describe, it, expect, vi } from "vite-plus/test";

import {
  isThenable,
  resolveKeyboardAction,
  runClickHandlers,
  toClickHandlers,
} from "../src/components/button/button.helpers";

describe("button.helpers", () => {
  describe("toClickHandlers", () => {
    it("normalizes a single handler into an array", () => {
      const handler = vi.fn();
      expect(toClickHandlers(handler)).toEqual([handler]);
    });

    it("passes arrays through untouched", () => {
      const first = vi.fn();
      const second = vi.fn();
      expect(toClickHandlers([first, second])).toEqual([first, second]);
    });

    it("returns an empty array for missing handlers", () => {
      expect(toClickHandlers(undefined)).toEqual([]);
      expect(toClickHandlers(null)).toEqual([]);
      expect(toClickHandlers([])).toEqual([]);
    });
  });

  describe("runClickHandlers", () => {
    it("invokes every handler with the same event in order", () => {
      const calls: string[] = [];
      const event = { type: "click" } as unknown as MouseEvent;
      runClickHandlers(
        [
          () => calls.push("first"),
          (e) => {
            calls.push("second");
            expect(e).toBe(event);
          },
        ],
        event,
      );
      expect(calls).toEqual(["first", "second"]);
    });

    it("collects return values for promise detection", () => {
      const promise = Promise.resolve();
      const results = runClickHandlers([() => promise, () => undefined], {} as MouseEvent);
      expect(results).toHaveLength(2);
      expect(results[0]).toBe(promise);
    });
  });

  describe("isThenable", () => {
    it("detects promise-like values", () => {
      const fakeThenable: Record<string, unknown> = {};
      Reflect.set(fakeThenable, "then", () => {});

      expect(isThenable(Promise.resolve())).toBe(true);
      expect(isThenable(Promise.withResolvers<void>().promise)).toBe(true);
      expect(isThenable(fakeThenable)).toBe(true);
    });

    it("rejects plain values", () => {
      expect(isThenable(undefined)).toBe(false);
      expect(isThenable(null)).toBe(false);
      expect(isThenable(0)).toBe(false);
      expect(isThenable("then")).toBe(false);
      expect(isThenable({})).toBe(false);
    });
  });

  describe("resolveKeyboardAction", () => {
    it("activates on Enter and Space", () => {
      expect(
        resolveKeyboardAction({
          key: "Enter",
          repeat: false,
          disabled: false,
          defaultPrevented: false,
        }),
      ).toBe("click");
      expect(
        resolveKeyboardAction({
          key: " ",
          repeat: false,
          disabled: false,
          defaultPrevented: false,
        }),
      ).toBe("click");
    });

    it("ignores unrelated keys", () => {
      for (const key of ["Tab", "a", "Escape", "Shift"]) {
        expect(
          resolveKeyboardAction({ key, repeat: false, disabled: false, defaultPrevented: false }),
        ).toBe("ignore");
      }
    });

    it("blocks default instead of activating when disabled", () => {
      expect(
        resolveKeyboardAction({
          key: "Enter",
          repeat: false,
          disabled: true,
          defaultPrevented: false,
        }),
      ).toBe("prevent");
      expect(
        resolveKeyboardAction({ key: " ", repeat: false, disabled: true, defaultPrevented: false }),
      ).toBe("prevent");
    });

    it("blocks default on key repeat", () => {
      expect(
        resolveKeyboardAction({
          key: "Enter",
          repeat: true,
          disabled: false,
          defaultPrevented: false,
        }),
      ).toBe("prevent");
    });

    it("respects a handler that already called preventDefault", () => {
      expect(
        resolveKeyboardAction({
          key: "Enter",
          repeat: false,
          disabled: false,
          defaultPrevented: true,
        }),
      ).toBe("ignore");
      expect(
        resolveKeyboardAction({
          key: "Tab",
          repeat: false,
          disabled: true,
          defaultPrevented: true,
        }),
      ).toBe("ignore");
    });
  });
});

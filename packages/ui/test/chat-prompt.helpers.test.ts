import { describe, it, expect } from "vite-plus/test";

import { isSubmitKey } from "../src/components/chat-prompt/chat-prompt.helpers";

function key(overrides: Partial<Pick<KeyboardEvent, "key" | "shiftKey" | "isComposing">>) {
  return { key: "a", shiftKey: false, isComposing: false, ...overrides };
}

describe("isSubmitKey", () => {
  it("submits on Enter", () => {
    expect(isSubmitKey(key({ key: "Enter" }))).toBe(true);
  });

  it("does not submit on Shift+Enter, which inserts a newline", () => {
    expect(isSubmitKey(key({ key: "Enter", shiftKey: true }))).toBe(false);
  });

  it("does not submit during IME composition", () => {
    expect(isSubmitKey(key({ key: "Enter", isComposing: true }))).toBe(false);
  });

  it("ignores other keys", () => {
    expect(isSubmitKey(key({ key: "a" }))).toBe(false);
  });
});

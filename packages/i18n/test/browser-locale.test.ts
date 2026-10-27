import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

/** A browser document with the given `<html lang>`. Node has no `document`, so one is stubbed per test. */
const stubDocument = (lang: string) => {
  vi.stubGlobal("document", { documentElement: { lang } });
};

describe("current locale in the browser", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("reads a full tag from <html lang> as its configured base locale", async () => {
    stubDocument("pt-BR");
    const { getCurrentLocale } = await import("../src/runtime");
    expect(getCurrentLocale()).toBe("pt");
  });

  it("falls back to the default locale for a tag it does not support", async () => {
    stubDocument("fr-CA");
    const { getCurrentLocale } = await import("../src/runtime");
    expect(getCurrentLocale()).toBe("en");
  });
});

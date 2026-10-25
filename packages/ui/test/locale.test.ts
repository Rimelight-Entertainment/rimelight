import { describe, it, expect } from "vite-plus/test";
import { uiT } from "../src/locale";
import { resolveLinkAttrs } from "../src/components/link/helpers";

describe("ui translations", () => {
  it("returns built-in text, config overrides, or the key", () => {
    expect(uiT("error.retry")).toBe("Try again");
    expect(uiT("error.titles.418")).toBe("I'm a Teapot");
    expect(uiT("missing.key")).toBe("missing.key");
  });
});

describe("link localization", () => {
  it("localizes internal paths through getLocaleUrl", () => {
    expect(resolveLinkAttrs({ href: "/docs", localize: "pt" }).href).toBe("/pt/docs");
    // default locale has no prefix in the test config
    expect(resolveLinkAttrs({ href: "/docs" }).href).toBe("/docs");
  });

  it("leaves external, relative and opted-out links alone", () => {
    expect(resolveLinkAttrs({ href: "https://example.com", localize: "pt" }).href).toBe(
      "https://example.com",
    );
    expect(resolveLinkAttrs({ href: "relative/path", localize: "pt" }).href).toBe("relative/path");
    expect(resolveLinkAttrs({ href: "/docs", localize: false }).href).toBe("/docs");
  });
});

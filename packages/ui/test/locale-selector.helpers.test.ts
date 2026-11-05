import { describe, it, expect } from "vite-plus/test";
import { getLocaleInfo } from "@rimelight/i18n";
import {
  normalizeLocales,
  selectLocale,
} from "../src/components/locale-selector/locale-selector.helpers";

describe("normalizeLocales", () => {
  it("defaults to every configured locale with its own name", () => {
    expect(normalizeLocales()).toEqual([
      { code: "en", label: getLocaleInfo("en").label },
      { code: "pt", label: getLocaleInfo("pt").label },
    ]);
  });

  it("keeps a supplied label and falls back to the language name when it is empty", () => {
    expect(
      normalizeLocales([
        { code: "pt", label: "Português" },
        { code: "en", label: "" },
      ]),
    ).toEqual([
      { code: "pt", label: "Português" },
      { code: "en", label: getLocaleInfo("en").label },
    ]);
  });

  it("returns an empty list when given no locales", () => {
    expect(normalizeLocales([])).toEqual([]);
  });
});

describe("selectLocale", () => {
  const items = normalizeLocales(["en", "pt"]);

  it("resolves the current page in the chosen locale", () => {
    expect(selectLocale(items, "pt", "/docs")).toEqual({
      label: getLocaleInfo("pt").label,
      code: "pt",
      href: "/pt/docs",
    });
  });

  it("uses the item's own href over the current page", () => {
    const custom = [{ code: "pt", label: "Português", href: "https://example.com/pt" }];
    expect(selectLocale(custom, "pt", "/docs")?.href).toBe("https://example.com/pt");
  });

  it("returns undefined for a code that is not listed", () => {
    expect(selectLocale(items, "fr", "/docs")).toBeUndefined();
    expect(selectLocale([], "en", "/docs")).toBeUndefined();
  });
});

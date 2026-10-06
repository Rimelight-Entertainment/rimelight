import { describe, expect, it } from "vite-plus/test";
import * as i18n from "../src/index";
import {
  getDefaultLocale,
  getLocale,
  getLocalizedText,
  getLocales,
  getRelativeLocaleUrl,
  setLocale,
  t,
} from "../src/index";

describe("index exports", () => {
  it("exposes exactly the documented public surface", () => {
    expect(Object.keys(i18n).sort()).toEqual(
      [
        "getDefaultLocale",
        "getLocale",
        "getLocalizedText",
        "getLocales",
        "getRelativeLocaleUrl",
        "setLocale",
        "t",
      ].sort(),
    );
  });

  it("exposes the full API through the module namespace", () => {
    expect(typeof i18n.t).toBe("function");
    expect(typeof i18n.getLocale).toBe("function");
    expect(typeof i18n.setLocale).toBe("function");
    expect(typeof i18n.getLocales).toBe("function");
    expect(typeof i18n.getDefaultLocale).toBe("function");
    expect(typeof i18n.getRelativeLocaleUrl).toBe("function");
    expect(typeof i18n.getLocalizedText).toBe("function");
    expect(typeof i18n.t.raw).toBe("function");
    expect(typeof i18n.t.array).toBe("function");
    expect(typeof i18n.t.plural).toBe("function");
  });

  it("shares live state between namespace and named access", () => {
    i18n.setLocale("pt");
    expect(i18n.getLocale()).toBe("pt");
    expect(getLocale()).toBe("pt");
    i18n.setLocale("en");
    expect(getLocale()).toBe("en");
    expect(setLocale).toBe(i18n.setLocale);
    expect(t).toBe(i18n.t);
    expect(getLocales()).toEqual(i18n.getLocales());
    expect(getDefaultLocale()).toBe(i18n.getDefaultLocale());
    expect(typeof getRelativeLocaleUrl("/")).toBe("string");
    expect(getLocalizedText({ en: "Hello" }, "en")).toBe("Hello");
  });

  it("resolves translations through both access styles", () => {
    expect(i18n.t("some.key")).toBe(t("some.key"));
  });
});

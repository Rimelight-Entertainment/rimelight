import { describe, expect, it } from "vite-plus/test";
import * as i18n from "../src/index";
import {
  getLocales,
  getDefaultLocale,
  getCurrentLocale,
  setCurrentLocale,
  getLocaleUrl,
  getLocaleAsset,
  t,
} from "../src/index";

describe("index exports", () => {
  it("exposes exactly the documented public surface", () => {
    expect(Object.keys(i18n).sort()).toEqual(
      [
        "getLocales",
        "getDefaultLocale",
        "getCurrentLocale",
        "setCurrentLocale",
        "getLocaleUrl",
        "getLocaleAsset",
        "getLocaleInfo",
        "t",
      ].sort(),
    );
  });

  it("exposes the full API through the module namespace", () => {
    expect(typeof i18n.getLocales).toBe("function");
    expect(typeof i18n.getDefaultLocale).toBe("function");
    expect(typeof i18n.getCurrentLocale).toBe("function");
    expect(typeof i18n.setCurrentLocale).toBe("function");
    expect(typeof i18n.getLocaleUrl).toBe("function");
    expect(typeof i18n.getLocaleAsset).toBe("function");
    expect(typeof i18n.t).toBe("function");
    expect(typeof i18n.t.raw).toBe("function");
    expect(typeof i18n.t.array).toBe("function");
    expect(typeof i18n.t.plural).toBe("function");
    expect(typeof i18n.t.localize).toBe("function");
  });

  it("shares live state between namespace and named access", () => {
    i18n.setCurrentLocale("pt");
    expect(i18n.getCurrentLocale()).toBe("pt");
    expect(getCurrentLocale()).toBe("pt");
    i18n.setCurrentLocale("en");
    expect(getCurrentLocale()).toBe("en");
    expect(setCurrentLocale).toBe(i18n.setCurrentLocale);
    expect(t).toBe(i18n.t);
    expect(getLocales()).toEqual(i18n.getLocales());
    expect(getDefaultLocale()).toBe(i18n.getDefaultLocale());
    expect(typeof getLocaleUrl("/")).toBe("string");
    expect(getLocaleAsset).toBe(i18n.getLocaleAsset);
    expect(t.localize({ en: "Hello" }, "en")).toBe("Hello");
  });

  it("resolves translations through both access styles", () => {
    expect(i18n.t("some.key")).toBe(t("some.key"));
  });
});

import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { i18n } from "../src/middleware";
import { getCurrentLocale, getLocaleUrl } from "../src/index";
import { activeConfig, matchLocale } from "../src/runtime";

describe("locale matching", () => {
  let snapshot: Partial<typeof activeConfig>;

  beforeEach(() => {
    snapshot = { ...activeConfig };
  });

  afterEach(() => {
    Object.assign(activeConfig, snapshot);
  });

  it("matches configured locales ignoring case, and nothing else", () => {
    Object.assign(activeConfig, { locales: ["en", "pt-BR"] });
    expect(matchLocale("PT-br")).toBe("pt-BR");
    expect(matchLocale("pt")).toBeUndefined();
    expect(matchLocale(undefined)).toBeUndefined();
    expect(matchLocale("")).toBeUndefined();
  });

  it("rebuilds its index when the locale list is replaced", () => {
    Object.assign(activeConfig, { locales: ["en"] });
    expect(matchLocale("fr")).toBeUndefined();
    Object.assign(activeConfig, { locales: ["en", "fr"] });
    expect(matchLocale("fr")).toBe("fr");
  });

  it("escapes locale codes when stripping a prefix from URLs", () => {
    Object.assign(activeConfig, { locales: ["en", "pt.BR"], defaultLocale: "en" });
    // An unescaped "." would match "ptXBR" too.
    expect(getLocaleUrl("/ptXBR/about", "en")).toBe("/en/ptXBR/about");
    expect(getLocaleUrl("/pt.BR/about", "pt.BR")).toBe("/pt.BR/about");
  });
});

describe("explicit locale resolver registration", () => {
  let snapshot: Partial<typeof activeConfig>;

  beforeEach(() => {
    snapshot = { ...activeConfig };
    Object.assign(activeConfig, {
      locales: ["en", "pt", "pt-BR"],
      defaultLocale: "en",
      prefixDefaultLocale: false,
    });
  });

  afterEach(() => {
    Object.assign(activeConfig, snapshot);
  });

  it("resolves the request locale once i18n() is mounted", async () => {
    const app = new Hono().use(i18n()).get("/pt/hello", (c) => c.text(getCurrentLocale()));
    const res = await app.request("/pt/hello");
    expect(await res.text()).toBe("pt");
  });

  it("prefers the full Accept-Language tag over its base", async () => {
    const app = new Hono().use(i18n()).get("/hello", (c) => c.text(getCurrentLocale()));
    const res = await app.request("/hello", { headers: { "accept-language": "pt-BR,en;q=0.5" } });
    expect(await res.text()).toBe("pt-BR");
  });
});

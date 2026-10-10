import { describe, expect, it } from "vite-plus/test";
import {
  flatten,
  unflatten,
  extractKeys,
  findMissingKeys,
  findStaleKeys,
  verifyTranslations,
  formatAuditReport,
  fixTranslations,
} from "../src/cli";
import { getRelativeLocaleUrl, setCurrentLocale, t } from "../src/index";
import { getPluralCategory, setTranslations } from "../src/translate";

describe("translation dictionary utils", () => {
  const source = {
    hero: { title: "Hello", subtitle: "Welcome" },
    nav: { home: "Home" },
  };

  it("flattens nested translations into dotted keys", () => {
    expect(flatten(source)).toEqual({
      "hero.title": "Hello",
      "hero.subtitle": "Welcome",
      "nav.home": "Home",
    });
  });

  it("flattens arrays through numeric indices and round-trips", () => {
    const source = { tags: ["a", "b"], list: [{ name: "x", role: "dev" }] };
    expect(flatten(source)).toEqual({
      "tags.0": "a",
      "tags.1": "b",
      "list.0.name": "x",
      "list.0.role": "dev",
    });
    expect(unflatten(flatten(source))).toEqual(source);
  });

  it("unflattens dotted keys back into components", () => {
    expect(unflatten({ "hero.title": "Hello", "nav.home": "Home" })).toEqual({
      hero: { title: "Hello" },
      nav: { home: "Home" },
    });
  });

  it("round-trips flatten and unflatten", () => {
    expect(unflatten(flatten(source))).toEqual(source);
  });

  it("extracts component keys", () => {
    expect(extractKeys(source).sort()).toEqual(["hero.subtitle", "hero.title", "nav.home"]);
  });

  it("finds missing keys between dictionaries", () => {
    const missing = findMissingKeys(source, { hero: { title: "Hello" } });
    expect(missing).toEqual(["hero.subtitle", "nav.home"]);
  });

  it("finds stale keys between dictionaries", () => {
    const stale = findStaleKeys(source, {
      hero: { title: "Hello", old_cta: "Legacy" },
      legacy_nav: { item: "Old" },
    });
    expect(stale).toEqual(["hero.old_cta", "legacy_nav.item"]);
  });

  it("runs full translation verification and formats audit reports", () => {
    const translations = {
      en: {
        nav: { home: "Home", welcome: "Hello {name}" },
        footer: { text: "© 2026" },
      },
      pt: {
        nav: { home: "Início", welcome: "Olá {name}", old_item: "Velho" },
        footer: { text: "" },
      },
    };

    const report = verifyTranslations(translations, { defaultLocale: "en" });
    expect(report.isValid).toBe(false);
    expect(report.staleKeys["pt"]).toEqual(["nav.old_item"]);
    expect(report.emptyKeys["pt"]).toEqual(["footer.text"]);

    const formatted = formatAuditReport(report);
    expect(formatted).toContain("Translation verification failed");
    expect(formatted).toContain("nav.old_item");
  });

  it("auto-fixes translations by pruning stale keys and filling missing keys", () => {
    const translations = {
      en: {
        nav: { home: "Home", contact: "Contact" },
      },
      pt: {
        nav: { home: "Início", stale_button: "Remover" },
      },
    };

    const fixed = fixTranslations(translations, "en");
    expect((fixed["pt"]?.["nav"] as any)?.["home"]).toBe("Início");
    expect((fixed["pt"]?.["nav"] as any)?.["contact"]).toBe("Contact");
    expect((fixed["pt"]?.["nav"] as any)?.["stale_button"]).toBeUndefined();
  });
});

describe("relative locale urls", () => {
  it("prefixes the current locale when prefixDefaultLocale is true", () => {
    setCurrentLocale("en");
    expect(getRelativeLocaleUrl("/about")).toBe("/en/about");
    expect(getRelativeLocaleUrl("/about", { locale: "pt" })).toBe("/pt/about");
  });

  it("preserves query strings and hashes", () => {
    expect(getRelativeLocaleUrl("/about?page=2#top")).toBe("/en/about?page=2#top");
  });

  it("handles root paths", () => {
    expect(getRelativeLocaleUrl("/")).toBe("/en/");
  });

  it("passes external urls through unchanged", () => {
    expect(getRelativeLocaleUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(getRelativeLocaleUrl("#anchor")).toBe("#anchor");
    expect(getRelativeLocaleUrl("mailto:hi@example.com")).toBe("mailto:hi@example.com");
  });
});

describe("translation runtime", () => {
  it("returns the plural category for a locale", () => {
    expect(getPluralCategory(1, "en")).toBe("one");
    expect(getPluralCategory(2, "en")).toBe("other");
  });

  it("translates keys after initialization", () => {
    setTranslations(
      {
        en: {
          hero: { title: "Hello", greeting: "Hi {name}" },
        },
      },
      { defaultLocale: "en" },
    );
    setCurrentLocale("en");
    expect(t("hero.title")).toBe("Hello");
    expect(t("hero.greeting", { name: "Ada" })).toBe("Hi Ada");
    expect(t("missing.key")).toBe("missing.key");
  });
});

describe("t.localize", () => {
  it("resolves the current locale from a dictionary object", () => {
    setTranslations({}, { defaultLocale: "en", locales: ["en", "pt", "es"] });
    setCurrentLocale("pt");
    expect(t.localize({ en: "Hello", pt: "Olá", es: "Hola" })).toBe("Olá");
  });

  it("falls back to defaultLocale when the locale is missing or empty", () => {
    setTranslations({}, { defaultLocale: "en", locales: ["en", "de", "fr"] });
    setCurrentLocale("de");
    expect(t.localize({ en: "Hello World", fr: "" })).toBe("Hello World");
  });

  it("supports an explicit locale override", () => {
    setCurrentLocale("en");
    expect(t.localize({ en: "Hello", pt: "Olá" }, "pt")).toBe("Olá");
  });

  it("returns raw strings and stringifies primitives", () => {
    setCurrentLocale("en");
    expect(t.localize("Plain string")).toBe("Plain string");
    expect(t.localize(123)).toBe("123");
    expect(t.localize(true)).toBe("true");
  });

  it("returns empty string for null or undefined", () => {
    setCurrentLocale("en");
    expect(t.localize(null)).toBe("");
    expect(t.localize(undefined)).toBe("");
  });
});

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { verifyTranslations, formatAuditReport, fixTranslations } from "../src/lint";
import { setCurrentLocale, getLocaleUrl, getLocaleAsset, t } from "../src/index";
import { placeholderNames } from "../src/shared";
import { activeConfig } from "../src/runtime";

describe("translation dictionary utils", () => {
  const source = {
    hero: { title: "Hello", subtitle: "Welcome" },
    nav: { home: "Home" },
  };

  it("fills a locale's missing keys from the base, keeping the nested shape", () => {
    expect(fixTranslations({ en: source, fr: { hero: { title: "Bonjour" } } }, "en")["fr"]).toEqual(
      {
        hero: { title: "Bonjour", subtitle: "Welcome" },
        nav: { home: "Home" },
      },
    );
  });

  it("keeps arrays as arrays when filling from the base", () => {
    const withArrays = { tags: ["a", "b"], list: [{ name: "x", role: "dev" }] };
    expect(fixTranslations({ en: withArrays, fr: {} }, "en")["fr"]).toEqual(withArrays);
  });

  it("finds missing keys between dictionaries", () => {
    const missing = verifyTranslations({ en: source, fr: { hero: { title: "Hello" } } })
      .missingKeys["fr"];
    expect(missing).toEqual(["hero.subtitle", "nav.home"]);
  });

  it("finds stale keys between dictionaries", () => {
    const stale = verifyTranslations({
      en: source,
      fr: {
        hero: { title: "Hello", old_cta: "Legacy" },
        legacy_nav: { item: "Old" },
      },
    }).staleKeys["fr"];
    expect(stale).toEqual(["hero.old_cta", "legacy_nav.item"]);
  });

  it("handles non-string values when extracting placeholders", () => {
    expect(placeholderNames("Hello {name}")).toEqual(["name"]);
    expect(placeholderNames(2023)).toEqual([]);
    expect(placeholderNames(true)).toEqual([]);
  });

  it("verifies dictionaries containing numeric and boolean values without crashing", () => {
    const translations = {
      en: { meta: { founded: 2023, featured: true }, nav: { home: "Home" } },
      pt: { meta: { founded: 2022, featured: false }, nav: { home: "Início" } },
    };

    const report = verifyTranslations(translations, { defaultLocale: "en" });
    expect(report.isValid).toBe(true);
  });

  it("flags placeholder mismatches while ignoring non-string values", () => {
    const translations = {
      en: { meta: { count: "{count} items" }, nav: { home: "Home" } },
      pt: { meta: { count: 3 }, nav: { home: "Início" } },
    };

    const report = verifyTranslations(translations, { defaultLocale: "en" });
    expect(report.isValid).toBe(false);
    expect(report.placeholderMismatches["pt"]).toEqual([
      { key: "meta.count", basePlaceholders: ["count"], targetPlaceholders: [] },
    ]);
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
  beforeEach(() => {
    Object.assign(activeConfig, {
      locales: ["en", "pt"],
      defaultLocale: "en",
      prefixDefaultLocale: true,
    });
    setCurrentLocale("en");
  });

  it("prefixes the current locale when prefixDefaultLocale is true", () => {
    setCurrentLocale("en");
    expect(getLocaleUrl("/about")).toBe("/en/about");
    expect(getLocaleUrl("/about", "pt")).toBe("/pt/about");
  });

  it("handles trailing slashes without creating double slashes", () => {
    expect(getLocaleUrl("/about/")).toBe("/en/about/");
    expect(getLocaleUrl("/pt/about/", "en")).toBe("/en/about/");
    expect(getLocaleUrl("/pt/about/")).toBe("/en/about/");
  });

  it("replaces existing locale prefix when changing locale", () => {
    expect(getLocaleUrl("/en/about", "pt")).toBe("/pt/about");
    expect(getLocaleUrl("/pt/about?tab=1", "en")).toBe("/en/about?tab=1");
  });

  it("preserves query strings and hashes", () => {
    expect(getLocaleUrl("/about?page=2#top")).toBe("/en/about?page=2#top");
  });

  it("handles root paths", () => {
    expect(getLocaleUrl("/")).toBe("/en/");
    expect(getLocaleUrl("/", "pt")).toBe("/pt/");
  });

  it("passes external urls through unchanged", () => {
    expect(getLocaleUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(getLocaleUrl("#anchor")).toBe("#anchor");
    expect(getLocaleUrl("mailto:hi@example.com")).toBe("mailto:hi@example.com");
  });

  it("leaves skipped and file paths unchanged", () => {
    expect(getLocaleUrl("/api/download")).toBe("/api/download");
    expect(getLocaleUrl("/api")).toBe("/api");
    expect(getLocaleUrl("/files/report.pdf?v=2")).toBe("/files/report.pdf?v=2");
  });
});

describe("translation runtime", () => {
  it("returns the plural category for a locale", () => {
    expect(t.plural(1, "en")).toBe("one");
    expect(t.plural(2, "en")).toBe("other");
  });

  it("translates keys after initialization", () => {
    Object.assign(activeConfig, {
      defaultLocale: "en",
      translations: {
        en: {
          hero: { title: "Hello", greeting: "Hi {name}" },
        },
      },
    });
    setCurrentLocale("en");
    expect(t("hero.title")).toBe("Hello");
    expect(t("hero.greeting", { name: "Ada" })).toBe("Hi Ada");
    expect(t("missing.key")).toBe("missing.key");
  });
});

describe("t.localize", () => {
  it("resolves the current locale from a dictionary object", () => {
    Object.assign(activeConfig, { defaultLocale: "en", locales: ["en", "pt", "es"] });
    setCurrentLocale("pt");
    expect(t.localize({ en: "Hello", pt: "Olá", es: "Hola" })).toBe("Olá");
  });

  it("falls back to defaultLocale when the locale is missing or empty", () => {
    Object.assign(activeConfig, { defaultLocale: "en", locales: ["en", "de", "fr"] });
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

describe("getLocaleAsset", () => {
  it("resolves the asset for the active locale", () => {
    Object.assign(activeConfig, { defaultLocale: "en" });
    setCurrentLocale("es");
    expect(getLocaleAsset({ en: "/hero-en.png", es: "/hero-es.png" })).toBe("/hero-es.png");
  });

  it("falls back to defaultLocale when active locale is not in dictionary", () => {
    Object.assign(activeConfig, { defaultLocale: "en" });
    setCurrentLocale("fr");
    expect(getLocaleAsset({ en: "/hero-en.png", es: "/hero-es.png" })).toBe("/hero-en.png");
  });

  it("supports explicit locale argument", () => {
    Object.assign(activeConfig, { defaultLocale: "en" });
    setCurrentLocale("en");
    expect(getLocaleAsset({ en: "/hero-en.png", es: "/hero-es.png" }, "es")).toBe("/hero-es.png");
  });
});

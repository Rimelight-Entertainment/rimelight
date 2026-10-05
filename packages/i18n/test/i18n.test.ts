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
} from "../src/utils";
import { getPluralCategory, initializeI18n, currentLocale, t } from "../src/runtime";
import {
  getHtmlLang,
  getOgLocale,
  getRelativeLocaleUrl,
  getLanguageAlternates,
} from "../src/index";

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

describe("locale helpers", () => {
  it("formats html lang attributes", () => {
    currentLocale.set("en");
    expect(getHtmlLang()).toBe("en-US");
    currentLocale.set("pt");
    expect(getHtmlLang()).toBe("pt-BR");
    currentLocale.set("fr");
    expect(getHtmlLang()).toBe("fr");
  });

  it("formats og locale attributes", () => {
    currentLocale.set("en");
    expect(getOgLocale()).toBe("en_US");
    currentLocale.set("pt");
    expect(getOgLocale()).toBe("pt_BR");
    currentLocale.set("de");
    expect(getOgLocale()).toBe("de_DE");
  });
});

describe("relative locale urls", () => {
  it("prefixes the current locale when prefixDefaultLocale is true", () => {
    currentLocale.set("en");
    expect(getRelativeLocaleUrl("/about")).toBe("/en/about");
    expect(getRelativeLocaleUrl("pt", "/about")).toBe("/pt/about");
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

describe("language alternates", () => {
  it("builds hreflang alternates including x-default", () => {
    const alternates = getLanguageAlternates("/about", "https://example.com");
    expect(alternates).toEqual([
      { hreflang: "en", href: "https://example.com/en/about" },
      { hreflang: "x-default", href: "https://example.com/en/about" },
    ]);
  });
});

describe("translation runtime", () => {
  it("returns the plural category for a locale", () => {
    expect(getPluralCategory(1, "en")).toBe("one");
    expect(getPluralCategory(2, "en")).toBe("other");
  });

  it("translates keys after initialization", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          hero: { title: "Hello", greeting: "Hi {name}" },
        },
      },
    });
    currentLocale.set("en");
    expect(t("hero.title")).toBe("Hello");
    expect(t("hero.greeting", { name: "Ada" })).toBe("Hi Ada");
    expect(t("missing.key")).toBe("missing.key");
  });
});

describe("translation loader & KV binding", () => {
  it("loads translations statically when KV is not set", async () => {
    const { createTranslationLoader } = await import("../src/index");
    const loader = createTranslationLoader({
      en: { nav: { home: "Home" } },
    });
    const loaded = await loader("en", ["nav"]);
    expect(loaded).toEqual({ nav: { home: "Home" } });
  });

  it("loads translations from KV when present, falling back to static", async () => {
    const { createTranslationLoader, setKVBinding } = await import("../src/index");
    const mockKV = {
      get: async (key: string) => {
        if (key === "locale:en:nav") {
          return { home: "Homepage (KV)" };
        }
        return null;
      },
    };
    setKVBinding(mockKV as any);

    const loader = createTranslationLoader({
      en: {
        nav: { home: "Home" },
        footer: { copyright: "© 2026" },
      },
    });

    const loaded = await loader("en", ["nav", "footer"]);
    expect(loaded).toEqual({
      nav: { home: "Homepage (KV)" },
      footer: { copyright: "© 2026" },
    });
  });
});

describe("getLocalizedText", () => {
  it("resolves the requested locale from a dictionary object", async () => {
    const { getLocalizedText } = await import("../src/index");
    const val = { en: "Hello", pt: "Olá", es: "Hola" };
    expect(getLocalizedText(val, "pt")).toBe("Olá");
    expect(getLocalizedText(val, "es")).toBe("Hola");
  });

  it("falls back to default fallback locale ('en') if locale is not found or empty", async () => {
    const { getLocalizedText } = await import("../src/index");
    const val = { en: "Hello World", fr: "" };
    expect(getLocalizedText(val, "de")).toBe("Hello World");
    expect(getLocalizedText(val, "fr")).toBe("Hello World");
  });

  it("supports custom fallback locale", async () => {
    const { getLocalizedText } = await import("../src/index");
    const val = { es: "Hola Mundo" };
    expect(getLocalizedText(val, "de", "es")).toBe("Hola Mundo");
    expect(getLocalizedText(val, "de", "fr")).toBe("");
  });

  it("returns raw string if val is a plain string", async () => {
    const { getLocalizedText } = await import("../src/index");
    expect(getLocalizedText("Plain string", "fr")).toBe("Plain string");
  });

  it("stringifies number or boolean primitives", async () => {
    const { getLocalizedText } = await import("../src/index");
    expect(getLocalizedText(123, "en")).toBe("123");
    expect(getLocalizedText(true, "en")).toBe("true");
  });

  it("returns empty string if val is null or undefined", async () => {
    const { getLocalizedText } = await import("../src/index");
    expect(getLocalizedText(null, "en")).toBe("");
    expect(getLocalizedText(undefined, "en")).toBe("");
  });
});

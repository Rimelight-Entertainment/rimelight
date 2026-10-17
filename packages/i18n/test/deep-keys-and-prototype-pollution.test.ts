import { describe, expect, it } from "vite-plus/test";
import { flatten, unflatten, findMissingKeys } from "../src/cli";
import { setCurrentLocale, t } from "../src/index";
import { activeConfig } from "../src/runtime";

describe("@rimelight/i18n - Deep Keys, Flattener and Prototype Pollution Safety", () => {
  const translations = {
    en: {
      nav: {
        home: "Home",
        nested: "Nested Value",
      },
      messages: {
        welcome: "Welcome, {user}!",
      },
    },
    fr: {
      nav: {
        home: "Accueil",
      },
    },
  };

  it("flattens and extracts component translation keys", () => {
    const flattened = flatten(translations.en);
    expect(flattened["nav.home"]).toBe("Home");
    expect(flattened["nav.nested"]).toBe("Nested Value");
    expect(flattened["messages.welcome"]).toBe("Welcome, {user}!");
  });

  it("unflattens dotted component keys accurately", () => {
    const flat = {
      "nav.home": "Home",
      "nav.about": "About",
      "footer.contact": "Contact Us",
    };

    const unflattened = unflatten(flat) as Record<string, Record<string, string>>;
    expect(unflattened["nav"]?.["home"]).toBe("Home");
    expect(unflattened["nav"]?.["about"]).toBe("About");
    expect(unflattened["footer"]?.["contact"]).toBe("Contact Us");
  });

  it("extracts and diffs translation keys across languages", () => {
    const missing = findMissingKeys(translations.en, translations.fr);
    expect(missing).toContain("messages.welcome");
    expect(missing).toContain("nav.nested");
  });

  it("handles runtime translations and interpolation", () => {
    Object.assign(activeConfig, {
      defaultLocale: "en",
      translations,
    });
    setCurrentLocale("en");
    expect(t("nav.home")).toBe("Home");
    expect(t("messages.welcome", { user: "Marcelo" })).toBe("Welcome, Marcelo!");
    expect(t("unknown.missing.key")).toBe("unknown.missing.key");
  });
});

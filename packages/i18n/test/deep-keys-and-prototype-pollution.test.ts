import { describe, expect, it } from "vite-plus/test";
import { fixTranslations, verifyTranslations } from "../src/lint";
import { placeholderNames } from "../src/shared";
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

  it("fills a locale's missing deep keys from the base, keeping the nested shape", () => {
    expect(fixTranslations(translations, "en")["fr"]).toEqual({
      nav: { home: "Accueil", nested: "Nested Value" },
      messages: { welcome: "Welcome, {user}!" },
    });
  });

  it("extracts and diffs translation keys across languages", () => {
    const missing = verifyTranslations(translations).missingKeys["fr"];
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

  it("does not resolve inherited Object members as translations", () => {
    expect(t.raw("constructor", "fallback", "en")).toBe("fallback");
    expect(t("toString", undefined, "en")).toBe("toString");
    expect(t("nav.constructor", undefined, "en")).toBe("nav.constructor");
    expect(t.raw("constructor", "fallback", "constructor")).toBe("fallback");
  });

  it("does not substitute inherited Object members as params", () => {
    Object.assign(translations.en, { greeting: "Hi {constructor} and {toString}" });
    expect(t("greeting", {}, "en")).toBe("Hi {constructor} and {toString}");
  });

  it("treats {name} and { name } as the same placeholder, at runtime and in the CLI", () => {
    Object.assign(translations.en, { spaced: "Hi { user }" });
    expect(t("spaced", { user: "Ana" }, "en")).toBe("Hi Ana");
    expect(placeholderNames("Olá { name }")).toEqual(["name"]);
    expect(placeholderNames("Olá {name} {name}")).toEqual(["name"]);
  });
});

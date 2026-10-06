import { describe, expect, it } from "vite-plus/test";
import { getPluralCategory, setTranslations, getLocale, setLocale, t } from "../src/runtime";

describe("@rimelight/i18n advanced runtime & edge cases", () => {
  it("should handle plural categories for multiple languages", () => {
    // English
    expect(getPluralCategory(1, "en")).toBe("one");
    expect(getPluralCategory(0, "en")).toBe("other");
    expect(getPluralCategory(5, "en")).toBe("other");

    // Portuguese
    expect(getPluralCategory(1, "pt")).toBe("one");
    expect(getPluralCategory(2, "pt")).toBe("other");

    // File-derived locale codes with underscores are normalized (Intl throws otherwise)
    expect(getPluralCategory(1, "pt_BR")).toBe("one");
    expect(getPluralCategory(2, "pt_BR")).toBe("other");
  });

  it("should format complex translations with placeholders", () => {
    setTranslations(
      {
        en: {
          items: {
            count: "You have {count} items in your {container}.",
            welcome: "Hello, {name}!",
          },
        },
      },
      { defaultLocale: "en" },
    );

    setLocale("en");
    expect(t("items.count", { count: 3, container: "cart" })).toBe(
      "You have 3 items in your cart.",
    );
    expect(t("items.welcome", { name: "Alice" })).toBe("Hello, Alice!");
  });

  it("should handle plural object structures via t() helper", () => {
    setTranslations(
      {
        en: {
          messages: {
            unread: {
              one: "1 new message",
              other: "{count} new messages",
            },
          },
        },
      },
      { defaultLocale: "en" },
    );

    setLocale("en");
    expect(t("messages.unread", { count: 1 })).toBe("1 new message");
    expect(t("messages.unread", { count: 5 })).toBe("5 new messages");
  });

  it("should locale-format the numeric count param during interpolation", () => {
    setTranslations(
      {
        en: {
          messages: {
            unread: {
              one: "{count} new message",
              other: "{count} new messages",
            },
          },
          misc: {
            rating: "rating: {score}",
          },
        },
        pt: {
          messages: {
            unread: {
              other: "{count} novas mensagens",
            },
          },
        },
      },
      { defaultLocale: "en", locales: ["en", "pt"] },
    );

    // Grouped per locale
    setLocale("en");
    expect(t("messages.unread", { count: 1234 })).toBe("1,234 new messages");
    setLocale("pt");
    expect(t("messages.unread", { count: 1234 })).toBe("1.234 novas mensagens");

    // Non-count params are not formatted
    setLocale("en");
    expect(t("misc.rating", { score: 1234 })).toBe("rating: 1234");
  });

  it("should handle regional sub-locales and fallback chain", () => {
    setTranslations(
      {
        en: {
          common: { button: "Submit", cancel: "Cancel" },
        },
        "pt-BR": {
          common: { button: "Enviar" },
        },
      },
      { defaultLocale: "en" },
    );

    setLocale("pt-BR");
    expect(t("common.button")).toBe("Enviar");
    // Falls back to base/default language for missing key in sub-locale
    expect(t("common.cancel")).toBe("Cancel");
  });

  it("should handle multi-tier fallback across regional variants and custom default locales", () => {
    setTranslations(
      {
        "pt-BR": {
          shop: { checkout: "Finalizar Compra" },
        },
        pt: {
          shop: { cart: "Carrinho" },
        },
        "es-MX": {
          shop: { currency: "MXN$" },
        },
        es: {
          shop: { search: "Buscar", help: "Ayuda" },
        },
        en: {
          shop: { help: "Help", fallbackOnly: "Fallback Only" },
        },
      },
      { defaultLocale: "es-MX" },
    );

    setLocale("pt-BR");
    // 1. Direct regional match (pt-BR)
    expect(t("shop.checkout")).toBe("Finalizar Compra");
    // 2. Active base language fallback (pt)
    expect(t("shop.cart")).toBe("Carrinho");
    // 3. Configured default regional locale (es-MX)
    expect(t("shop.currency")).toBe("MXN$");
    // 4. Configured default base language (es)
    expect(t("shop.search")).toBe("Buscar");
    expect(t("shop.help")).toBe("Ayuda");
    // 5. Ultimate fallback if key only exists in en
    expect(t("shop.fallbackOnly")).toBe("Fallback Only");
  });

  it("should support function values in translations", () => {
    setTranslations(
      {
        en: {
          computed: {
            dynamic: (p: { val: number }) => `Result is ${p.val * 2}`,
          },
        },
      },
      { defaultLocale: "en" },
    );

    setLocale("en");
    expect(t("computed.dynamic", { val: 21 })).toBe("Result is 42");
  });

  it("should expose the current locale through getLocale/setLocale", () => {
    setLocale("en");
    expect(getLocale()).toBe("en");

    setLocale("pt-BR");
    expect(getLocale()).toBe("pt-BR");

    setLocale("de");
    expect(getLocale()).toBe("de");
  });

  it("should handle interpolation with booleans, numbers, and missing placeholders", () => {
    setTranslations(
      {
        en: {
          misc: {
            details: "User {user} is active: {isActive}, rating: {score}, missing: {missingVar}",
            emptyStr: "",
            numericVal: 42,
            boolVal: true,
            objectVal: { a: 1, b: "two" },
          },
        },
      },
      { defaultLocale: "en" },
    );

    setLocale("en");
    expect(t("misc.details", { user: "Ada", isActive: true, score: 9.8 })).toBe(
      "User Ada is active: true, rating: 9.8, missing: {missingVar}",
    );

    expect(t("misc.emptyStr")).toBe("");
    expect(t("misc.numericVal")).toBe("42");
    expect(t("misc.boolVal")).toBe("true");
    expect(t("misc.objectVal")).toBe('{"a":1,"b":"two"}');
    expect(t("misc.nonExistentKey")).toBe("misc.nonExistentKey");
    expect(t("non_existent_component.key")).toBe("non_existent_component.key");
  });
});

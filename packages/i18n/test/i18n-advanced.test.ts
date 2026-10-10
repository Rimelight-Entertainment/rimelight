import { describe, expect, it } from "vite-plus/test";
import { getCurrentLocale, setCurrentLocale, t } from "../src/index";
import { setTranslations } from "./helpers";

describe("@rimelight/i18n advanced runtime & edge cases", () => {
  it("should handle plural categories for multiple languages", () => {
    // English
    expect(t.plural(1, "en")).toBe("one");
    expect(t.plural(0, "en")).toBe("other");
    expect(t.plural(5, "en")).toBe("other");

    // Portuguese
    expect(t.plural(1, "pt")).toBe("one");
    expect(t.plural(2, "pt")).toBe("other");

    expect(t.plural(1, "pt-BR")).toBe("one");
    expect(t.plural(2, "pt-BR")).toBe("other");
  });

  it("should expose plural categories through t.plural", () => {
    setTranslations({ en: {} }, { defaultLocale: "en", locales: ["en", "pt"] });

    // Defaults to the active locale
    setCurrentLocale("en");
    expect(t.plural(1)).toBe("one");
    expect(t.plural(5)).toBe("other");

    setCurrentLocale("pt");
    expect(t.plural(1)).toBe("one");
    expect(t.plural(2)).toBe("other");

    // Explicit locale wins over the active one
    expect(t.plural(2, "pt-BR")).toBe("other");
    expect(t.plural(1, "en")).toBe("one");
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

    setCurrentLocale("en");
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

    setCurrentLocale("en");
    expect(t("messages.unread", { count: 1 })).toBe("1 new message");
    expect(t("messages.unread", { count: 5 })).toBe("5 new messages");
  });

  it("selects the plural branch even without a {count} placeholder (self-rendered numbers)", () => {
    setTranslations(
      {
        en: {
          comments: {
            summary: {
              one: "new comment",
              other: "new comments",
            },
          },
        },
      },
      { defaultLocale: "en" },
    );

    setCurrentLocale("en");
    // count drives branch selection; the caller renders the number itself
    expect(t("comments.summary", { count: 1 })).toBe("new comment");
    expect(t("comments.summary", { count: 1234 })).toBe("new comments");
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
    setCurrentLocale("en");
    expect(t("messages.unread", { count: 1234 })).toBe("1,234 new messages");
    setCurrentLocale("pt");
    expect(t("messages.unread", { count: 1234 })).toBe("1.234 novas mensagens");

    // Non-count params are not formatted
    setCurrentLocale("en");
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

    setCurrentLocale("pt-BR");
    expect(t("common.button")).toBe("Enviar");
    // Falls back to default locale (en) for missing key in sub-locale
    expect(t("common.cancel")).toBe("Cancel");
  });

  it("should handle fallback across regional variants and custom default locales", () => {
    setTranslations(
      {
        "pt-BR": {
          shop: { checkout: "Finalizar Compra" },
        },
        "es-MX": {
          shop: { currency: "MXN$", search: "Buscar" },
        },
        en: {
          shop: { help: "Help" },
        },
      },
      { defaultLocale: "es-MX" },
    );

    setCurrentLocale("pt-BR");
    // 1. Direct regional match (pt-BR)
    expect(t("shop.checkout")).toBe("Finalizar Compra");
    // 2. Fallback to default locale (es-MX)
    expect(t("shop.currency")).toBe("MXN$");
    expect(t("shop.search")).toBe("Buscar");
    // 3. Key not in active or default locale returns the key itself
    expect(t("shop.help")).toBe("shop.help");
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

    setCurrentLocale("en");
    expect(t("computed.dynamic", { val: 21 })).toBe("Result is 42");
  });

  it("should expose the current locale through getCurrentLocale/setCurrentLocale", () => {
    setCurrentLocale("en");
    expect(getCurrentLocale()).toBe("en");

    setCurrentLocale("pt-BR");
    expect(getCurrentLocale()).toBe("pt-BR");

    setCurrentLocale("de");
    expect(getCurrentLocale()).toBe("de");
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

    setCurrentLocale("en");
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

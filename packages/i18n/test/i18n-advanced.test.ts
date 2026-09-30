import { describe, expect, it } from "vite-plus/test";
import { atom, getPluralCategory, initializeI18n, currentLocale, t } from "../src/runtime";
import { getLanguageAlternates } from "../src/index";

describe("@rimelight/i18n advanced runtime & edge cases", () => {
  it("should handle plural categories for multiple languages", () => {
    // English
    expect(getPluralCategory(1, "en")).toBe("one");
    expect(getPluralCategory(0, "en")).toBe("other");
    expect(getPluralCategory(5, "en")).toBe("other");

    // Portuguese
    expect(getPluralCategory(1, "pt")).toBe("one");
    expect(getPluralCategory(2, "pt")).toBe("other");
  });

  it("should format complex translations with placeholders", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          items: {
            count: "You have {count} items in your {container}.",
            welcome: "Hello, {name}!",
          },
        },
      },
    });

    currentLocale.set("en");
    expect(t("items.count", { count: 3, container: "cart" })).toBe(
      "You have 3 items in your cart.",
    );
    expect(t("items.welcome", { name: "Alice" })).toBe("Hello, Alice!");
  });

  it("should handle plural object structures via t() helper", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          messages: {
            unread: {
              one: "1 new message",
              other: "{count} new messages",
            },
          },
        },
      },
    });

    currentLocale.set("en");
    expect(t("messages.unread", { count: 1 })).toBe("1 new message");
    expect(t("messages.unread", { count: 5 })).toBe("5 new messages");
  });

  it("should generate language alternates with custom base urls", () => {
    const alternates = getLanguageAlternates("/pricing", "https://rimelight.com");
    expect(alternates).toContainEqual({
      hreflang: "x-default",
      href: "https://rimelight.com/en/pricing",
    });
  });

  it("should handle regional sub-locales and fallback chain", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          common: { button: "Submit", cancel: "Cancel" },
        },
        "pt-BR": {
          common: { button: "Enviar" },
        },
      },
    });

    currentLocale.set("pt-BR");
    expect(t("common.button")).toBe("Enviar");
    // Falls back to base/default language for missing key in sub-locale
    expect(t("common.cancel")).toBe("Cancel");
  });

  it("should handle multi-tier fallback across regional variants and custom default locales", () => {
    initializeI18n({
      defaultLocale: "es-MX",
      translations: {
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
    });

    currentLocale.set("pt-BR");
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
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          computed: {
            dynamic: (p: { val: number }) => `Result is ${p.val * 2}`,
          },
        },
      },
    });

    currentLocale.set("en");
    expect(t("computed.dynamic", { val: 21 })).toBe("Result is 42");
  });

  it("should support reactive atom stores with subscribe, listen, and get/set", () => {
    const localeAtom = currentLocale;
    localeAtom.set("en");
    expect(localeAtom.get()).toBe("en");

    const subscribedValues: string[] = [];
    const listenedValues: string[] = [];

    // subscribe calls listener immediately with current value
    const unsubSubscribe = localeAtom.subscribe((val) => {
      subscribedValues.push(val);
    });

    // listen only calls listener on subsequent changes
    const unsubListen = localeAtom.listen((val) => {
      listenedValues.push(val);
    });

    expect(subscribedValues).toEqual(["en"]);
    expect(listenedValues).toEqual([]);

    localeAtom.set("pt-BR");
    expect(subscribedValues).toEqual(["en", "pt-BR"]);
    expect(listenedValues).toEqual(["pt-BR"]);

    // Setting identical value should not trigger listeners
    localeAtom.set("pt-BR");
    expect(subscribedValues).toEqual(["en", "pt-BR"]);
    expect(listenedValues).toEqual(["pt-BR"]);

    // Unsubscribe
    unsubSubscribe();
    unsubListen();

    localeAtom.set("de");
    expect(subscribedValues).toEqual(["en", "pt-BR"]);
    expect(listenedValues).toEqual(["pt-BR"]);
    expect(localeAtom.get()).toBe("de");
  });

  it("should handle atom stores with complex types and multiple independent subscribers", () => {
    const store = atom({ count: 0, text: "initial" });

    let callCountA = 0;
    let callCountB = 0;

    const unsubA = store.subscribe(() => {
      callCountA++;
    });
    const unsubB = store.subscribe(() => {
      callCountB++;
    });

    expect(callCountA).toBe(1);
    expect(callCountB).toBe(1);

    store.set({ count: 1, text: "updated" });
    expect(callCountA).toBe(2);
    expect(callCountB).toBe(2);
    expect(store.get()).toEqual({ count: 1, text: "updated" });

    unsubA();
    store.set({ count: 2, text: "again" });
    expect(callCountA).toBe(2);
    expect(callCountB).toBe(3);

    unsubB();
  });

  it("should handle interpolation with booleans, numbers, and missing placeholders", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
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
    });

    currentLocale.set("en");
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

import { describe, expect, it } from "vitest"
import { getPluralCategory, initializeI18n, currentLocale, t, useFormat } from "../src/runtime"
import { getHtmlLang, getOgLocale, getRelativeLocaleUrl, getLanguageAlternates } from "../src/index"

describe("@rimelight/i18n advanced runtime & edge cases", () => {
  it("should handle plural categories for multiple languages", () => {
    // English
    expect(getPluralCategory(1, "en")).toBe("one")
    expect(getPluralCategory(0, "en")).toBe("other")
    expect(getPluralCategory(5, "en")).toBe("other")

    // Portuguese
    expect(getPluralCategory(1, "pt")).toBe("one")
    expect(getPluralCategory(2, "pt")).toBe("other")
  })

  it("should format complex translations with placeholders", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          items: {
            count: "You have {count} items in your {container}.",
            welcome: "Hello, {name}!"
          }
        }
      }
    })

    currentLocale.set("en")
    expect(t("items.count", { count: 3, container: "cart" })).toBe("You have 3 items in your cart.")
    expect(t("items.welcome", { name: "Alice" })).toBe("Hello, Alice!")
  })

  it("should handle plural object structures via t() helper", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          messages: {
            unread: {
              one: "1 new message",
              other: "{count} new messages"
            }
          }
        }
      }
    })

    currentLocale.set("en")
    expect(t("messages.unread", { count: 1 })).toBe("1 new message")
    expect(t("messages.unread", { count: 5 })).toBe("5 new messages")
  })

  it("should generate language alternates with custom base urls", () => {
    const alternates = getLanguageAlternates("/pricing", "https://rimelight.com")
    expect(alternates).toContainEqual({
      hreflang: "x-default",
      href: "https://rimelight.com/en/pricing"
    })
  })
})

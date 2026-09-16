import { describe, expect, it } from "vite-plus/test"
import { flatten, unflatten, extractKeys, findMissingKeys } from "../src/utils"
import { getPluralCategory, initializeI18n, currentLocale, t } from "../src/runtime"
import { getHtmlLang, getOgLocale, getRelativeLocaleUrl, getLanguageAlternates } from "../src/index"

describe("translation dictionary utils", () => {
  const source = {
    hero: { title: "Hello", subtitle: "Welcome" },
    nav: { home: "Home" }
  }

  it("flattens nested translations into dotted keys", () => {
    expect(flatten(source)).toEqual({
      "hero.title": "Hello",
      "hero.subtitle": "Welcome",
      "nav.home": "Home"
    })
  })

  it("unflattens dotted keys back into components", () => {
    expect(unflatten({ "hero.title": "Hello", "nav.home": "Home" })).toEqual({
      hero: { title: "Hello" },
      nav: { home: "Home" }
    })
  })

  it("round-trips flatten and unflatten", () => {
    expect(unflatten(flatten(source))).toEqual(source)
  })

  it("extracts component keys", () => {
    expect(extractKeys(source).sort()).toEqual(["hero.subtitle", "hero.title", "nav.home"])
  })

  it("finds missing keys between dictionaries", () => {
    const missing = findMissingKeys(source, { hero: { title: "Hello" } })
    expect(missing).toEqual(["hero.subtitle", "nav"])
  })
})

describe("locale helpers", () => {
  it("formats html lang attributes", () => {
    currentLocale.set("en")
    expect(getHtmlLang()).toBe("en-US")
    currentLocale.set("pt")
    expect(getHtmlLang()).toBe("pt-BR")
    currentLocale.set("fr")
    expect(getHtmlLang()).toBe("fr")
  })

  it("formats og locale attributes", () => {
    currentLocale.set("en")
    expect(getOgLocale()).toBe("en_US")
    currentLocale.set("pt")
    expect(getOgLocale()).toBe("pt_BR")
    currentLocale.set("de")
    expect(getOgLocale()).toBe("de_DE")
  })
})

describe("relative locale urls", () => {
  it("prefixes the current locale when prefixDefaultLocale is true", () => {
    currentLocale.set("en")
    expect(getRelativeLocaleUrl("/about")).toBe("/en/about")
    expect(getRelativeLocaleUrl("pt", "/about")).toBe("/pt/about")
  })

  it("preserves query strings and hashes", () => {
    expect(getRelativeLocaleUrl("/about?page=2#top")).toBe("/en/about?page=2#top")
  })

  it("handles root paths", () => {
    expect(getRelativeLocaleUrl("/")).toBe("/en/")
  })

  it("passes external urls through unchanged", () => {
    expect(getRelativeLocaleUrl("https://example.com/x")).toBe("https://example.com/x")
    expect(getRelativeLocaleUrl("#anchor")).toBe("#anchor")
    expect(getRelativeLocaleUrl("mailto:hi@example.com")).toBe("mailto:hi@example.com")
  })
})

describe("language alternates", () => {
  it("builds hreflang alternates including x-default", () => {
    const alternates = getLanguageAlternates("/about", "https://example.com")
    expect(alternates).toEqual([
      { hreflang: "en", href: "https://example.com/en/about" },
      { hreflang: "x-default", href: "https://example.com/en/about" }
    ])
  })
})

describe("translation runtime", () => {
  it("returns the plural category for a locale", () => {
    expect(getPluralCategory(1, "en")).toBe("one")
    expect(getPluralCategory(2, "en")).toBe("other")
  })

  it("translates keys after initialization", () => {
    initializeI18n({
      defaultLocale: "en",
      translations: {
        en: {
          hero: { title: "Hello", greeting: "Hi {name}" }
        }
      }
    })
    currentLocale.set("en")
    expect(t("hero.title")).toBe("Hello")
    expect(t("hero.greeting", { name: "Ada" })).toBe("Hi Ada")
    expect(t("missing.key")).toBe("missing.key")
  })
})

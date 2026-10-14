import { describe, it, expect, afterEach } from "vite-plus/test";
import {
  getDocumentTheme,
  getThemePreference,
  parseThemePreference,
  serializeThemePreference,
} from "../src/theme";

const clearThemeCookie = () => {
  document.cookie = "theme=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
};

afterEach(clearThemeCookie);

describe("parseThemePreference", () => {
  it("accepts the supported preferences", () => {
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("system")).toBe("system");
  });

  it("rejects anything else", () => {
    expect(parseThemePreference("blue")).toBeUndefined();
    expect(parseThemePreference("")).toBeUndefined();
    expect(parseThemePreference(null)).toBeUndefined();
    expect(parseThemePreference(undefined)).toBeUndefined();
  });
});

describe("getThemePreference", () => {
  it("returns undefined when unset or invalid", () => {
    expect(getThemePreference()).toBeUndefined();
    document.cookie = "theme=blue";
    expect(getThemePreference()).toBeUndefined();
  });

  it("reads the preference from the cookie", () => {
    document.cookie = "other=1";
    document.cookie = "theme=dark";
    expect(getThemePreference()).toBe("dark");
  });
});

describe("getDocumentTheme", () => {
  it("maps explicit preferences onto the root attribute", () => {
    document.cookie = "theme=dark";
    expect(getDocumentTheme()).toBe("dark");
    document.cookie = "theme=light";
    expect(getDocumentTheme()).toBe("light");
  });

  it("omits the attribute for system so CSS resolves it", () => {
    document.cookie = "theme=system";
    expect(getDocumentTheme()).toBeUndefined();
    expect(getDocumentTheme()).toBeUndefined();
  });
});

describe("serializeThemePreference", () => {
  it("emits a persistent, site-wide cookie", () => {
    const cookie = serializeThemePreference("dark");
    expect(cookie).toContain("theme=dark");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=31536000");
    expect(cookie).toContain("SameSite=Lax");
  });
});

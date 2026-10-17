import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { i18n } from "../src/middleware";
import { getCurrentLocale } from "../src/index";
import { activeConfig } from "../src/runtime";

const runMiddleware = async (path: string, init?: RequestInit) => {
  let nextCalled = false;
  let activeLocale = "";

  const app = new Hono();
  app.use("*", i18n());
  app.all("*", (c) => {
    nextCalled = true;
    activeLocale = getCurrentLocale();
    return c.text("ok");
  });

  const response = await app.request(path, init);

  return {
    response,
    nextCalled,
    location: response.headers.get("location"),
    activeLocale,
  };
};

/** Restores the default Vite plugin configuration (locales discovered as `["en"]`, etc.). */
function config(overrides?: Partial<typeof activeConfig>): void {
  Object.assign(activeConfig, {
    locales: ["en"],
    defaultLocale: "en",
    prefixDefaultLocale: true,
    skipPaths: ["/api", "/_"],
    translations: {},
    ...overrides,
  });
}

beforeEach(() => config());

describe("@rimelight/i18n middleware", () => {
  it("passes through API routes, internal routes, and static assets", async () => {
    expect((await runMiddleware("/api/users")).nextCalled).toBe(true);
    expect((await runMiddleware("/_assets/entry.js")).nextCalled).toBe(true);
    expect((await runMiddleware("/assets/style.css")).nextCalled).toBe(true);
  });

  it("resolves locale without redirecting on non-GET requests", async () => {
    const result = await runMiddleware("/en/login", { method: "POST" });
    expect(result.nextCalled).toBe(true);
    expect(getCurrentLocale()).toBe("en");
  });

  it("redirects unprefixed paths to the preferred locale when prefixDefaultLocale is true", async () => {
    const result = await runMiddleware("/about?page=2");
    expect(result.location).toBe("/en/about?page=2");
    expect(getCurrentLocale()).toBe("en");
  });

  it("negotiates the redirect target from the Accept-Language header", async () => {
    config({ locales: ["en", "pt"] });
    const result = await runMiddleware("/about", {
      headers: { "accept-language": "pt-BR,pt;q=0.9,en;q=0.8" },
    });
    expect(result.location).toBe("/pt/about");
  });

  it("serves locale-prefixed paths as-is, matching the prefix case-insensitively", async () => {
    for (const path of ["/en/about", "/EN/about"]) {
      const result = await runMiddleware(path);
      expect(result.nextCalled).toBe(true);
      expect(result.activeLocale).toBe("en");
    }
  });

  it("only skips real API prefixes and asset files, not api-like or dotted page paths", async () => {
    expect((await runMiddleware("/apiflow")).location).toBe("/en/apiflow");
    expect((await runMiddleware("/docs/v2.0/setup")).location).toBe("/en/docs/v2.0/setup");
  });

  it("honours a custom skipPaths list", async () => {
    expect((await runMiddleware("/internal/page")).location).toBe("/en/internal/page");
    config({ skipPaths: ["/internal"] });
    expect((await runMiddleware("/internal/page")).nextCalled).toBe(true);
  });

  it("strips the default locale prefix when prefixDefaultLocale is false", async () => {
    config({ prefixDefaultLocale: false, locales: ["en", "pt"] });

    // Redundant default-locale prefix is stripped
    const resEn = await runMiddleware("/en/about");
    expect(resEn.location).toBe("/about");

    // Non-default locale is served as-is
    const resPt = await runMiddleware("/pt/about");
    expect(resPt.nextCalled).toBe(true);
    expect(resPt.activeLocale).toBe("pt");

    // Unprefixed path resolves to the default locale
    const resUnprefixed = await runMiddleware("/about");
    expect(resUnprefixed.nextCalled).toBe(true);
    expect(resUnprefixed.activeLocale).toBe("en");
  });

  it("calls next and sets the current locale when no redirect is needed", async () => {
    const result = await runMiddleware("/en/about");
    expect(result.nextCalled).toBe(true);
    expect(result.activeLocale).toBe("en");
  });

  it("provides isolated locale to downstream handlers via AsyncLocalStorage", async () => {
    let resolvedLocale = "";

    const app = new Hono();
    app.use("*", i18n());
    app.get("/en/about", (c) => {
      resolvedLocale = getCurrentLocale();
      return c.text("ok");
    });

    await app.request("/en/about", { headers: { "accept-language": "en" } });

    expect(resolvedLocale).toBe("en");
  });

  it("serves /locales/:locale.json directly for external consumers", async () => {
    config({
      locales: ["en", "pt"],
      translations: {
        en: { greeting: "Hello" },
        pt: { greeting: "Olá" },
      },
    });

    const enRes = await runMiddleware("/locales/en.json");
    expect(enRes.nextCalled).toBe(false);
    expect(enRes.response?.status).toBe(200);
    expect(enRes.response?.headers.get("Cache-Control")).toContain("public");
    const enJson = await enRes.response?.json();
    expect(enJson).toEqual({ greeting: "Hello" });

    const missingRes = await runMiddleware("/locales/fr.json");
    expect(missingRes.nextCalled).toBe(false);
    expect(missingRes.response?.status).toBe(404);
  });
});

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { i18n } from "../src/middleware";
import { getCurrentLocale } from "../src/index";
import { createMockContext, setTranslations } from "./helpers";

function req(path: string, init?: RequestInit): Request {
  return new Request(`https://example.com${path}`, init);
}

const runMiddleware = async (path: string, init?: RequestInit) => {
  const middleware = i18n();
  let nextCalled = false;
  let activeLocale = "";
  const ctx = createMockContext(req(path, init));

  const response = await middleware(ctx as any, async () => {
    nextCalled = true;
    activeLocale = getCurrentLocale();
  });

  return {
    response,
    nextCalled,
    location: response?.headers.get("location") ?? null,
    activeLocale: activeLocale || (ctx.get("locale") ?? getCurrentLocale()),
  };
};

/** Restores the default Vite plugin configuration (locales discovered as `["en"]`, etc.). */
function config(overrides?: Parameters<typeof setTranslations>[1]): void {
  setTranslations(
    {},
    {
      locales: ["en"],
      defaultLocale: "en",
      prefixDefaultLocale: true,
      skipPaths: ["/api", "/_"],
      ...overrides,
    },
  );
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
    expect(result.activeLocale).toBe("pt");
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
    expect(resEn.activeLocale).toBe("en");

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

  it("injects locale and t into Hono Context c.set / c.get", async () => {
    const middleware = i18n();
    let injectedLocale = "";
    let injectedTranslation = "";

    const ctx = createMockContext(req("/en/about", { headers: { "accept-language": "en" } }));

    await middleware(ctx as any, async () => {
      injectedLocale = ctx.get("locale");
      const tFunc = ctx.get("t");
      injectedTranslation = typeof tFunc === "function" ? "available" : "missing";
    });

    expect(injectedLocale).toBe("en");
    expect(injectedTranslation).toBe("available");
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

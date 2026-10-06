import { describe, expect, it } from "vite-plus/test";
import { i18n, resolveLocale } from "../src/middleware";
import { createTranslationLoader } from "../src/kv";
import { currentLocale } from "../src/runtime";

function req(path: string, init?: RequestInit): Request {
  return new Request(`https://example.com${path}`, init);
}

describe("@rimelight/i18n resolveLocale (Fetch standard)", () => {
  it("passes through API routes, internal routes, and static assets", () => {
    expect(resolveLocale(req("/api/users"))).toBeNull();
    expect(resolveLocale(req("/_astro/entry.js"))).toBeNull();
    expect(resolveLocale(req("/assets/style.css"))).toBeNull();
  });

  it("resolves locale without redirecting on non-GET requests", () => {
    expect(resolveLocale(req("/en/login", { method: "POST" }))).toBeNull();
    expect(currentLocale.get()).toBe("en");
  });

  it("redirects unprefixed paths to the preferred locale when prefixDefaultLocale is true", () => {
    expect(resolveLocale(req("/about?page=2"))).toBe("/en/about?page=2");
    expect(currentLocale.get()).toBe("en");
  });

  it("negotiates the redirect target from the Accept-Language header", () => {
    const request = req("/about", {
      headers: { "accept-language": "pt-BR,pt;q=0.9,en;q=0.8" },
    });
    expect(resolveLocale(request, { locales: ["en", "pt"] })).toBe("/pt/about");
    expect(currentLocale.get()).toBe("pt");
  });

  it("serves locale-prefixed paths as-is, matching the prefix case-insensitively", () => {
    for (const path of ["/en/about", "/EN/about"]) {
      expect(resolveLocale(req(path))).toBeNull();
      expect(currentLocale.get()).toBe("en");
    }
  });

  it("strips the default locale prefix when prefixDefaultLocale is false", () => {
    const options = { prefixDefaultLocale: false, locales: ["en", "pt"] };

    // Redundant default-locale prefix is stripped
    expect(resolveLocale(req("/en/about"), options)).toBe("/about");
    expect(currentLocale.get()).toBe("en");

    // Non-default locale is served as-is
    expect(resolveLocale(req("/pt/about"), options)).toBeNull();
    expect(currentLocale.get()).toBe("pt");

    // Unprefixed path resolves to the default locale
    expect(resolveLocale(req("/about"), options)).toBeNull();
    expect(currentLocale.get()).toBe("en");
  });
});

describe("@rimelight/i18n Hono adapter", () => {
  function mockContext(path: string, env?: Record<string, any>) {
    return {
      req: { raw: req(path) },
      env: env ?? {},
      redirect: (target: string, status = 302) =>
        new Response(null, { status, headers: { Location: target } }),
    };
  }

  it("binds the KV namespace from the worker env", async () => {
    const middleware = i18n();
    const kv = { get: async () => ({ hello: "from-kv" }), put: async () => {} };

    let nextCalled = false;
    await middleware(mockContext("/en/about", { TRANSLATIONS_KV: kv }), async () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(currentLocale.get()).toBe("en");

    const loader = createTranslationLoader({ en: {} });
    expect(await loader("en", ["nav"])).toEqual({ nav: { hello: "from-kv" } });
  });

  it("short-circuits with a 302 when resolution requests a redirect", async () => {
    const middleware = i18n();

    let nextCalled = false;
    const response = await middleware(mockContext("/about?page=2"), async () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(response).toBeInstanceOf(Response);
    expect(response!.status).toBe(302);
    expect(response!.headers.get("location")).toBe("/en/about?page=2");
    expect(currentLocale.get()).toBe("en");
  });
});

import { beforeEach, describe, expect, it } from "vite-plus/test";
import { i18n } from "../src/middleware";
import { getCurrentLocale } from "../src/index";
import { setTranslations } from "./helpers";

function req(path: string, init?: RequestInit): Request {
  return new Request(`https://example.com${path}`, init);
}

function mockContext(path: string, init?: RequestInit) {
  return {
    req: { raw: req(path, init) },
    redirect: (target: string, status = 302) =>
      new Response(null, { status, headers: { Location: target } }),
  };
}

const runMiddleware = async (path: string, init?: RequestInit) => {
  const middleware = i18n();
  let nextCalled = false;
  const response = await middleware(mockContext(path, init), async () => {
    nextCalled = true;
  });
  return { response, nextCalled, location: response?.headers.get("location") ?? null };
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
    expect((await runMiddleware("/_astro/entry.js")).nextCalled).toBe(true);
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
    expect(getCurrentLocale()).toBe("pt");
  });

  it("serves locale-prefixed paths as-is, matching the prefix case-insensitively", async () => {
    for (const path of ["/en/about", "/EN/about"]) {
      const result = await runMiddleware(path);
      expect(result.nextCalled).toBe(true);
      expect(getCurrentLocale()).toBe("en");
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
    expect((await runMiddleware("/en/about")).location).toBe("/about");
    expect(getCurrentLocale()).toBe("en");

    // Non-default locale is served as-is
    expect((await runMiddleware("/pt/about")).nextCalled).toBe(true);
    expect(getCurrentLocale()).toBe("pt");

    // Unprefixed path resolves to the default locale
    expect((await runMiddleware("/about")).nextCalled).toBe(true);
    expect(getCurrentLocale()).toBe("en");
  });

  it("calls next and sets the current locale when no redirect is needed", async () => {
    const result = await runMiddleware("/en/about");
    expect(result.nextCalled).toBe(true);
    expect(getCurrentLocale()).toBe("en");
  });

  it("short-circuits with a 302 when resolution requests a redirect", async () => {
    const result = await runMiddleware("/about?page=2");
    expect(result.nextCalled).toBe(false);
    expect(result.response).toBeInstanceOf(Response);
    expect(result.response!.status).toBe(302);
    expect(result.location).toBe("/en/about?page=2");
    expect(getCurrentLocale()).toBe("en");
  });
});

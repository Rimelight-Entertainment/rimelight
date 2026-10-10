import { beforeEach, describe, expect, it } from "vite-plus/test";
import { i18n, resolveLocale } from "../src/middleware";
import { getCurrentLocale } from "../src/index";
import { setTranslations } from "./helpers";

function req(path: string, init?: RequestInit): Request {
  return new Request(`https://example.com${path}`, init);
}

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

describe("@rimelight/i18n resolveLocale (Fetch standard)", () => {
  it("passes through API routes, internal routes, and static assets", () => {
    expect(resolveLocale(req("/api/users"))).toBeNull();
    expect(resolveLocale(req("/_astro/entry.js"))).toBeNull();
    expect(resolveLocale(req("/assets/style.css"))).toBeNull();
  });

  it("resolves locale without redirecting on non-GET requests", () => {
    expect(resolveLocale(req("/en/login", { method: "POST" }))).toBeNull();
    expect(getCurrentLocale()).toBe("en");
  });

  it("redirects unprefixed paths to the preferred locale when prefixDefaultLocale is true", () => {
    expect(resolveLocale(req("/about?page=2"))).toBe("/en/about?page=2");
    expect(getCurrentLocale()).toBe("en");
  });

  it("negotiates the redirect target from the Accept-Language header", () => {
    config({ locales: ["en", "pt"] });
    const request = req("/about", {
      headers: { "accept-language": "pt-BR,pt;q=0.9,en;q=0.8" },
    });
    expect(resolveLocale(request)).toBe("/pt/about");
    expect(getCurrentLocale()).toBe("pt");
  });

  it("serves locale-prefixed paths as-is, matching the prefix case-insensitively", () => {
    for (const path of ["/en/about", "/EN/about"]) {
      expect(resolveLocale(req(path))).toBeNull();
      expect(getCurrentLocale()).toBe("en");
    }
  });

  it("only skips real API prefixes and asset files, not api-like or dotted page paths", () => {
    expect(resolveLocale(req("/apiflow"))).toBe("/en/apiflow");
    expect(resolveLocale(req("/docs/v2.0/setup"))).toBe("/en/docs/v2.0/setup");
  });

  it("honours a custom skipPaths list", () => {
    expect(resolveLocale(req("/internal/page"))).toBe("/en/internal/page");
    config({ skipPaths: ["/internal"] });
    expect(resolveLocale(req("/internal/page"))).toBeNull();
  });

  it("strips the default locale prefix when prefixDefaultLocale is false", () => {
    config({ prefixDefaultLocale: false, locales: ["en", "pt"] });

    // Redundant default-locale prefix is stripped
    expect(resolveLocale(req("/en/about"))).toBe("/about");
    expect(getCurrentLocale()).toBe("en");

    // Non-default locale is served as-is
    expect(resolveLocale(req("/pt/about"))).toBeNull();
    expect(getCurrentLocale()).toBe("pt");

    // Unprefixed path resolves to the default locale
    expect(resolveLocale(req("/about"))).toBeNull();
    expect(getCurrentLocale()).toBe("en");
  });
});

describe("@rimelight/i18n Hono adapter", () => {
  function mockContext(path: string) {
    return {
      req: { raw: req(path) },
      redirect: (target: string, status = 302) =>
        new Response(null, { status, headers: { Location: target } }),
    };
  }

  it("calls next and sets the current locale when no redirect is needed", async () => {
    const middleware = i18n();

    let nextCalled = false;
    await middleware(mockContext("/en/about"), async () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(getCurrentLocale()).toBe("en");
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
    expect(getCurrentLocale()).toBe("en");
  });
});

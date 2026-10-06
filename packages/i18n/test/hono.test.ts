import { describe, expect, it } from "vite-plus/test";
import { i18n } from "../src/hono";
import { currentLocale } from "../src/runtime";

function createMockContext(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  env?: Record<string, any>;
}) {
  let redirectedTo: string | null = null;
  let status: number | null = null;

  const c = {
    req: {
      url: options.url,
      method: options.method || "GET",
      header: (name: string) => options.headers?.[name.toLowerCase()] || null,
      param: (name: string) => options.params?.[name] || null,
    },
    env: options.env || {},
    redirect: (path: string, code: number = 302) => {
      redirectedTo = path;
      status = code;
      return { redirectedTo, status };
    },
  };

  return {
    c,
    getRedirect: () => ({ redirectedTo, status }),
  };
}

describe("@rimelight/i18n Hono edge middleware", () => {
  it("skips API routes, internal routes, and static assets", async () => {
    const middleware = i18n();
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    const { c: cApi } = createMockContext({ url: "https://example.com/api/users" });
    await middleware(cApi, next);
    expect(nextCalled).toBe(true);

    nextCalled = false;
    const { c: cAsset } = createMockContext({ url: "https://example.com/assets/style.css" });
    await middleware(cAsset, next);
    expect(nextCalled).toBe(true);
  });

  it("handles non-GET requests without redirection and sets currentLocale", async () => {
    const middleware = i18n();
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    const { c, getRedirect } = createMockContext({
      url: "https://example.com/en/login",
      method: "POST",
    });
    await middleware(c, next);

    expect(nextCalled).toBe(true);
    expect(getRedirect().redirectedTo).toBeNull();
    expect(currentLocale.get()).toBe("en");
  });

  it("binds KV when present on context env", async () => {
    const middleware = i18n();
    const mockKV = { get: async () => null, put: async () => {} };
    const next = async () => {};

    const { c } = createMockContext({
      url: "https://example.com/en/about",
      env: { TRANSLATIONS_KV: mockKV },
    });
    await middleware(c, next);

    expect(currentLocale.get()).toBe("en");
  });

  it("redirects unprefixed paths to the preferred locale when prefixDefaultLocale is true", async () => {
    const middleware = i18n();
    const next = async () => {};

    const { c, getRedirect } = createMockContext({ url: "https://example.com/about?page=2" });
    await middleware(c, next);

    expect(getRedirect()).toEqual({ redirectedTo: "/en/about?page=2", status: 302 });
    expect(currentLocale.get()).toBe("en");
  });

  it("serves locale-prefixed paths as-is, matching the prefix case-insensitively", async () => {
    const middleware = i18n();
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    for (const url of ["https://example.com/en/about", "https://example.com/EN/about"]) {
      nextCalled = false;
      const { c, getRedirect } = createMockContext({ url });
      await middleware(c, next);

      expect(getRedirect().redirectedTo).toBeNull();
      expect(nextCalled).toBe(true);
      expect(currentLocale.get()).toBe("en");
    }
  });

  it("strips the default locale prefix when prefixDefaultLocale is false", async () => {
    const middleware = i18n({ prefixDefaultLocale: false, locales: ["en", "pt"] });
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };

    // Redundant default-locale prefix is stripped
    const { c: cDefault, getRedirect: redirectDefault } = createMockContext({
      url: "https://example.com/en/about",
    });
    await middleware(cDefault, next);
    expect(redirectDefault()).toEqual({ redirectedTo: "/about", status: 302 });

    // Non-default locale is served as-is
    nextCalled = false;
    const { c: cPt, getRedirect: redirectPt } = createMockContext({
      url: "https://example.com/pt/about",
    });
    await middleware(cPt, next);
    expect(redirectPt().redirectedTo).toBeNull();
    expect(nextCalled).toBe(true);
    expect(currentLocale.get()).toBe("pt");

    // Unprefixed path resolves to the default locale
    nextCalled = false;
    const { c: cBare, getRedirect: redirectBare } = createMockContext({
      url: "https://example.com/about",
    });
    await middleware(cBare, next);
    expect(redirectBare().redirectedTo).toBeNull();
    expect(nextCalled).toBe(true);
    expect(currentLocale.get()).toBe("en");
  });
});

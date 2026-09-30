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
});

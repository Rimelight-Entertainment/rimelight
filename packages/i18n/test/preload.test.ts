import { Hono } from "hono";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";

/**
 * Node has no `HTMLRewriter` (Workers do). This double does what the middleware uses: appends to each
 * `<head>` before its closing tag.
 */
class HTMLRewriterDouble {
  private handlers: Array<
    [string, { element: (head: { append: (html: string) => void }) => void }]
  > = [];

  on(selector: string, handler: (typeof this.handlers)[number][1]) {
    this.handlers.push([selector, handler]);
    return this;
  }

  transform(res: Response): Response {
    const handlers = this.handlers;
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let out = await res.text();
        for (const [selector, handler] of handlers) {
          if (selector !== "head") continue;
          let appended = "";
          handler.element({ append: (s) => void (appended += s) });
          out = out.replace("</head>", appended + "</head>");
        }
        controller.enqueue(new TextEncoder().encode(out));
        controller.close();
      },
    });
    return new Response(body, { status: res.status, headers: res.headers });
  }
}

beforeAll(() => {
  (globalThis as { HTMLRewriter?: unknown }).HTMLRewriter = HTMLRewriterDouble;
});

afterAll(() => {
  delete (globalThis as { HTMLRewriter?: unknown }).HTMLRewriter;
});

vi.mock("virtual:rimelight-i18n", () => {
  const loader = () => Promise.resolve({ default: {} });
  return {
    config: {
      locales: ["en", "pt"],
      defaultLocale: "en",
      prefixDefaultLocale: true,
      skipPaths: ["/api", "/_"],
      translations: { en: {}, pt: {} },
      routeBuckets: { "[locale]/index": ["page.home"] },
      globalBuckets: ["common"],
      namespaces: {
        common: { en: loader, pt: loader },
        "page.home": { en: loader, pt: loader },
      },
      patterns: [["[locale]/index", /^\/[^/]+\/?$/]],
      loaded: new Set(),
    },
  };
});

const HTML = "<!DOCTYPE html><html><head><title>x</title></head><body>hi</body></html>";

/** A fresh middleware instance (its manifest cache is per isolate), serving `html` for every request. */
const render = async (
  env: unknown,
  { html = HTML, contentType = "text/html; charset=utf-8", devServer = false } = {},
) => {
  vi.resetModules();
  const { i18n } = await import("../src/middleware");
  const { activeConfig } = await import("../src/runtime");
  activeConfig.devServer = devServer;
  const app = new Hono();
  app.use("*", i18n());
  app.all("*", () => new Response(html, { headers: { "content-type": contentType } }));
  return (path: string) => app.request(path, undefined, env as never);
};

/** A fake `ASSETS` binding serving a client manifest. */
const assets = (manifest: Record<string, { file: string }>) => {
  const fetch = vi.fn(async () => new Response(JSON.stringify(manifest)));
  return { ASSETS: { fetch } };
};

const manifest = {
  "virtual:rimelight-i18n-ns/common/en": { file: "assets/common-en.js" },
  "virtual:rimelight-i18n-ns/common/pt": { file: "assets/common-pt.js" },
  "virtual:rimelight-i18n-ns/page.home/en": { file: "assets/home-en.js" },
  "virtual:rimelight-i18n-ns/page.home/pt": { file: "assets/home-pt.js" },
  "src/App.tsx": { file: "assets/App.js" },
};

describe("namespace preload", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.resetModules());

  it("adds modulepreload for every chunk of the page, from the build manifest", async () => {
    const request = await render(assets(manifest));
    const html = await (await request("/pt/")).text();
    for (const href of [
      "/assets/common-en.js",
      "/assets/common-pt.js",
      "/assets/home-en.js",
      "/assets/home-pt.js",
    ]) {
      expect(html).toContain(`<link rel="modulepreload" href="${href}" crossorigin>`);
    }
    // Inserted into the head, before its closing tag, and nothing else.
    expect(html).toContain("crossorigin></head>");
    expect(html).not.toContain("App.js");
  });

  it("reads the manifest once per isolate", async () => {
    const env = assets(manifest);
    const request = await render(env);
    await request("/pt/");
    await request("/en/");
    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
  });

  it("uses Vite's /@id URLs in dev, where there is no build manifest", async () => {
    const request = await render(undefined, { devServer: true });
    const html = await (await request("/pt/")).text();
    expect(html).toContain(
      '<link rel="modulepreload" href="/@id/__x00__virtual:rimelight-i18n-ns/page.home/pt" crossorigin>',
    );
  });

  it("leaves non-HTML responses untouched", async () => {
    const request = await render(assets(manifest), {
      html: '{"ok":true}',
      contentType: "application/json",
    });
    expect(await (await request("/pt/")).text()).toBe('{"ok":true}');
  });

  it("returns the page unchanged when no chunk resolves", async () => {
    const request = await render(assets({}));
    expect(await (await request("/pt/")).text()).toBe(HTML);
  });
});

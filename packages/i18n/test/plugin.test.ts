import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { i18n } from "../src/plugin";

const VIRTUAL_ID = "virtual:rimelight-i18n";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

/** Invoke a Vite object-hook the way the container does (function or { handler }), with a resolver that finds nothing. */
async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  const ctx = { resolve: async () => null };
  return (await (fn as (...a: any[]) => unknown).call(ctx, ...args)) as T;
}

/** A project root with the given locale files under `src/i18n`, and optional extra files. */
const project = (locales: Record<string, unknown>, files: Record<string, string> = {}): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-"));
  fs.mkdirSync(path.join(root, "src/i18n"), { recursive: true });
  for (const [locale, dict] of Object.entries(locales)) {
    fs.writeFileSync(path.join(root, "src/i18n", `${locale}.json`), JSON.stringify(dict));
  }
  for (const [file, source] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), source);
  }
  return root;
};

/** Plugin set up against a root, with the build-start step already run. */
const started = async (plugin: Plugin, root: string): Promise<void> => {
  await callHook(plugin.configResolved, { root });
  await callHook(plugin.buildStart);
};

describe("@rimelight/i18n Vite virtual module plugin", () => {
  it("resolves virtual module IDs", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, "some-other-id")).toBeFalsy();
  });

  it("client config starts with empty dictionaries and one loader per namespace and locale", async () => {
    const root = project({
      en: { page: { home: { title: "Home" } } },
      pt: { page: { home: { title: "Início" } } },
    });
    try {
      const plugin: Plugin = i18n();
      await started(plugin, root);
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(code).toContain('translations: {"en":{},"pt":{}}');
      expect(code).toContain(
        '"page.home": { "en": () => import("virtual:rimelight-i18n-ns/page.home/en")',
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("emits a fallback loader only for the keys a locale lacks", async () => {
    const root = project({
      en: { page: { home: { title: "Home", subtitle: "Sub" } }, error: { retry: "Retry" } },
      pt: { page: { home: { title: "Início" } }, error: { retry: "Tentar" } },
    });
    try {
      const plugin: Plugin = i18n();
      await started(plugin, root);
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(code).toContain(
        '"page.home": { "pt": () => import("virtual:rimelight-i18n-ns/page.home/pt/fallback")',
      );
      // pt has every error key, so it has no error fallback.
      expect(code).not.toContain("error/pt/fallback");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("server config starts empty and loads each namespace on demand, like the client", async () => {
    const root = project({ en: { hi: "Hi" }, pt: { hi: "Oi" } });
    try {
      const plugin: Plugin = i18n();
      await started(plugin, root);
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID, { ssr: true })) as string;
      expect(code).toContain('translations: {"en":{},"pt":{}}');
      expect(code).toContain("namespaces:");
      expect(code).not.toContain("const merge");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("maps each route to the namespaces its file uses, and matches its URL", async () => {
    const root = project(
      { en: { page: { home: { title: "Home" } }, error: { retry: "Retry" } } },
      { "src/routes/[locale]/(app)/index.tsx": 'export default () => t("page.home.title");\n' },
    );
    try {
      const plugin: Plugin = i18n();
      await started(plugin, root);
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(code).toContain('"[locale]/(app)/index":["page.home"]');
      expect(code).toContain('new RegExp("^/[^/]+/?$")');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("passes the config through and honours the dir option", async () => {
    const root = project({ en: { hi: "Hi" } });
    try {
      const plugin: Plugin = i18n({
        dir: "src/i18n",
        defaultLocale: "en",
        prefixDefaultLocale: false,
      });
      await started(plugin, root);
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(code).toContain(
        'export const config = { ...{"defaultLocale":"en","prefixDefaultLocale":false}',
      );
      expect(code).toContain('"hi": { "en": () => import("virtual:rimelight-i18n-ns/hi/en")');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("loads given translations on the server through their namespace loaders", async () => {
    const plugin: Plugin = i18n({ locales: ["en"], translations: { en: { hello: "Hello" } } });
    await started(plugin, project({}));
    const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID, { ssr: true })) as string;
    expect(code).toContain('translations: {"en":{}}');
    expect(code).toContain('"hello": { "en": () => import(');
  });

  it("writes typed keys to the explicit path, and regenerates on change", async () => {
    const root = project({ en: { nav: { home: "Home" } } });
    try {
      const enFile = path.join(root, "src/i18n/en.json");
      const keysFile = path.join(root, ".cloudflare/types/i18n.d.ts");

      const plugin: Plugin = i18n({ types: ".cloudflare/types/i18n.d.ts" });
      await started(plugin, root);
      expect(fs.readFileSync(keysFile, "utf-8")).toContain('"nav.home": never;');

      fs.writeFileSync(enFile, JSON.stringify({ nav: { home: "Home", about: "About" } }));
      await callHook(plugin.watchChange, enFile, { event: "update" });
      expect(fs.readFileSync(keysFile, "utf-8")).toContain('"nav.about": never;');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("defaults to node_modules, and writes nothing when disabled", async () => {
    const root = project({ en: { hi: "Hi" } });
    try {
      const defaults = i18n();
      await started(defaults, root);
      expect(fs.existsSync(path.join(root, "node_modules/.rimelight/types/i18n.d.ts"))).toBe(true);

      const disabled = i18n({ types: false });
      await started(disabled, root);
      expect(fs.existsSync(path.join(root, "explicit.d.ts"))).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps nested namespaces out of their parent's chunk", async () => {
    const root = project({
      en: { page: { title: "Pages", home: { title: "Home" } }, common: { save: "Save" } },
    });
    try {
      const plugin: Plugin = i18n();
      await started(plugin, root);
      const load = (id: string) => callHook<string>(plugin.load, `\0${VIRTUAL_ID}-ns/${id}`);
      expect(await load("page/en")).toBe('export default {"page":{"title":"Pages"}};');
      expect(await load("page.home/en")).toBe('export default {"page":{"home":{"title":"Home"}}};');
      expect(await load("common/en")).toBe('export default {"common":{"save":"Save"}};');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  describe("client loader", () => {
    // pt lacks two of en's keys, so its URLs need a fallback chunk for each bucket those keys sit in.
    const locales = {
      en: {
        page: { home: { title: "Home", subtitle: "Subtitle" } },
        common: { save: "Save", cancel: "Cancel" },
        error: { retry: "Retry" },
      },
      pt: {
        page: { home: { title: "Início" } },
        common: { save: "Salvar" },
        error: { retry: "Tentar novamente" },
      },
    };
    const routes = {
      "src/App.tsx": 't("common.save");\n',
      "src/routes/[locale]/index.tsx": 't("page.home.title");\n',
      "src/routes/[locale]/404.tsx": 't("error.retry");\n',
    };
    const ptFull = {
      page: { home: { title: "Início", subtitle: "Subtitle" } },
      common: { save: "Salvar", cancel: "Cancel" },
      error: { retry: "Tentar novamente" },
    };

    let root = "";
    let plugin: Plugin;

    beforeEach(async () => {
      root = project(locales, routes);
      plugin = i18n();
      await started(plugin, root);
    });

    afterEach(() => {
      fs.rmSync(root, { recursive: true, force: true });
      vi.doUnmock("virtual:rimelight-i18n");
      vi.resetModules();
    });

    /** A chunk as the browser would fetch it: the plugin's own output for that id, evaluated. */
    const serve = async (id: string): Promise<{ default: Record<string, unknown> }> => {
      const code = await callHook<string>(plugin.load, `\0${VIRTUAL_ID}-ns/${id}`);
      return { default: JSON.parse(code.replace(/^export default /, "").replace(/;$/, "")) };
    };

    /**
     * Imports the real runtime against the generated client config. Chunk imports go to `fetchChunk`,
     * and no `window` exists, so the boot load is skipped and each test drives `loadPathname` itself.
     */
    const client = async (fetchChunk: (id: string) => Promise<unknown> = serve) => {
      const code = await callHook<string>(plugin.load, RESOLVED_VIRTUAL_ID);
      const body = code
        .replace(/import\("virtual:rimelight-i18n-ns\/([^"]+)"\)/g, 'fetchChunk("$1")')
        .replace("export const config = ", "const config = ");
      // The generated config is code, not data: evaluate it as the browser would run it.
      // oxlint-disable-next-line typescript/no-implied-eval
      const config = new Function("fetchChunk", `${body}\nreturn config;`)(fetchChunk);
      vi.doMock("virtual:rimelight-i18n", () => ({ config }));
      vi.resetModules();
      return await import("../src/runtime");
    };

    it("loads only the URL's own chunks; other locales wait for loadLocale", async () => {
      const requested: string[] = [];
      const runtime = await client(async (id) => (requested.push(id), serve(id)));
      await runtime.loadPathname("/en/");
      expect(requested.toSorted()).toEqual(["common/en", "page.home/en"]);
      expect(runtime.activeConfig.translations["pt"]).toEqual({});

      // Every namespace of the locale, with its fallbacks: the full dictionary.
      await runtime.loadLocale("pt");
      expect(runtime.activeConfig.translations["pt"]).toEqual(ptFull);
    });

    it("requests the URL's chunks at once, in its locale only: no waterfall, no default-locale fetch", async () => {
      const requested: string[] = [];
      const pending: Array<() => void> = [];
      const runtime = await client(
        (id) =>
          new Promise((resolve) => {
            requested.push(id);
            pending.push(() => resolve(serve(id)));
          }),
      );
      expect(runtime.isPathnameLoaded("/pt/")).toBe(false);
      const done = runtime.loadPathname("/pt/");
      // All four were requested before any arrived.
      expect(requested.toSorted()).toEqual([
        "common/pt",
        "common/pt/fallback",
        "page.home/pt",
        "page.home/pt/fallback",
      ]);
      for (const release of pending) release();
      await done;
      expect(runtime.isPathnameLoaded("/pt/")).toBe(true);
      expect(runtime.activeConfig.translations["pt"]).toEqual({
        page: { home: ptFull.page.home },
        common: ptFull.common,
      });
      expect(runtime.activeConfig.translations["en"]).toEqual({});
    });

    it("takes a server payload in without fetching, and renders the same translations", async () => {
      // The server loads the URL and serializes its payload; the client applies it on hydration.
      const server = await client(serve);
      await server.loadPathname("/pt/");
      const payload = JSON.parse(JSON.stringify(server.payloadOf("/pt/")));

      const requested: string[] = [];
      const runtime = await client(async (id) => (requested.push(id), serve(id)));
      expect(runtime.isPathnameLoaded("/pt/")).toBe(false);
      runtime.applyPayload(payload);
      expect(runtime.isPathnameLoaded("/pt/")).toBe(true);
      expect(requested).toEqual([]);
      expect(runtime.activeConfig.translations["pt"]).toEqual({
        page: { home: ptFull.page.home },
        common: ptFull.common,
      });
    });

    it("falls back to 404 route buckets when no route pattern matches", async () => {
      const requested: string[] = [];
      const runtime = await client(async (id) => (requested.push(id), serve(id)));
      expect(runtime.isPathnameLoaded("/en/unknown/page")).toBe(false);
      await runtime.loadPathname("/en/unknown/page");
      expect(runtime.isPathnameLoaded("/en/unknown/page")).toBe(true);
      expect(runtime.activeConfig.translations["en"]).toEqual({
        common: locales.en.common,
        error: locales.en.error,
      });
    });

    it("fetches a chunk only once across URLs", async () => {
      const requested: string[] = [];
      const runtime = await client(async (id) => (requested.push(id), serve(id)));
      await runtime.loadPathname("/en/");
      await runtime.loadPathname("/en");
      expect(requested).toHaveLength(2);
    });

    it("matches the locale segment without case", async () => {
      const runtime = await client(serve);
      await runtime.loadPathname("/PT/");
      expect(runtime.activeConfig.translations["pt"]).toEqual({
        page: { home: ptFull.page.home },
        common: ptFull.common,
      });
    });

    it("rejects when a chunk fails, and retries it on the next load", async () => {
      let fail = true;
      const runtime = await client(async (id) => {
        if (fail && id === "common/en") throw new Error("offline");
        return serve(id);
      });
      await expect(runtime.loadPathname("/en/")).rejects.toThrow("offline");
      expect(runtime.isPathnameLoaded("/en/")).toBe(false);
      fail = false;
      await runtime.loadPathname("/en/");
      expect(runtime.isPathnameLoaded("/en/")).toBe(true);
    });
  });

  describe("watching files", () => {
    it("re-analyses routes after a route-reachable file changes, and ignores others", async () => {
      const root = project(
        { en: { common: { save: "Save" }, error: { retry: "Retry" } } },
        {
          "src/routes/index.tsx": 't("common.save");\n',
          "src/unused.tsx": 't("error.retry");\n',
        },
      );
      try {
        const plugin: Plugin = i18n();
        await started(plugin, root);
        const config = () => callHook<string>(plugin.load, RESOLVED_VIRTUAL_ID);
        expect(await config()).toContain('"index":["common"]');

        const route = path.join(root, "src/routes/index.tsx");
        fs.writeFileSync(route, 't("error.retry");\n');
        await callHook(plugin.watchChange, route, { event: "update" });
        expect(await config()).toContain('"index":["error"]');

        // Not reachable from any route, so the cached analysis stands.
        const unused = path.join(root, "src/unused.tsx");
        fs.writeFileSync(route, 't("common.save");\n');
        await callHook(plugin.watchChange, unused, { event: "update" });
        expect(await config()).toContain('"index":["error"]');
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    });
  });

  it("returns undefined for unknown module IDs in load", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.load, "some-other-id")).toBeUndefined();
  });
});

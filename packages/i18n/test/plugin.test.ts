import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { i18n } from "../src/plugin";
import { createPathnameLoader, type VirtualI18nConfig } from "../src/runtime";

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
    const locales = {
      en: {
        page: { home: { title: "Home" } },
        common: { save: "Save" },
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

    /**
     * Runs the generated client config with `fetch` standing in for the namespace imports, and no
     * `window`, so the boot load is skipped and each test drives `loadPathname` itself.
     */
    const client = async (fetch: (id: string) => Promise<unknown>) => {
      const root = project(locales, routes);
      const plugin: Plugin = i18n();
      await started(plugin, root);
      const code = await callHook<string>(plugin.load, RESOLVED_VIRTUAL_ID);
      fs.rmSync(root, { recursive: true, force: true });
      const body = `${code
        .replace(/import\(("[^"]+")\)/g, "fetch($1)")
        .replace(/export const /g, "const ")}\nreturn config;`;
      const AsyncFunction = (async () => {}).constructor as new (
        ...args: string[]
      ) => (...a: unknown[]) => Promise<VirtualI18nConfig>;
      const config = await new AsyncFunction("fetch", "window", body)(fetch, undefined);
      return { config, ...createPathnameLoader(config) };
    };
    const chunk = (id: string) => {
      const [bucket, locale] = id.slice(`${VIRTUAL_ID}-ns/`.length).split("/") as [string, string];
      const dict = locales[locale as "en"];
      const top = bucket.split(".")[0] as "page";
      return { default: bucket === "page.home" ? { page: dict.page } : { [top]: dict[top] } };
    };

    it("loads only the URL's locale and the default; other locales wait for loadLocale", async () => {
      const requested: string[] = [];
      const { config, loadPathname, loadLocale } = await client(
        async (id) => (requested.push(id), chunk(id)),
      );
      await loadPathname("/en/");
      expect(config.translations?.["pt"]).toEqual({});
      expect(requested.some((id) => id.endsWith("/pt"))).toBe(false);

      // Every namespace of the locale, not only this route's.
      await loadLocale("pt");
      expect(config.translations?.["pt"]).toMatchObject({
        page: locales.pt.page,
        common: locales.pt.common,
      });
    });

    it("requests every chunk of a URL at once, in its locale and the default one", async () => {
      const requested: string[] = [];
      const pending: Array<() => void> = [];
      const { config, loadPathname, isPathnameLoaded } = await client(
        (id) =>
          new Promise((resolve) => {
            requested.push(id);
            pending.push(() => resolve(chunk(id)));
          }),
      );
      expect(isPathnameLoaded("/pt/")).toBe(false);
      const done = loadPathname("/pt/");
      // All four were requested before any arrived: no waterfall.
      expect(
        requested.map((id) => id.split("-ns/")[1]!).toSorted((a, b) => a.localeCompare(b)),
      ).toEqual(["common/en", "common/pt", "page.home/en", "page.home/pt"]);
      for (const release of pending) release();
      await done;
      expect(isPathnameLoaded("/pt/")).toBe(true);
      expect(config.translations?.["pt"]).toEqual({
        page: locales.pt.page,
        common: locales.pt.common,
      });
      expect(config.translations?.["en"]).toEqual({
        page: locales.en.page,
        common: locales.en.common,
      });
    });

    it("falls back to 404 route buckets when no route pattern matches", async () => {
      const requested: string[] = [];
      const { config, loadPathname, isPathnameLoaded } = await client(
        async (id) => (requested.push(id), chunk(id)),
      );
      expect(isPathnameLoaded("/en/unknown/page")).toBe(false);
      await loadPathname("/en/unknown/page");
      expect(isPathnameLoaded("/en/unknown/page")).toBe(true);
      expect(config.translations?.["en"]).toEqual({
        common: locales.en.common,
        error: locales.en.error,
      });
    });

    it("fetches a chunk only once across URLs", async () => {
      const requested: string[] = [];
      const { loadPathname } = await client(async (id) => (requested.push(id), chunk(id)));
      await loadPathname("/en/");
      await loadPathname("/en");
      expect(requested).toHaveLength(2);
    });

    it("matches the locale segment without case", async () => {
      const { config, loadPathname } = await client(async (id) => chunk(id));
      await loadPathname("/PT/");
      expect(config.translations?.["pt"]).toEqual({
        page: locales.pt.page,
        common: locales.pt.common,
      });
    });

    it("rejects when a chunk fails, and retries it on the next load", async () => {
      let fail = true;
      const { loadPathname, isPathnameLoaded } = await client(async (id) => {
        if (fail && id.endsWith("common/en")) throw new Error("offline");
        return chunk(id);
      });
      await expect(loadPathname("/en/")).rejects.toThrow("offline");
      expect(isPathnameLoaded("/en/")).toBe(false);
      fail = false;
      await loadPathname("/en/");
      expect(isPathnameLoaded("/en/")).toBe(true);
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

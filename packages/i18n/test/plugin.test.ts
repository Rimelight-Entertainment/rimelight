import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { i18n } from "../src/plugin";

const VIRTUAL_ID = "virtual:rimelight-i18n";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const VIRTUAL_SERVER_ID = "virtual:rimelight-i18n/server";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/**
 * Invoke a Vite object-hook the way the container does (function or { handler }).
 */
async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(undefined, ...args)) as T;
}

/** Invoke a hook with an explicit `this` (required by the Vite `hotUpdate` hook). */
async function callHookWithThis<T>(hook: unknown, thisArg: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(thisArg, ...args)) as T;
}

/** Minimal Vite dev-server stand-in for exercising the HMR hooks. */
function makeDevServer() {
  const invalidated: string[] = [];
  const sent: unknown[] = [];
  const makeGraph = () => ({
    moduleGraph: {
      getModuleById: (id: string) => ({ id }),
      invalidateModule: (mod: { id: string }) => invalidated.push(mod.id),
    },
  });
  return {
    server: {
      environments: { client: makeGraph(), ssr: makeGraph() },
      ws: { send: (payload: unknown) => sent.push(payload) },
    },
    invalidated,
    sent,
  };
}

describe("@rimelight/i18n Vite virtual module plugin", () => {
  it("resolves virtual module IDs", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, VIRTUAL_SERVER_ID)).toBe(RESOLVED_VIRTUAL_SERVER_ID);
    expect(await callHook(plugin.resolveId, "some-other-id")).toBeNull();
  });

  it("loads virtual config and server translations in-memory with inferred locales", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-virtual-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ nav: { home: "Home" } }));
    fs.writeFileSync(path.join(i18nDir, "pt-BR.json"), JSON.stringify({ nav: { home: "Início" } }));
    fs.writeFileSync(path.join(i18nDir, "es.json"), JSON.stringify({ nav: { home: "Inicio" } }));

    try {
      const plugin: Plugin = i18n({
        defaultLocale: "en",
        prefixDefaultLocale: false,
        translationsDir: i18nDir,
      });

      await callHook(plugin.configResolved, { root: tmpDir });

      const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(configCode).toContain(`"locales":["en","es","pt-BR"]`);
      expect(configCode).toContain(`"defaultLocale":"en"`);
      expect(configCode).toContain(`"prefixDefaultLocale":false`);
      expect(configCode).not.toContain(`"Início"`);

      const serverCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_SERVER_ID)) as string;
      expect(serverCode).toContain(`"Início"`);
      expect(serverCode).toContain(`"nav.home":"Home"`);

      // Verify no physical top-level .rimelight directory was written to disk!
      expect(fs.existsSync(path.join(tmpDir, ".rimelight"))).toBe(false);
      // Verify types were emitted into node_modules/.rimelight
      expect(
        fs.existsSync(path.join(tmpDir, "node_modules", ".rimelight", "i18n", "keys.d.ts")),
      ).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles default options when none are passed", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-default-"));
    try {
      const plugin: Plugin = i18n();
      await callHook(plugin.configResolved, { root: tmpDir });

      const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(configCode).toContain(`"defaultLocale":"en"`);
      expect(configCode).toContain(`"locales":[]`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates static JSON assets on generateBundle", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-static-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });
    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ nav: { home: "Home" } }));
    fs.writeFileSync(path.join(i18nDir, "pt.json"), JSON.stringify({ nav: { home: "Início" } }));

    try {
      const plugin: Plugin = i18n({
        translationsDir: i18nDir,
      });
      await callHook(plugin.configResolved, { root: tmpDir });

      const emitted: any[] = [];
      const hook =
        typeof plugin.generateBundle === "function"
          ? plugin.generateBundle
          : (plugin.generateBundle as any)?.handler;

      await hook.call({
        emitFile: (asset: any) => emitted.push(asset),
      });

      expect(emitted).toEqual([
        {
          type: "asset",
          fileName: "locales/en.json",
          source: JSON.stringify(
            {
              "nav.home": "Home",
            },
            null,
            2,
          ),
        },
        {
          type: "asset",
          fileName: "locales/pt.json",
          source: JSON.stringify(
            {
              "nav.home": "Início",
            },
            null,
            2,
          ),
        },
      ]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("defaults to 'en' when 'en' is present, and to the first locale when 'en' is absent", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-fallback-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    fs.writeFileSync(path.join(i18nDir, "pt.json"), JSON.stringify({ a: { b: "1" } }));
    fs.writeFileSync(path.join(i18nDir, "ro.json"), JSON.stringify({ a: { b: "2" } }));

    try {
      const pluginA: Plugin = i18n({
        translationsDir: i18nDir,
      });
      await callHook(pluginA.configResolved, { root: tmpDir });
      const configA = (await callHook(pluginA.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(configA).toContain(`"defaultLocale":"pt"`);

      // Now add "en.json"
      fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ a: { b: "0" } }));
      const pluginB: Plugin = i18n({
        translationsDir: i18nDir,
      });
      await callHook(pluginB.configResolved, { root: tmpDir });
      const configB = (await callHook(pluginB.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(configB).toContain(`"defaultLocale":"en"`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates type declarations on configResolved and updates them on hotUpdate", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-types-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    const enPath = path.join(i18nDir, "en.json");
    fs.writeFileSync(enPath, JSON.stringify({ hero: { title: "Title" } }));

    const typesPath = "node_modules/.rimelight/i18n/keys.d.ts";
    const fullTypesPath = path.join(tmpDir, typesPath);

    try {
      const plugin: Plugin = i18n({
        translationsDir: i18nDir,
      });

      await callHook(plugin.configResolved, { root: tmpDir });

      expect(fs.existsSync(fullTypesPath)).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, ".rimelight"))).toBe(false);
      let dts = fs.readFileSync(fullTypesPath, "utf-8");
      expect(dts).toContain('"hero.title"');

      // Update en.json and trigger the client environment's hotUpdate
      fs.writeFileSync(enPath, JSON.stringify({ hero: { title: "Title", subtitle: "Subtitle" } }));

      const { server, invalidated, sent } = makeDevServer();
      const ret = await callHookWithThis(
        plugin.hotUpdate,
        { environment: { name: "client" } },
        {
          file: enPath,
          server,
          type: "update",
          timestamp: 1,
          modules: [],
          read: async () => fs.readFileSync(enPath, "utf-8"),
        },
      );

      dts = fs.readFileSync(fullTypesPath, "utf-8");
      expect(dts).toContain('"hero.subtitle" | "hero.title"');

      // Both virtual modules are invalidated in every environment, and the
      // browser is told to fully reload so SSR re-renders fresh translations.
      expect(new Set(invalidated)).toEqual(
        new Set([RESOLVED_VIRTUAL_ID, RESOLVED_VIRTUAL_SERVER_ID]),
      );
      expect(sent).toEqual([{ type: "full-reload" }]);
      expect(ret).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("ignores JSON files outside the translations directory on hotUpdate", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-filter-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });
    const enPath = path.join(i18nDir, "en.json");
    fs.writeFileSync(enPath, JSON.stringify({ hero: { title: "Title" } }));
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "root" }));

    try {
      const plugin: Plugin = i18n({ translationsDir: i18nDir });
      await callHook(plugin.configResolved, { root: tmpDir });

      const { server, invalidated, sent } = makeDevServer();
      const opts = (file: string) => ({
        file,
        server,
        type: "update",
        timestamp: 1,
        modules: [],
        read: async () => fs.readFileSync(file, "utf-8"),
      });

      // Root package.json (not under translationsDir) and a non-json file in
      // the dir must not reset translations, invalidate modules, or reload.
      const retOutside = await callHookWithThis(
        plugin.hotUpdate,
        { environment: { name: "client" } },
        opts(path.join(tmpDir, "package.json")),
      );
      const retNonJson = await callHookWithThis(
        plugin.hotUpdate,
        { environment: { name: "client" } },
        opts(path.join(i18nDir, "notes.txt")),
      );

      expect(retOutside).toBeUndefined();
      expect(retNonJson).toBeUndefined();
      expect(invalidated).toEqual([]);
      expect(sent).toEqual([]);

      // A translation file change still invalidates and reloads.
      fs.writeFileSync(enPath, JSON.stringify({ hero: { title: "Title", subtitle: "Subtitle" } }));
      await callHookWithThis(plugin.hotUpdate, { environment: { name: "client" } }, opts(enPath));
      expect(sent).toEqual([{ type: "full-reload" }]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("only acts on the client environment in hotUpdate", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-env-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });
    const enPath = path.join(i18nDir, "en.json");
    fs.writeFileSync(enPath, JSON.stringify({ hero: { title: "Title" } }));

    try {
      const plugin: Plugin = i18n({ translationsDir: i18nDir });
      await callHook(plugin.configResolved, { root: tmpDir });

      const { server, invalidated, sent } = makeDevServer();
      await callHookWithThis(
        plugin.hotUpdate,
        { environment: { name: "ssr" } },
        {
          file: enPath,
          server,
          type: "update",
          timestamp: 1,
          modules: [],
          read: async () => fs.readFileSync(enPath, "utf-8"),
        },
      );

      expect(invalidated).toEqual([]);
      expect(sent).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("respects types: false to disable declaration emission", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-no-types-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });
    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ key: "val" }));

    try {
      const plugin: Plugin = i18n({
        translationsDir: i18nDir,
        types: false,
      });

      await callHook(plugin.configResolved, { root: tmpDir });
      expect(fs.existsSync(path.join(tmpDir, ".rimelight"))).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

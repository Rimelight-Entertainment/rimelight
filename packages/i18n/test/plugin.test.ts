import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { i18n } from "../src/plugin";

const VIRTUAL_ID = "virtual:rimelight-i18n";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

/**
 * Invoke a Vite object-hook the way the container does (function or { handler }).
 */
async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(undefined, ...args)) as T;
}

/** A project root with the given locale files under `src/i18n`. */
const project = (locales: Record<string, unknown>): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-"));
  fs.mkdirSync(path.join(root, "src/i18n"), { recursive: true });
  for (const [locale, dict] of Object.entries(locales)) {
    fs.writeFileSync(path.join(root, "src/i18n", `${locale}.json`), JSON.stringify(dict));
  }
  return root;
};

describe("@rimelight/i18n Vite virtual module plugin", () => {
  it("resolves virtual module IDs", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, "some-other-id")).toBeFalsy();
  });

  it("imports one module per locale file, keyed by locale code", async () => {
    const root = project({ en: { hi: "Hi" }, pt: { hi: "Oi" } });
    try {
      const plugin: Plugin = i18n();
      await callHook(plugin.configResolved, { root });
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(code).toBe(
        [
          'import locale0 from "/src/i18n/en.json";',
          'import locale1 from "/src/i18n/pt.json";',
          'export const config = { ...{}, translations: { "en": locale0, "pt": locale1 } };',
        ].join("\n"),
      );
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
      await callHook(plugin.configResolved, { root });
      const code = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
      expect(code).toContain(
        'export const config = { ...{"defaultLocale":"en","prefixDefaultLocale":false}',
      );
      expect(code).toContain('"en": locale0');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("inlines given translations exactly once", async () => {
    const plugin: Plugin = i18n({
      locales: ["en"],
      translations: { en: { hello: "Hello" } },
    });
    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toBe(
      'export const config = { ...{"locales":["en"]}, translations: {"en":{"hello":"Hello"}} };',
    );
  });

  it("writes typed keys to the explicit path, and regenerates on change", async () => {
    const root = project({ en: { nav: { home: "Home" } } });
    try {
      const enFile = path.join(root, "src/i18n/en.json");
      const keysFile = path.join(root, ".cloudflare/types/i18n.d.ts");

      const plugin: Plugin = i18n({ types: ".cloudflare/types/i18n.d.ts" });
      await callHook(plugin.configResolved, { root });
      await callHook(plugin.buildStart);
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
      await callHook(defaults.configResolved, { root });
      await callHook(defaults.buildStart);
      expect(fs.existsSync(path.join(root, "node_modules/.rimelight/types/i18n.d.ts"))).toBe(true);

      const disabled = i18n({ types: false, dir: "src/i18n" });
      await callHook(disabled.configResolved, { root });
      await callHook(disabled.buildStart);
      expect(fs.existsSync(path.join(root, "explicit.d.ts"))).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("returns undefined for unknown module IDs in load", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.load, "some-other-id")).toBeUndefined();
  });
});

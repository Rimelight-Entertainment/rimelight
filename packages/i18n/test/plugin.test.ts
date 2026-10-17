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

describe("@rimelight/i18n Vite virtual module plugin", () => {
  it("resolves virtual module IDs", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, "some-other-id")).toBeFalsy();
  });

  it("loads virtual config options matching seo/auth/cms plugins", async () => {
    const plugin: Plugin = i18n({
      defaultLocale: "en",
      locales: ["en", "es", "pt"],
      prefixDefaultLocale: false,
    });

    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toBe(
      `export const config = ${JSON.stringify({
        defaultLocale: "en",
        locales: ["en", "es", "pt"],
        prefixDefaultLocale: false,
      })};`,
    );
  });

  it("handles default options when none are passed", async () => {
    const plugin: Plugin = i18n();
    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toBe("export const config = {};");
  });

  it("returns undefined for unknown module IDs in load", async () => {
    const plugin: Plugin = i18n();
    expect(await callHook(plugin.load, "some-other-id")).toBeUndefined();
  });
});

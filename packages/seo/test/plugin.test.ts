import { describe, it, expect } from "vite-plus/test";
import { seo } from "../src/plugin";

const VIRTUAL_ID = "virtual:rimelight-seo";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(undefined, ...args)) as T;
}

describe("seo Vite Plugin", () => {
  it("resolves and loads virtual modules", async () => {
    const plugin = seo({
      name: "Test Site",
      url: "https://test.rimelight.com",
    });

    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, "other-id")).toBeFalsy();

    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toContain("export const config =");
    expect(configCode).toContain('"name":"Test Site"');
    expect(configCode).toContain('"url":"https://test.rimelight.com"');
  });

  it("applies normalized defaults", async () => {
    const plugin = seo({});
    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toContain('"id":"rimelight"');
    expect(configCode).toContain('"name":"Rimelight"');
    expect(configCode).toContain('"url":"https://rimelight.com"');
  });
});

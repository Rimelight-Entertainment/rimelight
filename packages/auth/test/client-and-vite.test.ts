import { describe, expect, it, vi } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { createAuthClient } from "../src/client/index";
import { auth as authPlugin } from "../src/vite";

/**
 * Invoke a Vite object-hook the way the container does (function or { handler }).
 */
async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(undefined, ...args)) as T;
}

describe("Auth Client", () => {
  it("fetches session and me correctly", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/session") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: { userId: "user-1" },
              session: { id: "user-1", userId: "user-1" },
            }),
        });
      }
      if (url === "/api/auth/me") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { userId: "user-1", name: "User" } }),
        });
      }
      return Promise.reject(new Error("Unknown"));
    });

    const client = createAuthClient({ fetch: mockFetch as any });
    const session = await client.getSession();
    expect(session.user?.userId).toBe("user-1");

    const me = await client.getMe();
    expect(me?.name).toBe("User");
  });

  it("handles fetch failure gracefully", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network Error"));
    const client = createAuthClient({ fetch: mockFetch as any });

    const session = await client.getSession();
    expect(session.user).toBeNull();
    expect(session.session).toBeNull();

    const me = await client.getMe();
    expect(me).toBeNull();
  });
});

describe("Auth Vite Plugin", () => {
  it("injects resolve.alias for #rimelight/auth and legacy #auth aliases", async () => {
    const plugin: Plugin = authPlugin({ adapter: "cf-access" });
    const configResult = await callHook<any>(plugin.config, { root: process.cwd() });
    expect(configResult?.resolve?.alias).toBeDefined();

    const aliases = configResult.resolve.alias;
    const findAlias = (name: string) =>
      aliases.find((a: any) => (a.find instanceof RegExp ? a.find.test(name) : a.find === name));

    expect(findAlias("#rimelight/auth")).toBeDefined();
    expect(findAlias("#auth")).toBeDefined();
    expect(findAlias("#auth/auth")).toBeDefined();
    expect(findAlias("#auth/auth-client")).toBeDefined();
  });

  it("emits disk artifacts when configResolved runs", async () => {
    const plugin: Plugin = authPlugin({
      adapter: "cf-access",
      roleGuards: {
        "/admin": ["admin", "owner"],
      },
    });

    await callHook(plugin.configResolved, { root: process.cwd() });
  });
});

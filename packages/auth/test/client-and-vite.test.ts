import { describe, expect, it, vi } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { createAuthClient } from "../src/client/index";
import {
  auth as authPlugin,
  VIRTUAL_ID,
  RESOLVED_VIRTUAL_ID,
  VIRTUAL_SERVER_ID,
  RESOLVED_VIRTUAL_SERVER_ID,
} from "../src/plugin";

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
  it("resolves and loads virtual modules", async () => {
    const plugin: Plugin = authPlugin({
      adapter: "cf-access",
      roleGuards: {
        "/admin": ["admin", "owner"],
      },
    });

    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, VIRTUAL_SERVER_ID)).toBe(RESOLVED_VIRTUAL_SERVER_ID);
    expect(await callHook(plugin.resolveId, "some-other-id")).toBeNull();

    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toContain("export const config =");
    expect(configCode).toContain('"/admin"');

    const serverCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_SERVER_ID)) as string;
    expect(serverCode).toContain("createCfAccessFromEnv");
  });
});

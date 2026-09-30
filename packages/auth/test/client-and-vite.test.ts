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
  it("resolves virtual auth modules and aliases", async () => {
    const plugin: Plugin = authPlugin({ adapter: "cf-access" });
    expect(await callHook(plugin.resolveId, "virtual:rimelight-auth")).toBe(
      "\0virtual:rimelight-auth",
    );
    expect(await callHook(plugin.resolveId, "#auth/auth")).toBe("\0virtual:rimelight-auth");
    expect(await callHook(plugin.resolveId, "#auth")).toBe("\0virtual:rimelight-auth");
    expect(await callHook(plugin.resolveId, "virtual:rimelight-auth-client")).toBe(
      "\0virtual:rimelight-auth-client",
    );
    expect(await callHook(plugin.resolveId, "#auth/auth-client")).toBe(
      "\0virtual:rimelight-auth-client",
    );
  });

  it("loads cf-access virtual module code", async () => {
    const plugin: Plugin = authPlugin({ adapter: "cf-access" });
    const code = await callHook<string | null>(plugin.load, "\0virtual:rimelight-auth");
    expect(code).toContain("createCfAccessFromEnv");
    expect(code).toContain("export const auth");
  });

  it("loads auth0 virtual module code", async () => {
    const plugin: Plugin = authPlugin({ adapter: "auth0" });
    const code = await callHook<string | null>(plugin.load, "\0virtual:rimelight-auth");
    expect(code).toContain("createAuth0FromEnv");
    expect(code).toContain("export const auth");
  });
});

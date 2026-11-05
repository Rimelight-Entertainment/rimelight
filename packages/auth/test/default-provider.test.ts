import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const ENV_KEYS = [
  "CF_ACCESS_TEAM_DOMAIN",
  "CF_ACCESS_AUD",
  "AUTH0_DOMAIN",
  "AUTH0_CLIENT_ID",
  "AUTH0_AUDIENCE",
  "AUTH0_SECRET",
] as const;

const request = () =>
  new Request("https://rimelight.com/cms", {
    headers: { "cf-access-jwt-assertion": "x.y.z", authorization: "Bearer x.y.z" },
  });

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  vi.resetModules();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  vi.restoreAllMocks();
});

async function loadDefault(provider: string | undefined) {
  // Dynamic import on purpose: the provider is cached per module instance, so each test needs a fresh module graph. The plugin config is set after the reset so the fresh graph reads it.
  const { config } = await import("virtual:rimelight-auth");
  Object.assign(config, { provider });
  const { getDefaultAuth } = await import("../src/default");
  return getDefaultAuth();
}

describe("default auth provider selection", () => {
  it("fails closed when no provider is configured, even if Auth0 is configured", async () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    process.env["AUTH0_CLIENT_ID"] = "client";
    const adapter = await loadDefault(undefined);

    expect(await adapter.getSession(request())).toBeNull();
    expect(await adapter.identify!(request())).toBeNull();
  });

  it("fails closed for an unknown provider", async () => {
    const adapter = await loadDefault("okta");

    expect(await adapter.getSession(request())).toBeNull();
    expect(await adapter.identify!(request())).toBeNull();
  });

  it("fails closed when cf-access is selected without its team domain", async () => {
    process.env["CF_ACCESS_AUD"] = "aud";
    const adapter = await loadDefault("cf-access");

    expect(await adapter.identify!(request())).toBeNull();
  });

  it("selects cf-access when the plugin says so", async () => {
    process.env["CF_ACCESS_TEAM_DOMAIN"] = "team.example.com";
    process.env["CF_ACCESS_AUD"] = "aud";
    const adapter = await loadDefault("cf-access");

    expect(adapter.name).toBe("cf-access");
  });

  it("selects auth0 when the plugin says so", async () => {
    process.env["AUTH0_DOMAIN"] = "test.auth0.com";
    process.env["AUTH0_CLIENT_ID"] = "client";
    process.env["AUTH0_SECRET"] = "test-session-secret-0123456789abcdef";
    const adapter = await loadDefault("auth0");

    expect(adapter.name).toBe("auth0");
  });
});

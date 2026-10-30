import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const verifyAuth0Jwt = vi.hoisted(() => vi.fn());
const provisionUser = vi.hoisted(() => vi.fn());

vi.mock("@rimelight/auth/auth0", () => ({ verifyAuth0Jwt }));
vi.mock("#db", () => ({ getDb: () => ({}) }));
vi.mock("../src/api/routes/v1/provision", () => {
  class ProvisionConflictError extends Error {}
  return { ProvisionConflictError, provisionUser };
});

import type { ClientVariables } from "../src/api/routes/v1/middleware";

const { requireClientToken } = await import("../src/api/routes/v1/middleware");

const env = {
  AUTH0_DOMAIN: "rimelight.eu.auth0.com",
  AUTH0_AUDIENCE: "https://api.rimelight.com",
};

const player = {
  sub: "auth0|abc",
  "https://rimelight.com/user_type": "user",
  "https://rimelight.com/email": "player@example.com",
};

function appFor() {
  const app = new Hono<{ Bindings: Env; Variables: ClientVariables }>();
  app.use("*", requireClientToken);
  app.get("/probe", (c) => c.json({ id: c.var.user.id }));
  return app;
}

function call(headers: Record<string, string> = { Authorization: "Bearer token" }, e = env) {
  return appFor().request("/probe", { headers }, e as any);
}

describe("requireClientToken", () => {
  beforeEach(() => {
    verifyAuth0Jwt.mockReset();
    provisionUser.mockReset();
    provisionUser.mockResolvedValue({ id: "user-1" });
  });

  it("rejects a request without a bearer token", async () => {
    const res = await call({});
    expect(res.status).toBe(401);
    expect(verifyAuth0Jwt).not.toHaveBeenCalled();
  });

  it("fails closed when AUTH0_AUDIENCE is not configured", async () => {
    verifyAuth0Jwt.mockResolvedValue(player);
    const res = await call(undefined, { AUTH0_DOMAIN: env.AUTH0_DOMAIN } as any);
    expect(res.status).toBe(500);
    expect(verifyAuth0Jwt).not.toHaveBeenCalled();
  });

  it("verifies the token against the configured audience", async () => {
    verifyAuth0Jwt.mockResolvedValue(player);
    await call();
    expect(verifyAuth0Jwt).toHaveBeenCalledWith("token", {
      domain: env.AUTH0_DOMAIN,
      audience: env.AUTH0_AUDIENCE,
    });
  });

  it("returns 401 when the token does not verify, including a wrong audience", async () => {
    verifyAuth0Jwt.mockResolvedValue(null);
    const res = await call();
    expect(res.status).toBe(401);
  });

  it("returns 403 for an employee token", async () => {
    verifyAuth0Jwt.mockResolvedValue({ ...player, "https://rimelight.com/user_type": "employee" });
    const res = await call();
    expect(res.status).toBe(403);
    expect(provisionUser).not.toHaveBeenCalled();
  });

  it("returns 401 when the email claim is missing", async () => {
    const { "https://rimelight.com/email": _email, ...noEmail } = player;
    verifyAuth0Jwt.mockResolvedValue(noEmail);
    const res = await call();
    expect(res.status).toBe(401);
  });

  it("provisions the player and passes the user to the route", async () => {
    verifyAuth0Jwt.mockResolvedValue(player);
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "user-1" });
    expect(provisionUser).toHaveBeenCalledWith(expect.anything(), {
      sub: player.sub,
      email: player["https://rimelight.com/email"],
    });
  });
});

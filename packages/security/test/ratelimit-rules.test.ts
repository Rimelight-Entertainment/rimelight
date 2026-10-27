import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { security } from "../src/middleware";
import { activeConfig } from "../src/runtime";

const rules = [
  {
    name: "login",
    routes: ["/api/auth/login"],
    methods: ["POST"],
    bindingName: "RATE_LIMIT_LOGIN",
    retryAfter: 60,
  },
];

const ctxFor = (path: string, method: string, env: Record<string, unknown>) => ({
  req: {
    path,
    method,
    url: `http://localhost${path}`,
    header: (name: string) => (name === "CF-Connecting-IP" ? "1.2.3.4" : undefined),
  },
  env,
  json: vi.fn((data: unknown, status: number, headers: unknown) => ({ data, status, headers })),
});

describe("ratelimit rules", () => {
  beforeEach(() => {
    for (const key of Object.keys(activeConfig)) {
      delete (activeConfig as any)[key];
    }
    Object.assign(activeConfig, { ratelimit: { rules } });
  });

  it("limits an IP-keyed route with its own binding and namespaced key", async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    const next = vi.fn();
    await security()(
      ctxFor("/api/auth/login", "POST", { RATE_LIMIT_LOGIN: { limit } }) as any,
      next,
    );
    expect(limit).toHaveBeenCalledWith({ key: "login:1.2.3.4" });
    expect(next).toHaveBeenCalled();
  });

  it("returns 429 with the rule's retry window when the IP limit is exceeded", async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    const next = vi.fn();
    const ctx = ctxFor("/api/auth/login", "POST", { RATE_LIMIT_LOGIN: { limit } });
    const res = await security()(ctx as any, next);
    expect(res).toEqual(expect.objectContaining({ status: 429, headers: { "Retry-After": "60" } }));
    expect(next).not.toHaveBeenCalled();
  });

  it("skips a rule when the method does not match", async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    const next = vi.fn();
    await security()(
      ctxFor("/api/auth/login", "GET", { RATE_LIMIT_LOGIN: { limit } }) as any,
      next,
    );
    expect(limit).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("fails open when the rule's binding is missing", async () => {
    const next = vi.fn();
    await security()(ctxFor("/api/auth/login", "POST", {}) as any, next);
    expect(next).toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vite-plus/test";
import { construction, isConstructionGuest } from "../src/middleware";

describe("@rimelight/security - ReDoS and Route Matching Robustness", () => {
  const createCtx = (path: string) => ({
    req: {
      path,
      method: "GET",
      raw: { headers: new Headers() },
      url: "http://localhost" + path,
      header: () => undefined,
    },
    env: {
      CONSTRUCTION_MODE: "true",
      CONSTRUCTION_PASSPHRASE: "secret",
    },
    redirect: () => ({ status: 302 }),
    json: () => {},
  });

  it("safely and quickly evaluates regex and string route rules against hostile inputs", async () => {
    const middleware = construction();
    const evilPath = "/assets/" + "a".repeat(2500) + "!!!!.exe";

    let redirected = false;
    const ctx = createCtx(evilPath);
    ctx.redirect = () => {
      redirected = true;
      return { status: 302 };
    };

    const startTime = Date.now();
    const result = await middleware(
      ctx as any,
      (async () => "next-called") as unknown as () => Promise<void>,
    );
    const elapsedMs = Date.now() - startTime;

    expect(elapsedMs).toBeLessThan(100);
    // /assets/ is whitelisted, so the request is forwarded to the host untouched. It is never
    // answered with a redirect to the HTML construction page.
    expect(redirected).toBe(false);
    expect(result).toBe("next-called");
  });

  it("does not leak regex backtracking when a whitelisted prefix is followed by hostile input", async () => {
    const middleware = construction();
    const evilPath = "/" + "a".repeat(4000) + "/x.png";

    const ctx = createCtx(evilPath);

    const startTime = Date.now();
    const res = (await middleware(ctx as any, async () => {})) as Response;
    expect(Date.now() - startTime).toBeLessThan(100);
    expect(res.status).toBe(404);
  });

  it("evaluates guest cookie verification correctly", async () => {
    const mockContext = {
      req: { header: () => undefined },
      env: { CONSTRUCTION_PASSPHRASE: "pass" },
    };
    const isGuest = await isConstructionGuest(mockContext as any);
    expect(isGuest).toBe(false);
  });
});

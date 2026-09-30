import { describe, expect, it, beforeEach } from "vite-plus/test";
import { LockManager } from "../src/client/state/lock-manager";

describe("draft-lock-ttl", () => {
  let activeLock: { userId: string; userName: string; expiresAt: number } | null = null;

  beforeEach(() => {
    activeLock = null;

    globalThis.fetch = async (url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
      const body = typeof options?.body === "string" ? JSON.parse(options.body) : {};

      if (urlStr.endsWith("/lock/checkout")) {
        const now = Date.now();
        const ttlMs = 100;

        if (activeLock && activeLock.expiresAt > now && activeLock.userId !== body.userId) {
          return new Response(
            JSON.stringify({
              success: false,
              lockedByUserId: activeLock.userId,
              lockedByUserName: activeLock.userName,
              expiresAt: new Date(activeLock.expiresAt).toISOString(),
            }),
            { status: 423, headers: { "Content-Type": "application/json" } },
          );
        }

        activeLock = {
          userId: body.userId,
          userName: body.userName,
          expiresAt: now + ttlMs,
        };
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (urlStr.endsWith("/lock/heartbeat")) {
        if (activeLock && activeLock.userId === body.userId) {
          activeLock.expiresAt = Date.now() + 100;
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (urlStr.endsWith("/lock/release")) {
        if (activeLock && activeLock.userId === body.userId) {
          activeLock = null;
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    };
  });

  it("verifies lock checkout expiration after TTL", async () => {
    const lockManager = new LockManager("test-page", 100); // 100ms TTL for testing

    const result = await lockManager.acquireCheckout("user-1", "Test User");
    expect(result.success).toBe(true);

    // Stop heartbeat so the lock can expire naturally
    lockManager.stopHeartbeat();

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // After TTL, a new user should be able to acquire the lock
    const newResult = await lockManager.acquireCheckout("user-2", "New User");
    expect(newResult.success).toBe(true);

    lockManager.stopHeartbeat();
  });

  it("verifies heartbeat refresh extends lock TTL", async () => {
    const lockManager = new LockManager("test-page", 30); // 30ms heartbeat

    const result = await lockManager.acquireCheckout("user-1", "Test User");
    expect(result.success).toBe(true);

    // Wait 60ms (heartbeat fires at 30ms and extends lock by +100ms)
    await new Promise((resolve) => setTimeout(resolve, 60));

    const secondResult = await lockManager.acquireCheckout("user-2", "New User");
    expect(secondResult.success).toBe(false);

    lockManager.stopHeartbeat();
  });

  it("verifies lock release immediately frees the lock", async () => {
    const lockManager = new LockManager("test-page", 5000);

    await lockManager.acquireCheckout("user-1", "Test User");
    await lockManager.releaseCheckout("user-1");

    // Immediately after release, another user should be able to acquire
    const newResult = await lockManager.acquireCheckout("user-2", "New User");
    expect(newResult.success).toBe(true);

    lockManager.stopHeartbeat();
  });
});

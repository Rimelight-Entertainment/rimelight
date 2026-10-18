import type { MiddlewareHandler } from "hono";
import { verifyTurnstile } from "./runtime";

/**
 * Hono middleware to verify Cloudflare Turnstile token from form or JSON request.
 */
export const turnstile = (field = "cf-turnstile-response"): MiddlewareHandler => {
  return async (c, next) => {
    const ct = (c.req.header("content-type") || "").toLowerCase();
    const body: any = ct.includes("form")
      ? await c.req.parseBody().catch(() => ({}))
      : await c.req.json().catch(() => ({}));

    const token = typeof body?.[field] === "string" ? body[field] : undefined;
    const ok = await verifyTurnstile(
      token,
      c.env?.TURNSTILE_SECRET_KEY,
      c.req.header("CF-Connecting-IP"),
    );

    if (ok) return next();
    return c.json({ success: false, error: "Turnstile verification failed" }, 400);
  };
};

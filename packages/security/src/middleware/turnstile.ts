import { verifyTurnstile } from "../turnstile";
import type { TurnstileMiddlewareOptions } from "../types";
import { getSecurityConfig } from "../runtime";

export type { TurnstileMiddlewareOptions } from "../types";

/**
 * Middleware that verifies a Cloudflare Turnstile token from the request's form body before
 * continuing. Responds with `400 { success: false, error }` when verification fails.
 *
 * @example
 *   import { turnstile } from "@rimelight/security/middleware"
 *   app.post("/contact", turnstile(), (c) => { ... })
 */
export const turnstile = () => {
  const rawTurnstile = getSecurityConfig().turnstile;
  const options: TurnstileMiddlewareOptions =
    typeof rawTurnstile === "object" && rawTurnstile !== null ? rawTurnstile : {};
  const { field = "cf-turnstile-response", ...verifyOptions } = options;

  return async (c: any, next: () => Promise<any>): Promise<any> => {
    // Hono caches parseBody(), so the route handler can still read the body afterwards.
    const body = await c.req.parseBody();
    const token = body?.[field];

    const result = await verifyTurnstile({
      ...verifyOptions,
      token: typeof token === "string" ? token : undefined,
      env: c.env,
      remoteIp: c.req.header("CF-Connecting-IP"),
    });

    if (result.success) return next();

    const payload = { success: false, error: result.error };
    if (typeof c.json === "function") return c.json(payload, 400);
    return new Response(JSON.stringify(payload), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  };
};

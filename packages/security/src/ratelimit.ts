import type { MiddlewareHandler } from "hono";
import { activeConfig } from "./runtime";

/**
 * Hono middleware for Cloudflare rate limiting.
 * By default, applies to all routes unless options.routes specifies a filter.
 */
export const ratelimit = (): MiddlewareHandler => {
  const raw = activeConfig.ratelimit;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const {
    bindingName = "MY_RATE_LIMITER",
    routes,
    retryAfter = 60,
    fallback = "pass",
    keyGenerator = (c) => c.req.header("CF-Connecting-IP") || "unknown",
    onRateLimited = (c, retry) =>
      c.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        429,
        { "Retry-After": String(retry) },
      ),
  } = options;

  return async (c, next) => {
    const path = c.req.path;
    const matches = routes
      ? typeof routes === "function"
        ? routes(c)
        : routes.some((r: string | RegExp) =>
            typeof r === "string" ? path.startsWith(r) || path === r : r.test(path),
          )
      : true;

    if (!matches) return next();

    const limiter = options.limiter ? options.limiter(c) : c.env?.[bindingName];
    if (!limiter || typeof limiter.limit !== "function") {
      if (fallback === "pass") return next();
      return c.json({ error: "Rate limiter not configured" }, 500);
    }

    try {
      const key = await keyGenerator(c);
      const { success } = await limiter.limit({ key });
      if (!success) return onRateLimited(c, retryAfter);
    } catch {
      if (fallback !== "pass") return c.json({ error: "Rate limit check failed" }, 500);
    }
    return next();
  };
};

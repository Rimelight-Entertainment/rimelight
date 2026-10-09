import type { RateLimitOptions, RateLimiterBinding } from "../types";
import { getSecurityConfig } from "../state";

const DEFAULT_SENSITIVE_ROUTES = ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"];

/**
 * Middleware to enforce rate limits on sensitive endpoints using Cloudflare Rate Limiting bindings.
 *
 * @example
 *   // vite.config.ts
 *   security({
 *     ratelimit: {
 *       routes: ["/api/checkout", "/auth/login"],
 *       retryAfter: 30,
 *       bindingName: "MY_RATE_LIMITER",
 *     },
 *   })
 *
 *   // fetch.ts
 *   import { ratelimit } from "@rimelight/security/middleware"
 *   app.use(ratelimit())
 */
export const ratelimit = () => {
  const rawRatelimit = getSecurityConfig().ratelimit;
  const options: RateLimitOptions =
    typeof rawRatelimit === "object" && rawRatelimit !== null ? rawRatelimit : {};
  const {
    bindingName = "MY_RATE_LIMITER",
    routes = DEFAULT_SENSITIVE_ROUTES,
    retryAfter = 60,
    fallback = "pass",
    keyGenerator = (c: any) =>
      c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "unknown",
    onRateLimited = (c: any, retry: number) => {
      if (typeof c.json === "function") {
        return c.json(
          {
            error: "Too Many Requests",
            message: "Rate limit exceeded. Please try again later.",
          },
          429,
          {
            "Retry-After": String(retry),
          },
        );
      }

      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retry),
          },
        },
      );
    },
  } = options;

  return async (c: any, next: () => Promise<any>): Promise<any> => {
    const path = c?.req?.path || "";

    // 1. Check if the current request matches the rate-limited routes
    const matchesRoute =
      typeof routes === "function"
        ? routes(c)
        : routes.some((route: string | RegExp) =>
            typeof route === "string" ? path.includes(route) : route.test(path),
          );

    if (!matchesRoute) {
      return next();
    }

    // 2. Resolve the rate limiter binding
    const bindings = c?.env;
    const limiter: RateLimiterBinding | undefined = options.limiter
      ? options.limiter(c)
      : bindings?.[bindingName];

    if (!limiter || typeof limiter.limit !== "function") {
      // Falls back (fails open/closed according to fallback option)
      if (fallback === "pass") {
        return next();
      }

      if (typeof c.json === "function") {
        return c.json({ error: "Rate limiter not configured" }, 500);
      }
      return new Response(JSON.stringify({ error: "Rate limiter not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Extract key and perform rate limit check
    try {
      const clientKey = await keyGenerator(c);
      const { success } = await limiter.limit({ key: clientKey });

      if (!success) {
        return onRateLimited(c, retryAfter);
      }
    } catch (error) {
      console.error("[Rate Limit Error]", error);
      if (fallback !== "pass") {
        if (typeof c.json === "function") {
          return c.json({ error: "Rate limit check failed" }, 500);
        }
        return new Response(JSON.stringify({ error: "Rate limit check failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return next();
  };
};

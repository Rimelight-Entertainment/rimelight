/**
 * Hono middleware that blocks any path containing `/dev/` in non-development environments. Mount
 * this early in your Hono app (before API routes and Astro pages) so it covers both `/dev/` page
 * routes and `/api/dev/` API routes in a single place.
 *
 * @example
 *   // fetch.ts
 *   import { devOnly } from "@rimelight/security/middleware"
 *   app.use(devOnly)
 */
export const devOnly = async (c: any, next: any): Promise<Response> => {
  if (!import.meta.env.DEV && c.req.path.includes("/dev/")) {
    return c.notFound();
  }
  return next();
};

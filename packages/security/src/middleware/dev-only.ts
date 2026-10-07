/**
 * Hono middleware that blocks any path containing `/dev/` in non-development environments. Mount
 * this early in your Hono app (before API routes and Astro pages) so it covers both `/dev/` page
 * routes and `/api/dev/` API routes in a single place.
 *
 * @example
 *   // fetch.ts
 *   import { devOnly } from "@rimelight/security/middleware"
 *   app.use(devOnly())
 */
export const devOnly =
  () =>
  async (c: any, next: any): Promise<Response> => {
    const isDev =
      process.env["NODE_ENV"] === "development" ||
      (import.meta.env?.DEV === true &&
        process.env["NODE_ENV"] !== "production" &&
        process.env["NODE_ENV"] !== "test");

    if (!isDev && c.req?.path?.includes?.("/dev/")) {
      if (typeof c.notFound === "function") {
        return c.notFound();
      }
      return new Response("Not Found", { status: 404 });
    }
    return next();
  };

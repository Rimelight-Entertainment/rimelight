import { CmsError } from "../services/context";

/**
 * Hono error handler. Hono 5 calls it as `(c, next)` with the error on `c.error` (v4 passed
 * `(err, c)`); accept either so the handler works across versions.
 */
export function handleCmsError(a: any, b: any): Response {
  const [c, err] = typeof a?.json === "function" ? [a, a.error] : [b, a];
  if (err instanceof CmsError) {
    for (const [name, value] of Object.entries(err.headers ?? {})) c.header(name, value);
    return c.json({ error: err.message, details: err.details }, err.status);
  }
  console.error("[@rimelight/cms]", err);
  return c.json({ error: "Internal CMS error" }, 500);
}

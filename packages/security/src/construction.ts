import type { MiddlewareHandler } from "hono";
import { activeConfig } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

/**
 * Hono middleware for site maintenance and construction mode gating.
 */
export const construction = (): MiddlewareHandler => {
  const conf = typeof activeConfig.construction === "object" ? activeConfig.construction : {};
  const baseConstructionPath = conf?.constructionPath ?? "/construction";

  return async (c, next) => {
    const env = (c.env || {}) as Record<string, any>;
    const enabled =
      env["CONSTRUCTION_MODE"] === "true" ||
      env["CONSTRUCTION_MODE"] === true ||
      (typeof process !== "undefined" && process.env?.["CONSTRUCTION_MODE"] === "true");

    const secret =
      conf?.passphrase ??
      env["CONSTRUCTION_PASSPHRASE"] ??
      (typeof process !== "undefined" ? process.env?.["CONSTRUCTION_PASSPHRASE"] : undefined);

    const getConstructionUrl = (targetPath: string) => {
      const loc = conf?.getLocale
        ? conf.getLocale(targetPath)
        : (targetPath.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)(\/|$)/)?.[1]?.toLowerCase() ?? "en");
      const base = baseConstructionPath.startsWith("/")
        ? baseConstructionPath
        : `/${baseConstructionPath}`;
      return base.startsWith(`/${loc}/`) || base === `/${loc}` ? base : `/${loc}${base}`;
    };

    const path = c.req.path;

    // 1. Password unlock (POST directly to the construction page)
    if (c.req.method.toUpperCase() === "POST" && path.endsWith(baseConstructionPath)) {
      const isForm = (c.req.header("content-type") || "").toLowerCase().includes("form");
      const fd =
        typeof c.req.formData === "function"
          ? await c.req.formData().catch(() => undefined)
          : undefined;
      const parsed: any = !fd
        ? typeof c.req.parseBody === "function"
          ? await c.req.parseBody().catch(() => ({}))
          : typeof c.req.json === "function"
            ? await c.req.json().catch(() => ({}))
            : {}
        : {};

      const pass = String(fd?.get("passphrase") ?? parsed?.passphrase ?? "");
      const redirect = String(fd?.get("redirect") ?? parsed?.redirect ?? "/");
      const ok = Boolean(secret && pass === secret);

      if (ok) {
        c.header(
          "Set-Cookie",
          `rimelight-construction-guest=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
          { append: true },
        );
        return isForm ? c.redirect(redirect) : c.json({ success: true });
      }

      const target = getConstructionUrl(redirect);
      return isForm
        ? c.redirect(`${target}?error=invalid&redirect=${encodeURIComponent(redirect)}`)
        : c.json({ error: "Invalid credentials" }, 401);
    }

    if (!enabled) return next();

    // 2. Bypass static assets, whitelists, or existing unlocked session
    if (
      path.startsWith("/assets/") ||
      path.startsWith("/_image") ||
      path === "/favicon.ico" ||
      path.startsWith("/@") ||
      c.req.header("cookie")?.includes(`rimelight-construction-guest=${secret}`) ||
      (conf?.isAuthorized && (await conf.isAuthorized(c))) ||
      (conf?.whitelist &&
        (typeof conf.whitelist === "function"
          ? conf.whitelist(path)
          : conf.whitelist.some((w: any) => path.startsWith(w))))
    ) {
      return next();
    }

    // 3. Subresources / static files return 404 instead of redirect loop
    const dest = c.req.header("sec-fetch-dest");
    if (/\.[a-z0-9]+$/i.test(path) || (dest && dest !== "document" && dest !== "iframe")) {
      return typeof c.notFound === "function"
        ? c.notFound()
        : new Response("Not Found", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
    }

    // 4. If already on the construction page, allow rendering
    const localizedConstruction = getConstructionUrl(path);
    if (path === baseConstructionPath || path === localizedConstruction) {
      return next();
    }

    // 5. Fallback HTML or redirect to custom construction page
    if (conf?.renderFallback) {
      return new Response(getConstructionFallbackHtml({ redirect: path }), {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return c.redirect(
      `${localizedConstruction}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`,
    );
  };
};

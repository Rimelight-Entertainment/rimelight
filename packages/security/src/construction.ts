import type { MiddlewareHandler } from "hono";
import {
  activeConfig,
  isConstructionGuest,
  signInConstructionGuest,
  getConstructionFallbackHtml,
  CONSTRUCTION_GUEST_COOKIE,
} from "./runtime";

export { isConstructionGuest, signInConstructionGuest, CONSTRUCTION_GUEST_COOKIE };

/**
 * Hono middleware for site maintenance and construction mode gating.
 */
export const construction = (): MiddlewareHandler => {
  const raw = activeConfig.construction;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const apiPath = options.apiPath !== undefined ? options.apiPath : "/api/construction-guest";
  const constructionPath = options.constructionPath ?? "/construction";

  return async (c, next) => {
    const path = c.req.path;

    // 1. Password sign-in endpoint (native form or JSON)
    if (apiPath && path === apiPath && c.req.method.toUpperCase() === "POST") {
      const isForm = (c.req.header("content-type") || "").toLowerCase().includes("form");
      const fd =
        isForm && typeof c.req.formData === "function"
          ? await c.req.formData().catch(() => undefined)
          : undefined;
      const body: any = !fd
        ? await (c.req.parseBody?.() ?? c.req.json?.() ?? {}).catch(() => ({}))
        : {};

      const pass = String(fd?.get("passphrase") ?? body?.["passphrase"] ?? "");
      const remember = fd ? fd.get("rememberMe") !== "false" : body?.["rememberMe"] !== false;
      const redirect = String(fd?.get("redirect") ?? body?.["redirect"] ?? "/");

      const ok = signInConstructionGuest(c, pass, remember);
      if (isForm) {
        if (!ok) {
          const loc = options.getLocale ? options.getLocale(redirect) : "en";
          const base = constructionPath.startsWith("/") ? constructionPath : `/${constructionPath}`;
          const targetPath =
            base.startsWith(`/${loc}/`) || base === `/${loc}` ? base : `/${loc}${base}`;
          return c.redirect(`${targetPath}?error=invalid&redirect=${encodeURIComponent(redirect)}`);
        }
        return c.redirect(redirect);
      }
      return ok ? c.json({ success: true }) : c.json({ error: "Invalid credentials" }, 401);
    }

    // 2. Check if construction mode is active
    const envKey = options.modeEnvKey ?? "CONSTRUCTION_MODE";
    const enabled =
      c.env?.[envKey] === "true" ||
      c.env?.[envKey] === true ||
      (typeof process !== "undefined" &&
        (process.env[envKey] === "true" || (import.meta as any).env?.[envKey] === "true"));

    if (!enabled) return next();

    // 3. Block non-document subresource requests when not authorized (prevent redirect loops for scripts/images)
    const accept = c.req.header("accept");
    const secFetchDest = c.req.header("sec-fetch-dest");
    const isDoc =
      !/\.[a-z0-9]{2,8}$/i.test(path) &&
      (secFetchDest
        ? secFetchDest === "document" || secFetchDest === "iframe"
        : !accept || accept.includes("text/html"));

    // 4. Bypass static files for whitelisted assets (e.g. assets needed by construction page)
    const isBuildAsset =
      path.startsWith("/assets/") ||
      path.startsWith("/_image") ||
      path.startsWith("/@fs/") ||
      path.startsWith("/@vite/") ||
      path.startsWith("/@id/") ||
      path === "/favicon.ico";

    if (isBuildAsset) return next();

    if (options.whitelist) {
      const match =
        typeof options.whitelist === "function"
          ? options.whitelist(path)
          : options.whitelist.some((p: string | RegExp) =>
              typeof p === "string" ? path.startsWith(p) || path === p : p.test(path),
            );
      if (match) return next();
    }

    // 5. Authorized access check (admin check or signed-in guest cookie)
    if (
      (options.isAuthorized && (await options.isAuthorized(c))) ||
      (await isConstructionGuest(c))
    ) {
      return next();
    }

    if (!isDoc) {
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    // 6. Allow construction page itself or redirect to it
    const locMatch = path.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)(\/|$)/);
    const locale = options.getLocale
      ? options.getLocale(path)
      : (locMatch?.[1]?.toLowerCase() ?? "en");
    const norm = path.replace(/\/+$/, "") || "/";
    if (norm === constructionPath || norm === `/${locale}${constructionPath}`) {
      return next();
    }

    const targetUrl = `/${locale}${constructionPath}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`;
    if (options.renderFallback) {
      return new Response(
        getConstructionFallbackHtml({
          redirect: new URL(c.req.url).searchParams.get("redirect") || path,
          endpoint: typeof apiPath === "string" ? apiPath : "/api/construction-guest",
          error: c.req.url.includes("error=invalid") ? "invalid" : undefined,
        }),
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }
    return c.redirect(targetUrl);
  };
};

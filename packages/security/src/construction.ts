import type { MiddlewareHandler } from "hono";
import { setCookie } from "hono/cookie";
import { activeConfig } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

const GUEST_COOKIE = "rimelight-construction-guest";
const COOKIE_OPTS = { httpOnly: true, secure: true, maxAge: 604800 };

export const construction = (): MiddlewareHandler => {
  const conf = typeof activeConfig.construction === "object" ? activeConfig.construction : {};
  const page = conf.constructionPath ?? "/construction";

  return async (c, next) => {
    const isMode = c.env?.CONSTRUCTION_MODE ?? process.env?.["CONSTRUCTION_MODE"];
    if (isMode !== "true" && isMode !== true) return next();

    const secret =
      conf.passphrase ?? c.env?.CONSTRUCTION_PASSPHRASE ?? process.env?.["CONSTRUCTION_PASSPHRASE"];
    const path = c.req.path;

    // 1. Preview link (?preview=secret) -> cookie & redirect
    if (secret && c.req.query?.("preview") === secret) {
      setCookie(c, GUEST_COOKIE, secret, COOKIE_OPTS);
      return c.redirect(path);
    }

    // 2. Cookie check, public assets, whitelist, or custom auth
    if (
      c.req.header("cookie")?.includes(`${GUEST_COOKIE}=${secret}`) ||
      /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
      (typeof conf.whitelist === "function"
        ? conf.whitelist(path)
        : conf.whitelist?.some((w) => path.startsWith(w as string))) ||
      (await conf.isAuthorized?.(c))
    )
      return next();

    // 3. Form/JSON password submitted on the construction page
    if (c.req.method === "POST" && path.includes(page)) {
      const b: any = await (
        c.req.formData?.() ??
        c.req.parseBody?.() ??
        c.req.json?.() ??
        {}
      ).catch(() => ({}));
      const ok = Boolean(secret && (b?.passphrase ?? b?.get?.("passphrase")) === secret);
      const to = String(b?.redirect ?? b?.get?.("redirect") ?? "/");

      if (ok) setCookie(c, GUEST_COOKIE, secret!, COOKIE_OPTS);

      return (c.req.header("content-type") || "").includes("form")
        ? c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`)
        : c.json(ok ? { success: true } : { error: "Invalid credentials" }, ok ? 200 : 401);
    }

    // 4. Render the construction page if already navigating it
    if (path.includes(page)) return next();

    // 5. 404 for asset files; otherwise serve fallback or redirect
    return path.includes(".")
      ? c.notFound()
      : conf.renderFallback
        ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
        : c.redirect(`${page}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`);
  };
};

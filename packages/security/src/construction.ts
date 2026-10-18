import type { MiddlewareHandler } from "hono";
import { setCookie } from "hono/cookie";
import { parse } from "hono/utils/cookie";
import { activeConfig } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

const GUEST_COOKIE = "rimelight-construction-guest";
const COOKIE_OPTS = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  maxAge: 604800,
};

export const construction = (): MiddlewareHandler => {
  const conf = typeof activeConfig.construction === "object" ? activeConfig.construction : {};
  const page = conf.constructionPath ?? "/construction";

  return async (c, next) => {
    const isMode = c.env?.CONSTRUCTION_MODE ?? process.env?.["CONSTRUCTION_MODE"];
    if (isMode !== "true" && isMode !== true) return next();

    const secret =
      conf.passphrase ?? c.env?.CONSTRUCTION_PASSPHRASE ?? process.env?.["CONSTRUCTION_PASSPHRASE"];
    const path = c.req.path;

    // 1. Shareable preview link (?preview=secret) -> cookie & redirect
    if (secret && c.req.query?.("preview") === secret) {
      setCookie(c, GUEST_COOKIE, secret, COOKIE_OPTS);
      return c.redirect(path);
    }

    // 2. Cookie check, custom auth, or whitelisted routes
    const cookie = c.req.header("cookie");
    if (
      (cookie && parse(cookie, GUEST_COOKIE)[GUEST_COOKIE] === secret) ||
      (await conf.isAuthorized?.(c)) ||
      /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
      (Array.isArray(conf.whitelist)
        ? conf.whitelist.some((w: any) => path.startsWith(w))
        : conf.whitelist?.(path))
    ) {
      return next();
    }

    // 3. 404 for subresources (file extension or non-document fetch)
    const dest = c.req.header("sec-fetch-dest");
    if (/\.[a-z0-9]+$/i.test(path) || (dest && dest !== "document")) return c.notFound();

    // 4. Form/JSON password submit on construction page
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

    // 5. If on construction page -> render it; otherwise serve fallback or redirect
    return path.includes(page)
      ? next()
      : conf.renderFallback
        ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
        : c.redirect(`${page}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`);
  };
};

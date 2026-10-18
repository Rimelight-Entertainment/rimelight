import type { MiddlewareHandler } from "hono";
import { setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { activeConfig } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

export const construction = (): MiddlewareHandler => async (c, next) => {
  if (!activeConfig.construction || !["true", true].includes(c.env?.CONSTRUCTION_MODE))
    return next();

  const cookieOpts: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: activeConfig.construction.cookieMaxAge!,
  };

  const secret = activeConfig.construction.passphrase ?? c.env?.CONSTRUCTION_PASSPHRASE;
  const path = c.req.path;

  // 1. Preview link (?preview=secret) -> cookie & redirect
  if (secret && c.req.query?.("preview") === secret) {
    setCookie(c, activeConfig.construction.cookieName!, secret, cookieOpts);
    return c.redirect(path);
  }

  // 2. Cookie check, public assets, whitelist, or custom auth
  if (
    c.req.header("cookie")?.includes(`${activeConfig.construction.cookieName}=${secret}`) ||
    /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
    (typeof activeConfig.construction.whitelist === "function"
      ? activeConfig.construction.whitelist(path)
      : activeConfig.construction.whitelist?.some((w) => path.startsWith(w as string))) ||
    (await activeConfig.construction.isAuthorized?.(c))
  )
    return next();

  // 3. Form/JSON password submitted on the construction page
  if (c.req.method === "POST" && path.includes(activeConfig.construction.constructionPath!)) {
    const isForm = (c.req.header("content-type") || "").includes("form");
    const b: any = await (
      isForm ? (c.req.parseBody?.() ?? c.req.formData?.()) : c.req.json?.()
    )?.catch(() => ({}));
    const ok = Boolean(secret && (b?.passphrase ?? b?.get?.("passphrase")) === secret);
    const to = String(b?.redirect ?? b?.get?.("redirect") ?? "/");

    if (ok) setCookie(c, activeConfig.construction.cookieName!, secret!, cookieOpts);

    return isForm
      ? c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`)
      : c.json(ok ? { success: true } : { error: "Invalid credentials" }, ok ? 200 : 401);
  }

  // 4. Render the construction page if already navigating it
  if (path.includes(activeConfig.construction.constructionPath!)) return next();

  // 5. 404 for asset files; otherwise serve fallback or redirect
  return path.includes(".")
    ? c.notFound()
    : activeConfig.construction.renderFallback
      ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
      : c.redirect(
          `${activeConfig.construction.constructionPath}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`,
        );
};

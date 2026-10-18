import type { MiddlewareHandler } from "hono";
import { activeConfig } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

export const construction = (): MiddlewareHandler => {
  const conf = typeof activeConfig.construction === "object" ? activeConfig.construction : {};
  const page = conf.constructionPath ?? "/construction";

  return async (c, next) => {
    const isMode = c.env?.CONSTRUCTION_MODE ?? process.env?.["CONSTRUCTION_MODE"];
    if (isMode !== "true" && isMode !== true) return next();

    const secret =
      conf.passphrase ?? c.env?.CONSTRUCTION_PASSPHRASE ?? process.env?.["CONSTRUCTION_PASSPHRASE"];
    const path = c.req.path;

    // 1. Shareable preview link: ?preview=secret -> set cookie & redirect to clean path
    const preview = typeof c.req.query === "function" ? c.req.query("preview") : undefined;
    if (secret && preview === secret) {
      c.header(
        "Set-Cookie",
        `rimelight-construction-guest=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        { append: true },
      );
      return c.redirect(path);
    }

    // 2. Cookie check, custom auth, or whitelisted routes
    if (
      c.req.header("cookie")?.includes(`rimelight-construction-guest=${secret}`) ||
      (await conf.isAuthorized?.(c)) ||
      /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
      (Array.isArray(conf.whitelist)
        ? conf.whitelist.some((w: any) => path.startsWith(w))
        : conf.whitelist?.(path))
    ) {
      return next();
    }

    // 3. 404 for subresource files so they don't redirect to HTML
    if (
      /\.[a-z0-9]+$/i.test(path) ||
      (c.req.header("sec-fetch-dest") && c.req.header("sec-fetch-dest") !== "document")
    ) {
      return c.notFound?.() ?? new Response("Not Found", { status: 404 });
    }

    // 4. Form/JSON password submit on construction page
    if (c.req.method === "POST" && path.includes(page)) {
      const b: any =
        (await c.req.formData?.().catch(() => undefined)) ??
        (await (c.req.parseBody?.() ?? c.req.json?.() ?? {}).catch(() => ({})));
      const pass = typeof b?.get === "function" ? b.get("passphrase") : b?.passphrase;
      const to = String((typeof b?.get === "function" ? b.get("redirect") : b?.redirect) || "/");
      const ok = Boolean(secret && pass === secret);

      if (ok) {
        c.header(
          "Set-Cookie",
          `rimelight-construction-guest=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
          { append: true },
        );
      }

      const isForm = (c.req.header("content-type") || "").includes("form");
      if (isForm) {
        return c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`);
      }
      return (
        c.json?.(ok ? { success: true } : { error: "Invalid credentials" }, ok ? 200 : 401) ??
        new Response(JSON.stringify(ok ? { success: true } : { error: "Invalid credentials" }), {
          status: ok ? 200 : 401,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    // 5. If already on construction page -> render it
    if (path.includes(page)) return next();

    // 6. Otherwise serve fallback or redirect to construction page
    return conf.renderFallback
      ? new Response(getConstructionFallbackHtml({ redirect: path }), {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        })
      : c.redirect(`${page}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`);
  };
};

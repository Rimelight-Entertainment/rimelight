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

    // 1. Unlocked or static asset
    if (
      c.req.header("cookie")?.includes(`rimelight-construction-guest=${secret}`) ||
      (await conf.isAuthorized?.(c)) ||
      /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
      (conf.whitelist &&
        (typeof conf.whitelist === "function"
          ? conf.whitelist(path)
          : conf.whitelist.some((w: any) => path.startsWith(w))))
    ) {
      return next();
    }

    // 2. Subresource 404
    if (
      /\.[a-z0-9]+$/i.test(path) ||
      (c.req.header("sec-fetch-dest") && c.req.header("sec-fetch-dest") !== "document")
    ) {
      return c.notFound?.() ?? new Response("Not Found", { status: 404 });
    }

    // 3. Password unlock on construction page
    if (c.req.method === "POST" && path.includes(page)) {
      const b: any =
        (await c.req.formData?.().catch(() => undefined)) ??
        (await (c.req.parseBody?.() ?? c.req.json?.() ?? {}).catch(() => ({})));
      const pass = typeof b?.get === "function" ? b.get("passphrase") : b?.passphrase;
      const to = String((typeof b?.get === "function" ? b.get("redirect") : b?.redirect) || "/");
      const isForm = (c.req.header("content-type") || "").includes("form");
      const ok = Boolean(secret && pass === secret);

      if (ok) {
        c.header(
          "Set-Cookie",
          `rimelight-construction-guest=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
          { append: true },
        );
      }

      return isForm
        ? c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`)
        : (c.json?.(ok ? { success: true } : { error: "Invalid credentials" }, ok ? 200 : 401) ??
            new Response(
              JSON.stringify(ok ? { success: true } : { error: "Invalid credentials" }),
              { status: ok ? 200 : 401 },
            ));
    }

    // 4. Render construction page or fallback HTML
    return path.includes(page)
      ? next()
      : conf.renderFallback
        ? new Response(getConstructionFallbackHtml({ redirect: path }), {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        : c.redirect(`${page}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`);
  };
};

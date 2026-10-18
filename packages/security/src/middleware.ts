import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { buildCspHeader, activeConfig, verifyTurnstile } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

export const security = (): MiddlewareHandler => {
  const sriCache: Record<string, string | undefined> = {};

  return async (c, next) => {
    const isDev = process.env["NODE_ENV"] === "development";
    const path = c.req.path;

    // 1. Block /dev routes in production & enforce TLS 1.2+ / HTTPS
    if (activeConfig.devOnly && !isDev && path.startsWith("/dev")) return c.notFound();

    const tls = ((c.req.raw as { cf?: { tlsVersion?: string } })?.cf || c.env?.cf)?.tlsVersion;
    if (activeConfig.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
      return new Response("TLS 1.2 or higher is required.", { status: 400 });
    }
    if (!isDev && c.req.header("x-forwarded-proto") === "http") {
      return Response.redirect(c.req.url.replace(/^http:/, "https:"), 301);
    }

    const matches = (
      routes?: (string | RegExp)[] | ((c: Context) => boolean) | ((p: string) => boolean),
      arg: Context & string = c as Context & string,
      fallback = true,
    ) =>
      !routes
        ? fallback
        : typeof routes === "function"
          ? routes(arg)
          : routes.some((r) => (typeof r === "string" ? path.startsWith(r) : r.test(path)));

    const readBody = async (): Promise<Record<string, unknown>> => {
      try {
        const raw = c.req.raw.clone();
        return (c.req.header("content-type") || "").toLowerCase().includes("form")
          ? Object.fromEntries((await raw.formData()).entries())
          : ((await raw.json()) as Record<string, unknown>);
      } catch {
        return {};
      }
    };

    // 2. Rate limiting
    const rl = activeConfig.ratelimit;
    if (rl && matches(rl.routes, c as Context & string, true)) {
      const limiter = rl.limiter ? rl.limiter(c) : c.env?.[rl.bindingName!];
      const failBlock = rl.fallback && rl.fallback !== "pass";

      if (typeof limiter?.limit !== "function") {
        if (failBlock) return (c.res = c.json({ error: "Rate limiter not configured" }, 500));
      } else {
        try {
          const key = await (rl.keyGenerator?.(c) ??
            (c.req.header("CF-Connecting-IP") || "unknown"));
          if (!(await limiter.limit({ key })).success) {
            const retry = rl.retryAfter!;
            return (c.res = rl.onRateLimited
              ? await rl.onRateLimited(c, retry)
              : c.json(
                  {
                    error: "Too Many Requests",
                    message: "Rate limit exceeded. Please try again later.",
                  },
                  429,
                  { "Retry-After": String(retry) },
                ));
          }
        } catch {
          if (failBlock) return (c.res = c.json({ error: "Rate limit check failed" }, 500));
        }
      }
    }

    // 3. Turnstile verification
    const ts = typeof activeConfig.turnstile === "object" ? activeConfig.turnstile : undefined;
    if (
      ts?.routes &&
      /^(POST|PUT|PATCH|DELETE)$/i.test(c.req.method) &&
      matches(ts.routes, c as Context & string, false)
    ) {
      const val = (await readBody())[ts.field || "cf-turnstile-response"];
      if (
        !(await verifyTurnstile(
          typeof val === "string" ? val : undefined,
          ts.secretKey ?? c.env?.TURNSTILE_SECRET_KEY,
          c.req.header("CF-Connecting-IP"),
        ))
      ) {
        return (c.res = c.json({ success: false, error: "Turnstile verification failed" }, 400));
      }
    }

    // 4. Construction mode
    const cg = activeConfig.construction;
    if (cg && String(c.env?.CONSTRUCTION_MODE) === "true") {
      const {
        constructionPath,
        cookieName,
        cookieMaxAge,
        whitelist,
        isAuthorized,
        renderFallback,
      } = cg;
      const cookieOpts = { httpOnly: true, secure: true, maxAge: cookieMaxAge! };
      const secret = c.env?.CONSTRUCTION_PASSPHRASE;

      if (secret && c.req.query("preview") === secret) {
        setCookie(c, cookieName!, secret, cookieOpts);
        return (c.res = c.redirect(path));
      }

      const authed =
        (secret && getCookie(c, cookieName!) === secret) ||
        /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
        matches(whitelist, path as Context & string, false) ||
        (await isAuthorized?.(c));

      if (!authed) {
        if (c.req.method === "POST" && path.includes(constructionPath!)) {
          const body = await readBody();
          const ok = Boolean(secret && body["passphrase"] === secret);
          const to = typeof body["redirect"] === "string" ? body["redirect"] : "/";
          if (ok) setCookie(c, cookieName!, secret!, cookieOpts);
          return (c.res = c.redirect(
            ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`,
          ));
        }

        if (!path.includes(constructionPath!)) {
          const { search } = new URL(c.req.url);
          return (c.res = await (path.includes(".")
            ? c.notFound()
            : renderFallback
              ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
              : c.redirect(`${constructionPath}?redirect=${encodeURIComponent(path + search)}`)));
        }
      }
    }

    // 5. Execute downstream & rewrite HTML
    await next();
    if (!c.res) return;

    const { origin } = new URL(c.req.url);
    const isHtml = (c.res.headers.get("content-type") || "").includes("text/html");
    const nonce =
      isHtml && !isDev
        ? btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
        : undefined;

    type RewriterEl = Record<string, (a: string, b?: unknown) => string | null>;
    const Rewriter = (
      globalThis as {
        HTMLRewriter?: new () => {
          on(s: string, h: { element(e: RewriterEl): unknown }): void;
          transform(r: Response): Response;
        };
      }
    ).HTMLRewriter;

    let res = c.res;
    if (isHtml && Rewriter) {
      const headHtml = [
        nonce ? `<meta name="csp-nonce" content="${nonce}">` : "",
        activeConfig.trustedTypes
          ? `<script${nonce ? ` nonce="${nonce}"` : ""}>if(window.trustedTypes?.createPolicy&&!trustedTypes.defaultPolicy)try{trustedTypes.createPolicy("default",{createHTML:s=>s,createScript:s=>s,createScriptURL:s=>s})}catch{}</script>`
          : "",
        isDev
          ? `<script>{const s=new Set();addEventListener("securitypolicyviolation",e=>{const k=e.effectiveDirective+":"+(e.blockedURI||e.sample||"");if(e.disposition==="report"&&!s.has(k)){s.add(k);console.warn("%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\\nDirective: "+e.effectiveDirective+(e.blockedURI?"\\nBlocked URI: "+e.blockedURI:"")+(e.sourceFile?"\\nSource: "+e.sourceFile+":"+(e.lineNumber||0):"")+(e.sample?"\\nSample: "+e.sample.slice(0,100):"")+"\\nFix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration","background:#e11d48;color:white;padding:2px 6px;border-radius:4px;font-weight:bold","color:inherit;font-weight:normal")}})}</script>`
          : "",
      ].join("");

      const rewriter = new Rewriter();
      rewriter.on("head", { element: (el) => el["append"]!(headHtml, { html: true }) });

      if (nonce) {
        const sri = (attr: string) => ({
          element(el: RewriterEl) {
            const url = el["getAttribute"]!(attr);
            if (!url) return;
            const apply = (val?: string) => {
              if (val) {
                el["setAttribute"]!("integrity", val);
                el["setAttribute"]!("crossorigin", "anonymous");
              }
            };
            const cached = activeConfig.manifest?.[url] ?? sriCache[url];
            if (cached || process.env["NODE_ENV"] !== "production") return apply(cached);

            return (async () => {
              try {
                const assetRes = url.startsWith("https://")
                  ? !url.includes("*") && !url.endsWith("/")
                    ? await fetch(url)
                    : undefined
                  : url.startsWith("/") && !url.startsWith("//")
                    ? await (c.env?.ASSETS ?? { fetch }).fetch(new Request(new URL(url, origin)))
                    : undefined;
                if (assetRes?.ok) {
                  const buf = await crypto.subtle.digest("SHA-384", await assetRes.arrayBuffer());
                  apply(
                    (sriCache[url] = `sha384-${btoa(String.fromCharCode(...new Uint8Array(buf)))}`),
                  );
                }
              } catch {}
            })();
          },
        });

        rewriter.on("script[src]", sri("src"));
        rewriter.on('link[rel="stylesheet"][href]', sri("href"));
        rewriter.on("script", { element: (el) => el["setAttribute"]!("nonce", nonce) });
        rewriter.on("style", { element: (el) => el["setAttribute"]!("nonce", nonce) });
      }

      res = rewriter.transform(res);
    }

    // 6. Apply security headers
    const devList = (val: string[] | string | boolean | undefined, extra: string[] = []) =>
      val
        ? Array.isArray(val)
          ? [...new Set([...val, "'unsafe-inline'"])]
          : val
        : ["'self'", "'unsafe-inline'", ...extra];

    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries({
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "0",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "No-Vary-Search": 'except=("q" "search" "locale"), params=?1',
      "Cross-Origin-Resource-Policy": activeConfig.crossOriginResourcePolicy,
      "Cross-Origin-Opener-Policy": activeConfig.crossOriginOpenerPolicy,
      "Cross-Origin-Embedder-Policy": activeConfig.crossOriginEmbedderPolicy,
      "Content-Security-Policy": buildCspHeader(
        isHtml && isDev
          ? {
              ...activeConfig,
              directives: {
                ...activeConfig.directives,
                "default-src": false,
                "script-src": "'self' 'unsafe-inline' 'unsafe-eval' https: http: ws: wss:",
                "script-src-attr": "'unsafe-inline'",
                "style-src": "'self' 'unsafe-inline' https: http:",
                "connect-src": "'self' ws: wss: http: https:",
                "img-src": "'self' data: blob: https: http:",
              },
            }
          : activeConfig,
        nonce,
      ),
      "Content-Security-Policy-Report-Only":
        isHtml && isDev
          ? buildCspHeader({
              ...activeConfig,
              directives: {
                ...activeConfig.directives,
                "upgrade-insecure-requests": false,
                "script-src": devList(activeConfig.directives?.["script-src"], [
                  "'inline-speculation-rules'",
                  ...(activeConfig.scriptResources || []),
                ]),
                "script-src-attr": "'unsafe-inline'",
                "style-src": devList(
                  activeConfig.directives?.["style-src"],
                  activeConfig.styleResources,
                ),
              },
            })
          : undefined,
      Link: `<${origin}/sitemap-index.xml>; rel="sitemap", <${origin}/llms.txt>; rel="llms", <${origin}/.well-known/api-catalog>; rel="api-catalog", <${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`,
      ...activeConfig.headers,
    })) {
      if (v) headers.set(k, v);
    }

    if (activeConfig.stripHeaders) {
      for (const k of activeConfig.stripHeaders) headers.delete(k);
    }

    return (c.res = new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    }));
  };
};

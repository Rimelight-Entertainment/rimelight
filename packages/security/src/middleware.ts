import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { buildCspHeader, activeConfig, verifyTurnstile } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

export const security = (): MiddlewareHandler => async (c, next) => {
  const isDev =
    (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "development") ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as any).env?.DEV));
  const { path } = c.req;

  // 1. Block /dev routes in production & enforce TLS 1.2+ / HTTPS
  if (activeConfig.devOnly && !isDev && /(?:^|\/)dev(?:\/|$)/.test(path)) return c.notFound();

  const tls = ((c.req.raw as { cf?: { tlsVersion?: string } }).cf || c.env?.cf)?.tlsVersion;
  if (activeConfig.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
    return c.text("TLS 1.2 or higher is required.", 400);
  }
  if (!isDev && c.req.header("x-forwarded-proto") === "http") {
    return c.redirect(c.req.url.replace(/^http:/, "https:"), 301);
  }

  const matches = (routes?: (string | RegExp)[] | ((c: Context) => boolean)) =>
    typeof routes === "function"
      ? routes(c)
      : routes?.some((r) => (typeof r === "string" ? path.startsWith(r) : r.test(path)));

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
  if (rl && (matches(rl.routes) ?? true)) {
    const limiter = rl.limiter ? rl.limiter(c) : c.env?.[rl.bindingName!];
    const failBlock = rl.fallback && rl.fallback !== "pass";

    if (typeof limiter?.limit !== "function") {
      if (failBlock) return c.json({ error: "Rate limiter not configured" }, 500);
    } else {
      try {
        const key = await (rl.keyGenerator?.(c) ?? (c.req.header("CF-Connecting-IP") || "unknown"));
        if (!(await limiter.limit({ key })).success) {
          const retry = rl.retryAfter!;
          return rl.onRateLimited
            ? await rl.onRateLimited(c, retry)
            : c.json(
                {
                  error: "Too Many Requests",
                  message: "Rate limit exceeded. Please try again later.",
                },
                429,
                { "Retry-After": String(retry) },
              );
        }
      } catch {
        if (failBlock) return c.json({ error: "Rate limit check failed" }, 500);
      }
    }
  }

  // 3. Turnstile verification
  const ts = typeof activeConfig.turnstile === "object" ? activeConfig.turnstile : undefined;
  if (ts && /^(POST|PUT|PATCH|DELETE)$/i.test(c.req.method) && matches(ts.routes)) {
    const val = (await readBody())[ts.field || "cf-turnstile-response"];
    const ok = await verifyTurnstile(
      typeof val === "string" ? val : undefined,
      ts.secretKey ?? c.env?.TURNSTILE_SECRET_KEY,
      c.req.header("CF-Connecting-IP"),
      ts,
    );
    if (!ok) return c.json({ success: false, error: "Turnstile verification failed" }, 400);
  }

  // 4. Construction mode
  const cg = activeConfig.construction;
  if (cg && String(c.env?.CONSTRUCTION_MODE) === "true") {
    const { constructionPath, cookieName, cookieMaxAge, whitelist, isAuthorized, renderFallback } =
      cg;
    const cookieOpts = (remember = true) => ({
      httpOnly: true,
      secure: true,
      ...(remember && cookieMaxAge ? { maxAge: cookieMaxAge } : {}),
    });
    const secret = c.env?.CONSTRUCTION_PASSPHRASE;

    if (secret && c.req.query("preview") === secret) {
      setCookie(c, cookieName!, secret, cookieOpts());
      return c.redirect(path);
    }

    const authed =
      (secret && getCookie(c, cookieName!) === secret) ||
      /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
      matches(whitelist) ||
      (await isAuthorized?.(c));

    if (!authed) {
      const isGate = path === constructionPath || path.endsWith(constructionPath!);

      if (c.req.method === "POST" && (isGate || renderFallback)) {
        const body = await readBody();
        const ok = Boolean(secret && body["passphrase"] === secret);
        const rawTo = typeof body["redirect"] === "string" ? body["redirect"] : "/";
        const to = rawTo.startsWith("/") && !rawTo.startsWith("//") ? rawTo : "/";
        if (ok) setCookie(c, cookieName!, secret!, cookieOpts(body["rememberMe"] !== "false"));
        return c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`);
      }

      if (!isGate) {
        return /\.[a-z0-9]{1,8}$/i.test(path)
          ? c.notFound()
          : renderFallback
            ? c.html(
                getConstructionFallbackHtml({ redirect: path, error: c.req.query("error") }),
                503,
              )
            : c.redirect(
                `${constructionPath}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`,
              );
      }
    }
  }

  // 5. Execute downstream & rewrite HTML
  await next();
  if (!c.res) return;

  const isHtml = (c.res.headers.get("content-type") || "").includes("text/html");
  const nonce =
    isHtml && !isDev
      ? btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
      : undefined;

  interface RewriterEl {
    getAttribute(n: string): string | null;
    setAttribute(n: string, v: string): void;
    append(c: string, o?: { html?: boolean }): void;
  }
  const { HTMLRewriter: Rewriter } = globalThis as {
    HTMLRewriter?: new () => {
      on(s: string, h: { element(e: RewriterEl): void }): void;
      transform(r: Response): Response;
    };
  };

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
    rewriter.on("head", { element: (el) => el.append(headHtml, { html: true }) });

    if (nonce) {
      const sri = (attr: string) => ({
        element(el: RewriterEl) {
          const hash = activeConfig.manifest?.[el.getAttribute(attr) || ""];
          if (hash) {
            el.setAttribute("integrity", hash);
            el.setAttribute("crossorigin", "anonymous");
          }
        },
      });

      rewriter.on("script[src]", sri("src"));
      rewriter.on('link[rel="stylesheet"][href]', sri("href"));
      rewriter.on("script", { element: (el) => el.setAttribute("nonce", nonce) });
      rewriter.on("style", { element: (el) => el.setAttribute("nonce", nonce) });
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
    "Content-Security-Policy": isHtml
      ? buildCspHeader(
          isDev
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
        )
      : undefined,
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

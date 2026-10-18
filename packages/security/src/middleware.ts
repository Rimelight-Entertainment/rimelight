import type { Context, MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { config } from "virtual:rimelight-security";
import type { SecurityConfig } from "./types";
import { buildCspHeader, activeConfig, verifyTurnstile } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

interface HTMLRewriterElement {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): HTMLRewriterElement;
  append(content: string, options?: { html?: boolean }): HTMLRewriterElement;
}

interface HTMLRewriterInstance {
  on(
    selector: string,
    handlers: { element(el: HTMLRewriterElement): unknown },
  ): HTMLRewriterInstance;
  transform(response: Response): Response;
}

declare const HTMLRewriter: { new (): HTMLRewriterInstance } | undefined;

type SecurityEnv = {
  Bindings: Record<string, unknown> & {
    CONSTRUCTION_MODE?: string;
    CONSTRUCTION_PASSPHRASE?: string;
    TURNSTILE_SECRET_KEY?: string;
    ASSETS?: { fetch(req: Request): Promise<Response> };
    cf?: { tlsVersion?: string };
  };
};

export const security = (): MiddlewareHandler<SecurityEnv> => {
  const sriCache: Record<string, string | undefined> = {};

  return async (c, next) => {
    const isDev = process.env["NODE_ENV"] === "development";
    const reqUrl = c.req.url || c.req.raw?.url;
    const path = c.req.path;

    // 1. Block /dev routes in production
    if (activeConfig.devOnly !== false && !isDev && path.startsWith("/dev")) {
      return c.notFound();
    }

    // 2. Enforce TLS 1.2+ and HTTPS redirect
    const tls = ((c.req.raw as Request & { cf?: { tlsVersion?: string } })?.cf || c.env?.cf)
      ?.tlsVersion;
    if (activeConfig.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
      return new Response("TLS 1.2 or higher is required.", { status: 400 });
    }
    if (
      !isDev &&
      (c.req.header?.("x-forwarded-proto") ?? c.req.raw?.headers?.get("x-forwarded-proto")) ===
        "http" &&
      reqUrl
    ) {
      return Response.redirect(reqUrl.replace(/^http:/, "https:"), 301);
    }

    const matchRoute = (
      routes?: (string | RegExp)[] | ((c: Context) => boolean),
      fallback = true,
    ) =>
      !routes
        ? fallback
        : typeof routes === "function"
          ? routes(c)
          : routes.some((r) => (typeof r === "string" ? path.startsWith(r) : r.test(path)));

    const readBody = async (): Promise<Record<string, unknown>> => {
      const raw = c.req.raw?.clone?.();
      if ((c.req.header?.("content-type") || "").toLowerCase().includes("form")) {
        return raw
          ? Object.fromEntries((await raw.formData().catch(() => new FormData())).entries())
          : ((await (c.req.parseBody?.() ?? c.req.formData?.())?.catch(() => ({}))) as Record<
              string,
              unknown
            >);
      }
      return (
        raw ? await raw.json().catch(() => ({})) : await c.req.json?.().catch(() => ({}))
      ) as Record<string, unknown>;
    };

    // 3. Rate limiting gate
    if (activeConfig.ratelimit !== false) {
      const rl = typeof activeConfig.ratelimit === "object" ? activeConfig.ratelimit : {};
      if (matchRoute(rl.routes, true)) {
        const limiter = rl.limiter
          ? rl.limiter(c)
          : (c.env?.[rl.bindingName || "MY_RATE_LIMITER"] as
              | { limit(o: { key: string }): Promise<{ success: boolean }> }
              | undefined);
        if (typeof limiter?.limit !== "function") {
          if (rl.fallback && rl.fallback !== "pass") {
            return (c.res = c.json({ error: "Rate limiter not configured" }, 500));
          }
        } else {
          try {
            const key = await (rl.keyGenerator?.(c) ??
              (c.req.header("CF-Connecting-IP") || "unknown"));
            if (!(await limiter.limit({ key })).success) {
              const retry = rl.retryAfter ?? 60;
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
            if (rl.fallback && rl.fallback !== "pass") {
              return (c.res = c.json({ error: "Rate limit check failed" }, 500));
            }
          }
        }
      }
    }

    // 4. Turnstile verification gate
    const ts = typeof activeConfig.turnstile === "object" ? activeConfig.turnstile : undefined;
    if (
      ts?.routes &&
      /^(POST|PUT|PATCH|DELETE)$/i.test(c.req.method) &&
      matchRoute(ts.routes, false)
    ) {
      const val = (await readBody())[ts.field || "cf-turnstile-response"];
      const ok = await verifyTurnstile(
        typeof val === "string" ? val : undefined,
        ts.secretKey ?? c.env?.TURNSTILE_SECRET_KEY,
        c.req.header("CF-Connecting-IP"),
      );
      if (!ok) {
        return (c.res = c.json({ success: false, error: "Turnstile verification failed" }, 400));
      }
    }

    // 5. Construction mode gate
    if (activeConfig.construction !== false && String(c.env?.CONSTRUCTION_MODE) === "true") {
      const cfg = {
        constructionPath: "/construction",
        cookieName: "rimelight-construction-guest",
        cookieMaxAge: 604800,
        ...(typeof activeConfig.construction === "object" ? activeConfig.construction : {}),
      };
      const cookieOpts = { httpOnly: true, secure: true, maxAge: cfg.cookieMaxAge };
      const secret = c.env?.CONSTRUCTION_PASSPHRASE;

      if (secret && c.req.query?.("preview") === secret) {
        setCookie(c, cfg.cookieName, secret, cookieOpts);
        return (c.res = c.redirect(path));
      }

      const isAuthed =
        (secret &&
          (c.req.raw?.headers
            ? getCookie(c, cfg.cookieName) === secret
            : c.req.header?.("cookie")?.includes(`${cfg.cookieName}=${secret}`))) ||
        /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
        (typeof cfg.whitelist === "function"
          ? cfg.whitelist(path)
          : cfg.whitelist?.some((w) =>
              typeof w === "string" ? path.startsWith(w) : w.test(path),
            )) ||
        (await cfg.isAuthorized?.(c));

      if (!isAuthed) {
        if (c.req.method === "POST" && path.includes(cfg.constructionPath)) {
          const b = await readBody();
          const get = (k: string) => {
            const v =
              typeof (b as { get?: (k: string) => unknown }).get === "function"
                ? (b as { get: (k: string) => unknown }).get(k)
                : b[k];
            return typeof v === "string" ? v : undefined;
          };
          const ok = Boolean(secret && get("passphrase") === secret);
          const to = get("redirect") ?? "/";
          if (ok) setCookie(c, cfg.cookieName, secret!, cookieOpts);
          return (c.res = c.redirect(
            ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`,
          ));
        }

        if (!path.includes(cfg.constructionPath)) {
          const search = reqUrl ? new URL(reqUrl).search : "";
          return (c.res = await (path.includes(".")
            ? c.notFound()
            : cfg.renderFallback
              ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
              : c.redirect(
                  `${cfg.constructionPath}?redirect=${encodeURIComponent(path + search)}`,
                )));
        }
      }
    }

    // 6. Execute downstream route handlers
    const downstream: unknown = await next();
    const res = downstream instanceof Response ? (c.res = downstream) : c.res;
    if (!res) return downstream as Response | void;

    const origin = reqUrl ? new URL(reqUrl).origin : undefined;
    const isHtml = (res.headers.get("content-type") || "").includes("text/html");
    const nonce =
      isHtml && !isDev
        ? btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))
        : undefined;

    // 7. Rewrite HTML (inject CSP nonce meta, Trusted Types, dev violation logger, and SRI)
    let target = res;
    if (isHtml && typeof HTMLRewriter !== "undefined") {
      const headHtml = [
        nonce ? `<meta name="csp-nonce" content="${nonce}">` : "",
        activeConfig.trustedTypes
          ? `<script${nonce ? ` nonce="${nonce}"` : ""}>(${(() => {
              const tt = (
                window as unknown as {
                  trustedTypes?: {
                    defaultPolicy?: unknown;
                    createPolicy: (n: string, r: object) => void;
                  };
                }
              ).trustedTypes;
              if (tt?.createPolicy && !tt.defaultPolicy) {
                try {
                  tt.createPolicy("default", {
                    createHTML: (s: string) => s,
                    createScript: (s: string) => s,
                    createScriptURL: (s: string) => s,
                  });
                } catch {}
              }
            }).toString()})()</script>`
          : "",
        isDev
          ? `<script>(${(() => {
              const seen = new Set<string>();
              window.addEventListener("securitypolicyviolation", (e) => {
                const key = `${e.effectiveDirective}:${e.blockedURI || e.sample || ""}`;
                if (e.disposition !== "report" || seen.has(key)) return;
                seen.add(key);
                console.warn(
                  `%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\nDirective: ${e.effectiveDirective}\n${e.blockedURI ? `Blocked URI: ${e.blockedURI}\n` : ""}${e.sourceFile ? `Source: ${e.sourceFile}:${e.lineNumber || 0}\n` : ""}${e.sample ? `Sample: ${e.sample.slice(0, 100)}\n` : ""}Fix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration`,
                  "background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
                  "color: inherit; font-weight: normal;",
                );
              });
            }).toString()})()</script>`
          : "",
      ].join("");

      const rewriter = new HTMLRewriter().on("head", {
        element: (el) => el.append(headHtml, { html: true }),
      });

      if (nonce) {
        const sri = (attr: string) => ({
          element(el: HTMLRewriterElement) {
            const url = el.getAttribute(attr);
            if (!url) return;
            const cached = activeConfig.manifest?.[url] ?? config?.manifest?.[url] ?? sriCache[url];
            const apply = (val?: string) => {
              if (val) {
                el.setAttribute("integrity", val);
                el.setAttribute("crossorigin", "anonymous");
              }
            };
            if (cached || process.env["NODE_ENV"] !== "production") return apply(cached);
            return (async () => {
              try {
                let assetRes: Response | undefined;
                if (url.startsWith("https://")) {
                  const u = new URL(url);
                  if (!u.hostname.includes("*") && !u.pathname.endsWith("/")) {
                    assetRes = await fetch(url);
                  }
                } else if (url.startsWith("/") && !url.startsWith("//") && origin) {
                  const assetUrl = new URL(url, origin);
                  assetRes = c.env?.ASSETS
                    ? await c.env.ASSETS.fetch(new Request(assetUrl))
                    : await fetch(assetUrl);
                }
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

        rewriter
          .on("script[src]", sri("src"))
          .on('link[rel="stylesheet"][href]', sri("href"))
          .on("script", { element: (el) => el.setAttribute("nonce", nonce) })
          .on("style", { element: (el) => el.setAttribute("nonce", nonce) });
      }

      target = rewriter.transform(res);
    }

    // 8. Build and apply security headers
    let cspOpts: SecurityConfig = activeConfig;
    let reportOnlyOpts: SecurityConfig | undefined;

    if (isHtml && isDev) {
      const devList = (val: string[] | string | boolean | undefined, fallback: string[]) =>
        val ? (Array.isArray(val) ? [...new Set([...val, "'unsafe-inline'"])] : val) : fallback;

      cspOpts = {
        ...activeConfig,
        directives: {
          ...activeConfig.directives,
          "default-src": false,
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https:",
            "http:",
            "ws:",
            "wss:",
          ],
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
          "connect-src": ["'self'", "ws:", "wss:", "http:", "https:"],
          "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
        },
      };

      reportOnlyOpts = {
        ...activeConfig,
        directives: {
          ...activeConfig.directives,
          "upgrade-insecure-requests": false,
          "script-src": devList(activeConfig.directives?.["script-src"], [
            "'self'",
            "'unsafe-inline'",
            "'inline-speculation-rules'",
            ...(activeConfig.scriptResources || []),
          ]),
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": devList(activeConfig.directives?.["style-src"], [
            "'self'",
            "'unsafe-inline'",
            ...(activeConfig.styleResources || []),
          ]),
        },
      };
    }

    const headers = new Headers(target.headers);
    for (const [k, v] of [
      ["Referrer-Policy", "strict-origin-when-cross-origin"],
      ["X-Content-Type-Options", "nosniff"],
      ["X-Frame-Options", "DENY"],
      ["X-XSS-Protection", "0"],
      ["Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"],
      ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
      ["No-Vary-Search", 'except=("q" "search" "locale"), params=?1'],
      [
        "Cross-Origin-Resource-Policy",
        cspOpts.crossOriginResourcePolicy !== false &&
          (cspOpts.crossOriginResourcePolicy || "same-origin"),
      ],
      [
        "Cross-Origin-Opener-Policy",
        cspOpts.crossOriginOpenerPolicy !== false &&
          (cspOpts.crossOriginOpenerPolicy || "same-origin"),
      ],
      [
        "Cross-Origin-Embedder-Policy",
        cspOpts.crossOriginEmbedderPolicy !== false &&
          (cspOpts.crossOriginEmbedderPolicy || "credentialless"),
      ],
      ["Content-Security-Policy", buildCspHeader(cspOpts, nonce)],
      ["Content-Security-Policy-Report-Only", reportOnlyOpts && buildCspHeader(reportOnlyOpts)],
      [
        "Link",
        origin &&
          [
            `<${origin}/sitemap-index.xml>; rel="sitemap"`,
            `<${origin}/llms.txt>; rel="llms"`,
            `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
            `<${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`,
          ].join(", "),
      ],
      ...Object.entries(cspOpts.headers || {}),
    ] as const) {
      if (v) headers.set(k, v);
    }

    const stripList =
      cspOpts.stripHeaders === false
        ? []
        : cspOpts.stripHeaders || ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"];
    for (const k of stripList) {
      headers.delete(k);
    }

    return (c.res = new Response(target.body, {
      status: target.status,
      statusText: target.statusText,
      headers,
    }));
  };
};

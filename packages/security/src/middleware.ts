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

const sriCache: Record<string, string | undefined> = {};

const getSri = (
  url: string,
  origin?: string,
  env?: SecurityEnv["Bindings"],
): string | Promise<string | undefined> | undefined => {
  const existing = activeConfig.manifest?.[url] ?? config?.manifest?.[url] ?? sriCache[url];
  if (existing || process.env["NODE_ENV"] !== "production") return existing;
  return (async () => {
    try {
      const res = url.startsWith("https://")
        ? !new URL(url).hostname.includes("*") && !new URL(url).pathname.endsWith("/")
          ? await fetch(url)
          : undefined
        : url.startsWith("/") && !url.startsWith("//") && origin
          ? env?.ASSETS
            ? await env.ASSETS.fetch(new Request(new URL(url, origin)))
            : await fetch(new URL(url, origin))
          : undefined;
      return res?.ok
        ? (sriCache[url] = `sha384-${btoa(
            String.fromCharCode(
              ...new Uint8Array(await crypto.subtle.digest("SHA-384", await res.arrayBuffer())),
            ),
          )}`)
        : undefined;
    } catch {
      return undefined;
    }
  })();
};

const matchRoute = (
  c: Context,
  routes?: (string | RegExp)[] | ((c: Context) => boolean),
  fallback = true,
) =>
  !routes
    ? fallback
    : typeof routes === "function"
      ? routes(c)
      : routes.some((r) => (typeof r === "string" ? c.req.path.startsWith(r) : r.test(c.req.path)));

const readBody = async (c: Context): Promise<Record<string, unknown>> => {
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

const applyHeaders = (
  res: Response,
  opts: SecurityConfig,
  origin?: string,
  nonce?: string,
  reportOnly?: SecurityConfig,
) => {
  const h = new Headers(res.headers);
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
      opts.crossOriginResourcePolicy !== false && (opts.crossOriginResourcePolicy || "same-origin"),
    ],
    [
      "Cross-Origin-Opener-Policy",
      opts.crossOriginOpenerPolicy !== false && (opts.crossOriginOpenerPolicy || "same-origin"),
    ],
    [
      "Cross-Origin-Embedder-Policy",
      opts.crossOriginEmbedderPolicy !== false &&
        (opts.crossOriginEmbedderPolicy || "credentialless"),
    ],
    ["Content-Security-Policy", buildCspHeader(opts, nonce)],
    [
      "Content-Security-Policy-Report-Only",
      reportOnly &&
        buildCspHeader(
          {
            ...reportOnly,
            directives: { ...reportOnly.directives, "upgrade-insecure-requests": false },
          },
          nonce,
        ),
    ],
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
    ...Object.entries(opts.headers || {}),
  ] as const) {
    if (v) h.set(k, v);
  }
  for (const k of opts.stripHeaders === false
    ? []
    : opts.stripHeaders || ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"]) {
    h.delete(k);
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
};

const gateRatelimit = async (c: Context<SecurityEnv>): Promise<Response | undefined> => {
  if (activeConfig.ratelimit === false) return;
  const rl = typeof activeConfig.ratelimit === "object" ? activeConfig.ratelimit : {};
  if (!matchRoute(c, rl.routes, true)) return;

  const limiter = rl.limiter
    ? rl.limiter(c)
    : (c.env?.[rl.bindingName || "MY_RATE_LIMITER"] as
        | { limit(o: { key: string }): Promise<{ success: boolean }> }
        | undefined);
  if (typeof limiter?.limit !== "function") {
    return rl.fallback && rl.fallback !== "pass"
      ? c.json({ error: "Rate limiter not configured" }, 500)
      : undefined;
  }
  try {
    const key = await (rl.keyGenerator?.(c) ?? (c.req.header("CF-Connecting-IP") || "unknown"));
    if ((await limiter.limit({ key })).success) return;
    const retry = rl.retryAfter ?? 60;
    return rl.onRateLimited
      ? await rl.onRateLimited(c, retry)
      : c.json(
          { error: "Too Many Requests", message: "Rate limit exceeded. Please try again later." },
          429,
          { "Retry-After": String(retry) },
        );
  } catch {
    return rl.fallback && rl.fallback !== "pass"
      ? c.json({ error: "Rate limit check failed" }, 500)
      : undefined;
  }
};

const gateTurnstile = async (c: Context<SecurityEnv>): Promise<Response | undefined> => {
  const ts = typeof activeConfig.turnstile === "object" ? activeConfig.turnstile : undefined;
  if (
    !ts?.routes ||
    !/^(POST|PUT|PATCH|DELETE)$/i.test(c.req.method) ||
    !matchRoute(c, ts.routes, false)
  )
    return;
  const val = (await readBody(c))[ts.field || "cf-turnstile-response"];
  const ok = await verifyTurnstile(
    typeof val === "string" ? val : undefined,
    ts.secretKey ?? c.env?.TURNSTILE_SECRET_KEY,
    c.req.header("CF-Connecting-IP"),
  );
  return ok ? undefined : c.json({ success: false, error: "Turnstile verification failed" }, 400);
};

const gateConstruction = async (c: Context<SecurityEnv>): Promise<Response | undefined> => {
  if (activeConfig.construction === false || String(c.env?.CONSTRUCTION_MODE) !== "true") return;
  const cfg = {
    constructionPath: "/construction",
    cookieName: "rimelight-construction-guest",
    cookieMaxAge: 604800,
    ...(typeof activeConfig.construction === "object" ? activeConfig.construction : {}),
  };
  const cookieOpts = { httpOnly: true, secure: true, maxAge: cfg.cookieMaxAge };
  const secret = c.env?.CONSTRUCTION_PASSPHRASE;
  const path = c.req.path;

  if (secret && c.req.query?.("preview") === secret) {
    setCookie(c, cfg.cookieName, secret, cookieOpts);
    return c.redirect(path);
  }
  if (
    (secret &&
      (c.req.raw?.headers
        ? getCookie(c, cfg.cookieName) === secret
        : c.req.header?.("cookie")?.includes(`${cfg.cookieName}=${secret}`))) ||
    /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
    (typeof cfg.whitelist === "function"
      ? cfg.whitelist(path)
      : cfg.whitelist?.some((w) => (typeof w === "string" ? path.startsWith(w) : w.test(path)))) ||
    (await cfg.isAuthorized?.(c))
  )
    return;

  if (c.req.method === "POST" && path.includes(cfg.constructionPath)) {
    const b = await readBody(c);
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
    return c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`);
  }
  if (path.includes(cfg.constructionPath)) return;

  const search = c.req.url || c.req.raw?.url ? new URL(c.req.url || c.req.raw.url).search : "";
  return path.includes(".")
    ? c.notFound()
    : cfg.renderFallback
      ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
      : c.redirect(`${cfg.constructionPath}?redirect=${encodeURIComponent(path + search)}`);
};

const buildHeadHtml = (isDev: boolean, nonce?: string) =>
  [
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

const rewriteHtml = (
  res: Response,
  isDev: boolean,
  origin?: string,
  env?: SecurityEnv["Bindings"],
  nonce?: string,
) => {
  if (typeof HTMLRewriter === "undefined") return res;
  const rewriter = new HTMLRewriter().on("head", {
    element: (el) => el.append(buildHeadHtml(isDev, nonce), { html: true }),
  });
  if (isDev || !nonce) return rewriter.transform(res);

  const sri = (attr: string) => ({
    element(el: HTMLRewriterElement) {
      const url = el.getAttribute(attr);
      const hash = url ? getSri(url, origin, env) : undefined;
      const apply = (val?: string) => {
        if (val) {
          el.setAttribute("integrity", val);
          el.setAttribute("crossorigin", "anonymous");
        }
      };
      return typeof hash === "string" || !hash ? apply(hash) : hash.then(apply);
    },
  });

  return rewriter
    .on("script[src]", sri("src"))
    .on('link[rel="stylesheet"][href]', sri("href"))
    .on("script", { element: (el) => el.setAttribute("nonce", nonce) })
    .on("style", { element: (el) => el.setAttribute("nonce", nonce) })
    .transform(res);
};

export const security = (): MiddlewareHandler<SecurityEnv> => async (c, next) => {
  const isDev = process.env["NODE_ENV"] === "development";
  const reqUrl = c.req.url || c.req.raw?.url;

  if (activeConfig.devOnly !== false && !isDev && c.req.path.startsWith("/dev"))
    return c.notFound();

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

  for (const gate of [gateRatelimit, gateTurnstile, gateConstruction]) {
    const blocked = await gate(c);
    if (blocked) return (c.res = blocked);
  }

  const downstream: unknown = await next();
  const res = downstream instanceof Response ? (c.res = downstream) : c.res;
  if (!res) return downstream as Response | void;

  const origin = reqUrl ? new URL(reqUrl).origin : undefined;
  if (!(res.headers.get("content-type") || "").includes("text/html")) {
    return (c.res = applyHeaders(res, activeConfig, origin));
  }

  if (isDev) {
    const devList = (val: string[] | string | boolean | undefined, fallback: string[]) =>
      val ? (Array.isArray(val) ? [...new Set([...val, "'unsafe-inline'"])] : val) : fallback;

    return (c.res = applyHeaders(
      rewriteHtml(res, true),
      {
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
      },
      origin,
      undefined,
      {
        ...activeConfig,
        directives: {
          ...activeConfig.directives,
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
      },
    ));
  }

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  return (c.res = applyHeaders(
    rewriteHtml(res, false, origin, c.env, nonce),
    activeConfig,
    origin,
    nonce,
  ));
};

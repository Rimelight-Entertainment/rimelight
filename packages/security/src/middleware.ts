import type { Context, MiddlewareHandler } from "hono";
import { setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { config } from "virtual:rimelight-security";
import type { SecurityConfig } from "./types";
import { buildCspHeader, activeConfig, verifyTurnstile } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

declare const HTMLRewriter: any;

export const TRUSTED_TYPES_SCRIPT = `(function(){var w=window;if(w.trustedTypes&&w.trustedTypes.createPolicy){try{if(!w.trustedTypes.defaultPolicy){w.trustedTypes.createPolicy("default",{createHTML:function(i){return i;},createScript:function(i){return i;},createScriptURL:function(i){return i;}});}}catch(e){}}})();`;

export const NONCE_SYNC_SCRIPT = `(function(){var w=window;if(!w.initialCspNonce){w.initialCspNonce=document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')||Array.from(document.querySelectorAll('script')).find(function(s){return s.nonce;})?.nonce||document.querySelector('script[nonce]')?.getAttribute('nonce')||document.querySelector('style[nonce]')?.getAttribute('nonce');}})();`;

export const DEV_REPORTER_SCRIPT = `(function(){var reported=new Set();window.addEventListener("securitypolicyviolation",function(e){if(e.disposition!=="report")return;var key=e.effectiveDirective+":"+(e.blockedURI||e.sample||"");if(reported.has(key))return;reported.add(key);console.warn("%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\\n"+"Directive: "+e.effectiveDirective+"\\n"+(e.blockedURI?"Blocked URI: "+e.blockedURI+"\\n":"")+(e.sourceFile?"Source: "+e.sourceFile+":"+(e.lineNumber||0)+"\\n":"")+(e.sample?"Sample: "+e.sample.slice(0,100)+"\\n":"")+"Fix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration","background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;","color: inherit; font-weight: normal;");});})();`;

const baseManifest: Record<string, string> =
  typeof config?.manifest === "object" && config.manifest !== null ? config.manifest : {};

const sriCache: Record<string, string> = {};
const sriInflight: Record<string, Promise<string | undefined>> = {};

export async function hashSriBuffer(buffer: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes =
    typeof buffer === "string"
      ? new TextEncoder().encode(buffer)
      : buffer instanceof Uint8Array
        ? buffer
        : new Uint8Array(buffer);
  const digest = await crypto.subtle.digest("SHA-384", bytes as BufferSource);
  return `sha384-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`;
}

async function resolveAssetSri(
  url: string,
  explicitManifest: Record<string, string>,
  origin?: string,
  env?: any,
): Promise<string | undefined> {
  if (explicitManifest[url]) return explicitManifest[url];
  if (baseManifest[url]) return baseManifest[url];
  if (sriCache[url]) return sriCache[url];

  if (url in sriInflight) return sriInflight[url];

  const promise = (async (): Promise<string | undefined> => {
    try {
      let res: Response | undefined;
      if (url.startsWith("https://")) {
        const parsed = new URL(url);
        if (
          parsed.hostname.includes("*") ||
          parsed.pathname === "/" ||
          parsed.pathname.endsWith("/")
        ) {
          return undefined;
        }
        res = await fetch(url);
      } else if (url.startsWith("/") && !url.startsWith("//")) {
        if (env?.ASSETS && typeof env.ASSETS.fetch === "function" && origin) {
          res = await env.ASSETS.fetch(new Request(new URL(url, origin)));
        } else if (origin) {
          res = await fetch(new URL(url, origin));
        }
      }
      if (!res || !res.ok) return undefined;
      const hash = await hashSriBuffer(await res.arrayBuffer());
      sriCache[url] = hash;
      return hash;
    } catch {
      return undefined;
    } finally {
      delete sriInflight[url];
    }
  })();

  sriInflight[url] = promise;
  return promise;
}

async function resolveActiveManifest(
  explicitManifest?: Record<string, string>,
  resources?: string[],
  origin?: string,
  env?: any,
): Promise<Record<string, string>> {
  const merged: Record<string, string> = {
    ...baseManifest,
    ...sriCache,
    ...explicitManifest,
  };

  const targetResources = Array.from(
    new Set([
      ...(resources || []),
      ...(activeConfig.resources || []),
      ...(activeConfig.scriptResources || []),
      ...(activeConfig.styleResources || []),
    ]),
  );

  if (targetResources.length > 0 && process.env["NODE_ENV"] !== "development") {
    await Promise.all(
      targetResources.map(async (url) => {
        if (!merged[url]) {
          const hash = await resolveAssetSri(url, merged, origin, env);
          if (hash) merged[url] = hash;
        }
      }),
    );
  }

  return merged;
}

function buildHeadTagsHtml(opts: SecurityConfig, isDev: boolean, nonce?: string): string {
  const nonceAttr = nonce ? ` nonce="${nonce}"` : "";
  const parts: string[] = [];

  if (nonce) {
    parts.push(`<meta name="csp-nonce" content="${nonce}">`);
  }
  if (opts.trustedTypes !== false) {
    parts.push(`<script${nonceAttr}>${TRUSTED_TYPES_SCRIPT}</script>`);
  }
  if (opts.nonceSync !== false) {
    parts.push(`<script${nonceAttr}>${NONCE_SYNC_SCRIPT}</script>`);
  }
  if (opts.devReporter ?? isDev) {
    parts.push(`<script${nonceAttr}>${DEV_REPORTER_SCRIPT}</script>`);
  }

  return parts.join("");
}

function matchesRoutes(
  c: Context,
  routes?: (string | RegExp)[] | ((c: Context) => boolean),
  defaultMatch = true,
): boolean {
  if (!routes) return defaultMatch;
  if (typeof routes === "function") return routes(c);
  const path = c.req.path;
  return routes.some((r) =>
    typeof r === "string" ? path.startsWith(r) || path === r : r.test(path),
  );
}

async function runRatelimit(c: Context): Promise<Response | undefined> {
  const raw = activeConfig.ratelimit;
  if (raw === false) return undefined;

  const options = typeof raw === "object" && raw !== null ? raw : {};
  const {
    bindingName = "MY_RATE_LIMITER",
    routes,
    retryAfter = 60,
    fallback = "pass",
    keyGenerator = (ctx: Context) => ctx.req.header("CF-Connecting-IP") || "unknown",
    onRateLimited = (ctx: Context, retry: number) =>
      ctx.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        429,
        { "Retry-After": String(retry) },
      ),
  } = options;

  if (!matchesRoutes(c, routes, true)) return undefined;

  const limiter = options.limiter ? options.limiter(c) : (c.env as any)?.[bindingName];
  if (!limiter || typeof limiter.limit !== "function") {
    if (fallback === "pass") return undefined;
    return c.json({ error: "Rate limiter not configured" }, 500);
  }

  try {
    const key = await keyGenerator(c);
    const { success } = await limiter.limit({ key });
    if (!success) return await onRateLimited(c, retryAfter);
  } catch {
    if (fallback !== "pass") return c.json({ error: "Rate limit check failed" }, 500);
  }

  return undefined;
}

async function runTurnstile(c: Context): Promise<Response | undefined> {
  const raw = activeConfig.turnstile;
  if (!raw || typeof raw !== "object") return undefined;

  const { field = "cf-turnstile-response", secretKey, routes } = raw;
  if (!routes || !matchesRoutes(c, routes, false)) return undefined;
  if (!/^(POST|PUT|PATCH|DELETE)$/i.test(c.req.method)) return undefined;

  const ct = (c.req.header("content-type") || "").toLowerCase();
  const cloned = c.req.raw?.clone ? c.req.raw.clone() : undefined;
  let body: any = {};

  if (ct.includes("form")) {
    body = cloned
      ? Object.fromEntries((await cloned.formData().catch(() => new FormData())).entries())
      : await c.req.parseBody?.().catch(() => ({}));
  } else {
    body = cloned ? await cloned.json().catch(() => ({})) : await c.req.json?.().catch(() => ({}));
  }

  const token = typeof body?.[field] === "string" ? body[field] : undefined;
  const ok = await verifyTurnstile(
    token,
    secretKey ?? (c.env as any)?.TURNSTILE_SECRET_KEY,
    c.req.header("CF-Connecting-IP"),
  );

  if (ok) return undefined;
  return c.json({ success: false, error: "Turnstile verification failed" }, 400);
}

async function runConstruction(c: Context): Promise<Response | undefined> {
  const raw = activeConfig.construction;
  if (raw === false || String((c.env as any)?.CONSTRUCTION_MODE) !== "true") return undefined;

  const cfg = {
    constructionPath: "/construction",
    cookieName: "rimelight-construction-guest",
    cookieMaxAge: 604800,
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  };

  const cookieOpts: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: cfg.cookieMaxAge,
  };

  const secret = (c.env as any)?.CONSTRUCTION_PASSPHRASE;
  const path = c.req.path;

  // 1. Preview link (?preview=secret) -> cookie & redirect
  if (secret && c.req.query?.("preview") === secret) {
    setCookie(c, cfg.cookieName, secret, cookieOpts);
    return c.redirect(path);
  }

  // 2. Cookie check, public assets, whitelist, or custom auth
  if (
    c.req.header("cookie")?.includes(`${cfg.cookieName}=${secret}`) ||
    /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
    (typeof cfg.whitelist === "function"
      ? cfg.whitelist(path)
      : cfg.whitelist?.some((w) => (typeof w === "string" ? path.startsWith(w) : w.test(path)))) ||
    (await cfg.isAuthorized?.(c))
  ) {
    return undefined;
  }

  // 3. Form password submitted on the construction page
  if (c.req.method === "POST" && path.includes(cfg.constructionPath)) {
    const b: any = await (c.req.parseBody?.() ?? c.req.formData?.() ?? c.req.json?.())?.catch(
      () => ({}),
    );
    const ok = Boolean(secret && (b?.passphrase ?? b?.get?.("passphrase")) === secret);
    const to = String(b?.redirect ?? b?.get?.("redirect") ?? "/");

    if (ok) setCookie(c, cfg.cookieName, secret!, cookieOpts);

    return c.redirect(ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`);
  }

  // 4. Render the construction page if already navigating it
  if (path.includes(cfg.constructionPath)) return undefined;

  // 5. 404 for asset files; otherwise serve fallback or redirect
  return path.includes(".")
    ? c.notFound()
    : cfg.renderFallback
      ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
      : c.redirect(
          `${cfg.constructionPath}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`,
        );
}

function applyHeaders(
  res: Response,
  opts: SecurityConfig,
  origin?: string,
  nonce?: string,
  reportOnly?: SecurityConfig,
): Response {
  const headers = new Headers(res.headers);
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "0");

  const blocked =
    opts.stripHeaders === false
      ? []
      : opts.stripHeaders || ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"];
  for (const h of blocked) headers.delete(h);

  if (opts.crossOriginResourcePolicy !== false) {
    headers.set(
      "Cross-Origin-Resource-Policy",
      typeof opts.crossOriginResourcePolicy === "string"
        ? opts.crossOriginResourcePolicy
        : "same-origin",
    );
  }
  if (opts.crossOriginOpenerPolicy !== false) {
    headers.set(
      "Cross-Origin-Opener-Policy",
      typeof opts.crossOriginOpenerPolicy === "string"
        ? opts.crossOriginOpenerPolicy
        : "same-origin",
    );
  }
  if (opts.crossOriginEmbedderPolicy !== false) {
    headers.set(
      "Cross-Origin-Embedder-Policy",
      typeof opts.crossOriginEmbedderPolicy === "string"
        ? opts.crossOriginEmbedderPolicy
        : "credentialless",
    );
  }

  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("No-Vary-Search", 'except=("q" "search" "locale"), params=?1');

  const csp = buildCspHeader(opts, nonce);
  if (csp) headers.set("Content-Security-Policy", csp);

  if (reportOnly) {
    const reportCsp = buildCspHeader(
      {
        ...reportOnly,
        directives: { ...reportOnly.directives, "upgrade-insecure-requests": false },
      },
      nonce,
    );
    if (reportCsp) headers.set("Content-Security-Policy-Report-Only", reportCsp);
  }

  if (origin) {
    headers.set(
      "Link",
      [
        `<${origin}/sitemap-index.xml>; rel="sitemap"`,
        `<${origin}/llms.txt>; rel="llms"`,
        `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
        `<${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`,
      ].join(", "),
    );
  }

  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) headers.set(k, v);
  }

  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/**
 * Unified Hono Security Pipeline orchestrating TLS, dev-only route protection, rate limiting,
 * Turnstile verification, construction gating, CSP headers, nonces, head scripts, and SRI injection.
 */
export const security = (): MiddlewareHandler => {
  return async (c, next) => {
    const isDev =
      process.env["NODE_ENV"] === "development" ||
      (import.meta.env?.DEV === true &&
        process.env["NODE_ENV"] !== "production" &&
        process.env["NODE_ENV"] !== "test");
    const isTest =
      !isDev && (import.meta.env?.MODE === "test" || process.env["NODE_ENV"] === "test");
    const isProd =
      !isDev &&
      (import.meta.env?.PROD === true || process.env["NODE_ENV"] === "production" || isTest);

    // 1. Block /dev routes in production if devOnly is enabled
    if (activeConfig.devOnly !== false && !isDev && c.req.path.startsWith("/dev")) {
      return c.notFound();
    }

    // 2. Enforce TLS 1.2+ and HTTPS upgrades
    const rawReq = c.req.raw as Request & { cf?: { tlsVersion?: string } };
    const cf = rawReq?.cf || (c.env as any)?.cf;
    const tls = cf?.tlsVersion;

    if (activeConfig.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
      return new Response("TLS 1.2 or higher is required.", { status: 400 });
    }

    if (isProd && rawReq?.headers?.get("x-forwarded-proto") === "http" && rawReq.url) {
      return Response.redirect(rawReq.url.replace(/^http:/, "https:"), 301);
    }

    // 3. Pre-handler security gates: Rate Limit -> Turnstile -> Construction
    for (const gate of [runRatelimit, runTurnstile, runConstruction]) {
      const early = await gate(c);
      if (early !== undefined) {
        if (early instanceof Response) c.res = early;
        return early;
      }
    }

    // 4. Execute downstream route handlers
    const downstream: any = await next();
    const res: Response | undefined = downstream instanceof Response ? downstream : c.res;
    if (downstream instanceof Response) c.res = downstream;
    if (!res) return downstream;

    const ct = res.headers.get("content-type") || "";
    const origin = rawReq?.url ? new URL(rawReq.url).origin : undefined;

    if (!ct.includes("text/html")) {
      c.res = applyHeaders(res, activeConfig, origin);
      return c.res;
    }

    // 5. Dev Mode HTML handling (relaxed CSP + Report-Only simulation + dev reporter head injection)
    if (isDev) {
      const devDirectives = {
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
      };

      const userScript = activeConfig.directives?.["script-src"];
      const reportScript = userScript
        ? Array.isArray(userScript)
          ? Array.from(new Set([...userScript, "'unsafe-inline'"]))
          : userScript
        : Array.from(
            new Set([
              "'self'",
              "'unsafe-inline'",
              "'inline-speculation-rules'",
              ...(activeConfig.scriptResources || []),
            ]),
          );

      const userStyle = activeConfig.directives?.["style-src"];
      const reportStyle = userStyle
        ? Array.isArray(userStyle)
          ? Array.from(new Set([...userStyle, "'unsafe-inline'"]))
          : userStyle
        : Array.from(
            new Set(["'self'", "'unsafe-inline'", ...(activeConfig.styleResources || [])]),
          );

      const reportOnlySimulation: SecurityConfig = {
        ...activeConfig,
        directives: {
          ...activeConfig.directives,
          "script-src": reportScript,
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": reportStyle,
        },
      };

      const headHtml = buildHeadTagsHtml(activeConfig, true);
      let transformedRes = res;
      if (typeof HTMLRewriter !== "undefined" && headHtml) {
        transformedRes = new HTMLRewriter()
          .on("head", {
            element(el: any) {
              el.append(headHtml, { html: true });
            },
          })
          .transform(res);
      }

      c.res = applyHeaders(
        transformedRes,
        { ...activeConfig, directives: devDirectives },
        origin,
        undefined,
        reportOnlySimulation,
      );
      return c.res;
    }

    // 6. Production HTML handling (128-bit nonce + SRI + Head Scripts via HTMLRewriter)
    const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
    const nonce = btoa(String.fromCharCode(...nonceBytes));
    const activeManifest = await resolveActiveManifest(
      activeConfig.manifest,
      activeConfig.resources,
      origin,
      c.env,
    );
    const headHtml = buildHeadTagsHtml(activeConfig, false, nonce);

    if (typeof HTMLRewriter !== "undefined") {
      const rewriter = new HTMLRewriter()
        .on("script[src]", {
          async element(el: any) {
            const src = el.getAttribute("src");
            if (!src) return;
            const integrity =
              activeManifest[src] ??
              (process.env["NODE_ENV"] === "production"
                ? await resolveAssetSri(src, activeManifest, origin, c.env)
                : undefined);
            if (integrity) {
              el.setAttribute("integrity", integrity);
              el.setAttribute("crossorigin", "anonymous");
            }
          },
        })
        .on('link[rel="stylesheet"][href]', {
          async element(el: any) {
            const href = el.getAttribute("href");
            if (!href) return;
            const integrity =
              activeManifest[href] ??
              (process.env["NODE_ENV"] === "production"
                ? await resolveAssetSri(href, activeManifest, origin, c.env)
                : undefined);
            if (integrity) {
              el.setAttribute("integrity", integrity);
              el.setAttribute("crossorigin", "anonymous");
            }
          },
        })
        .on("script", {
          element(el: any) {
            el.setAttribute("nonce", nonce);
          },
        })
        .on("style", {
          element(el: any) {
            el.setAttribute("nonce", nonce);
          },
        })
        .on("head", {
          element(el: any) {
            if (headHtml) {
              el.append(headHtml, { html: true });
            }
          },
        });

      c.res = applyHeaders(rewriter.transform(res), activeConfig, origin, nonce);
      return c.res;
    }

    c.res = applyHeaders(res, activeConfig, origin, nonce);
    return c.res;
  };
};

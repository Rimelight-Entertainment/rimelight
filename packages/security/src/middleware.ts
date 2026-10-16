import type { MiddlewareHandler } from "hono";
import { config as generatedConfig } from "virtual:rimelight-security";
import type { SecurityConfig } from "./types";
import {
  buildCspHeader,
  getSecurityConfig,
  isConstructionGuest,
  signInConstructionGuest,
  verifyTurnstile,
  getConstructionFallbackHtml,
  CONSTRUCTION_GUEST_COOKIE,
} from "./runtime";

export { isConstructionGuest, signInConstructionGuest, CONSTRUCTION_GUEST_COOKIE };

declare const HTMLRewriter: any;

const manifest: Record<string, string> =
  typeof generatedConfig?.manifest === "object" && generatedConfig.manifest !== null
    ? generatedConfig.manifest
    : {};

const isDevEnv = () =>
  process.env["NODE_ENV"] === "development" ||
  (import.meta.env?.DEV === true &&
    process.env["NODE_ENV"] !== "production" &&
    process.env["NODE_ENV"] !== "test");

/**
 * Hono middleware to block /dev/ routes in non-development environments.
 */
export const devOnly = (): MiddlewareHandler => async (c, next) => {
  if (!isDevEnv() && c.req.path.includes("/dev/")) return c.notFound();
  return next();
};

/**
 * Hono middleware for Cloudflare rate limiting on sensitive routes.
 */
export const ratelimit = (): MiddlewareHandler => {
  const raw = getSecurityConfig().ratelimit;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const {
    bindingName = "MY_RATE_LIMITER",
    routes = ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"],
    retryAfter = 60,
    fallback = "pass",
    keyGenerator = (c) => c.req.header("CF-Connecting-IP") || "unknown",
    onRateLimited = (c, retry) =>
      c.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        429,
        { "Retry-After": String(retry) },
      ),
  } = options;

  return async (c, next) => {
    const path = c.req.path;
    const matches =
      typeof routes === "function"
        ? routes(c)
        : routes.some((r: string | RegExp) =>
            typeof r === "string" ? path.includes(r) : r.test(path),
          );

    if (!matches) return next();

    const limiter = options.limiter ? options.limiter(c) : c.env?.[bindingName];
    if (!limiter || typeof limiter.limit !== "function") {
      if (fallback === "pass") return next();
      return c.json({ error: "Rate limiter not configured" }, 500);
    }

    try {
      const key = await keyGenerator(c);
      const { success } = await limiter.limit({ key });
      if (!success) return onRateLimited(c, retryAfter);
    } catch {
      if (fallback !== "pass") return c.json({ error: "Rate limit check failed" }, 500);
    }
    return next();
  };
};

/**
 * Hono middleware to verify Cloudflare Turnstile token from form body.
 */
export const turnstile = (): MiddlewareHandler => {
  const raw = getSecurityConfig().turnstile;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const { field = "cf-turnstile-response", ...verifyOptions } = options;

  return async (c, next) => {
    const ct = (c.req.header("content-type") || "").toLowerCase();
    const body: any = ct.includes("form")
      ? await c.req.parseBody().catch(() => ({}))
      : await c.req.json().catch(() => ({}));
    const token = body?.[field];

    const result = await verifyTurnstile({
      ...verifyOptions,
      token: typeof token === "string" ? token : undefined,
      env: c.env,
      remoteIp: c.req.header("CF-Connecting-IP"),
    });

    if (result.success) return next();

    return c.json({ success: false, error: result.error }, 400);
  };
};

const DEFAULT_WHITELIST = [
  "/construction",
  "/api/auth",
  "/api/construction-guest",
  "/assets/",
  "/_image",
  "/favicon.",
  "/apple-touch-icon",
  "/site.webmanifest",
  "manifest.json",
  ".webmanifest",
  "/robots.txt",
  "/sitemap",
  "/rss.xml",
  "/llms.txt",
  "/.well-known/",
];

/**
 * Hono middleware for site maintenance and construction mode gating.
 */
export const construction = (): MiddlewareHandler => {
  const raw = getSecurityConfig().construction;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const apiPath = options.apiPath !== undefined ? options.apiPath : "/api/construction-guest";
  const constructionPath = options.constructionPath ?? "/construction";

  return async (c, next) => {
    const path = c.req.path;
    const method = c.req.method.toUpperCase();
    const search = new URL(c.req.url).search;

    // Handle guest sign-in endpoint
    if (apiPath && path === apiPath && method === "POST") {
      try {
        const ct = (c.req.header("content-type") || "").toLowerCase();
        const isForm =
          ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");
        let passphrase = "";
        let rememberMe = true;
        let redirectUrl = "/";

        if (isForm) {
          const formData = await c.req.formData().catch(() => undefined);
          if (formData) {
            const pass = formData.get("passphrase");
            const rem = formData.get("rememberMe");
            const red = formData.get("redirect");
            passphrase = typeof pass === "string" ? pass : "";
            rememberMe = rem !== "false" && rem !== null;
            redirectUrl = typeof red === "string" ? red : "/";
          }
        } else {
          const body: any = await c.req.json().catch(() => ({}));
          passphrase = String(body?.["passphrase"] ?? "");
          rememberMe = body?.["rememberMe"] !== false;
          redirectUrl = String(body?.["redirect"] ?? "/");
        }

        const signedIn = await signInConstructionGuest(c, passphrase, rememberMe);
        if (isForm) {
          if (!signedIn) {
            const loc = options.getLocale ? options.getLocale(redirectUrl) : "en";
            const fallbackTarget = `${options.constructionPath ?? `/${loc}/construction`}?error=invalid&redirect=${encodeURIComponent(redirectUrl)}`;
            return c.redirect(fallbackTarget);
          }
          return c.redirect(redirectUrl);
        }

        if (!signedIn) return c.json({ error: "Invalid credentials" }, 401);
        return c.json({ success: true }, 200);
      } catch (err: any) {
        return c.json({ error: err?.message || "Authentication failed" }, 400);
      }
    }

    const envKey = options.modeEnvKey ?? "CONSTRUCTION_MODE";
    const enabled =
      c.env?.[envKey] === "true" ||
      c.env?.[envKey] === true ||
      (typeof process !== "undefined" &&
        (process.env[envKey] === "true" || (import.meta as any).env?.[envKey] === "true"));

    const locMatch = path.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)(\/|$)/);
    const locale = options.getLocale
      ? options.getLocale(path)
      : (options.locales?.find((l: string) => path === `/${l}` || path.startsWith(`/${l}/`)) ??
        locMatch?.[1]?.toLowerCase() ??
        "en");

    const accept = c.req.header("accept");
    const secFetchDest = c.req.header("sec-fetch-dest");
    const isDocNav =
      !/\.[a-z0-9]{2,8}$/i.test(path) &&
      (secFetchDest
        ? secFetchDest === "document" || secFetchDest === "iframe"
        : !accept || accept.includes("text/html"));

    const normPath = path.length > 1 ? path.replace(/\/+$/, "") : path;
    const normConstPath = constructionPath.startsWith("/")
      ? constructionPath.replace(/\/+$/, "")
      : "/" + constructionPath.replace(/\/+$/, "");
    const isConstPage =
      isDocNav && (normPath === normConstPath || normPath === `/${locale}${normConstPath}`);

    const isAuthorized = async (): Promise<boolean> =>
      (options.isAuthorized ? await options.isAuthorized(c) : false) ||
      (await isConstructionGuest(c));

    if (isConstPage) {
      return !enabled || (await isAuthorized()) ? c.redirect(`/${locale}`) : next();
    }

    if (!enabled || DEFAULT_WHITELIST.some((p) => path.includes(p))) return next();

    if (options.whitelist) {
      const match =
        typeof options.whitelist === "function"
          ? options.whitelist(path)
          : options.whitelist.some((p: string | RegExp) =>
              typeof p === "string" ? path.includes(p) : p.test(path),
            );
      if (match) return next();
    }

    if (await isAuthorized()) return next();

    if (!isDocNav) {
      return new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    const targetUrl = `/${locale}${constructionPath}?redirect=${encodeURIComponent(path + search)}`;
    if (options.onUnauthorized) {
      return options.onUnauthorized(c, { locale, path, redirectUrl: targetUrl });
    }

    if (options.renderFallback) {
      const html = getConstructionFallbackHtml({
        redirect: new URLSearchParams(search).get("redirect") || path || `/${locale}`,
        endpoint: typeof apiPath === "string" ? apiPath : "/api/construction-guest",
        error: search.includes("error=invalid") ? "invalid" : undefined,
      });
      return new Response(html, {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Retry-After": "3600",
        },
      });
    }

    return c.redirect(targetUrl);
  };
};

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
 * Hono Security Middleware orchestrating TLS, dev-only, rate limiting,
 * construction gating, CSP headers, nonces, and SRI injection with Cloudflare HTMLRewriter.
 */
export const security = (): MiddlewareHandler => {
  const pluginConfig = getSecurityConfig();
  const merged: SecurityConfig = {
    ...pluginConfig,
    strictDynamic: pluginConfig.strictDynamic ?? true,
    enforceTls: pluginConfig.enforceTls ?? true,
  };

  const sub = [
    pluginConfig.devOnly !== false && devOnly(),
    pluginConfig.ratelimit !== false && ratelimit(),
    pluginConfig.construction !== false && construction(),
  ].filter(Boolean) as MiddlewareHandler[];

  return async (c, next) => {
    const isDev = isDevEnv();
    const isTest =
      !isDev && (import.meta.env?.MODE === "test" || process.env["NODE_ENV"] === "test");
    const isProd =
      !isDev &&
      (import.meta.env?.PROD === true || process.env["NODE_ENV"] === "production" || isTest);

    const rawReq = c.req.raw as Request & { cf?: { tlsVersion?: string } };
    const cf = rawReq.cf || (c.env as any)?.cf;
    const tls = cf?.tlsVersion;

    if (merged.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
      return new Response("TLS 1.2 or higher is required.", { status: 400 });
    }

    if (isProd && rawReq.headers.get("x-forwarded-proto") === "http" && rawReq.url) {
      return Response.redirect(rawReq.url.replace(/^http:/, "https:"), 301);
    }

    const run = async (i: number): Promise<any> =>
      i < sub.length ? sub[i]!(c, () => run(i + 1)) : next();
    const early = await run(0);
    const res: Response | undefined = early instanceof Response ? early : c.res;
    if (early instanceof Response) c.res = early;
    if (!res) return early;

    const ct = res.headers.get("content-type") || "";
    const origin = rawReq.url ? new URL(rawReq.url).origin : undefined;

    if (!ct.includes("text/html")) {
      c.res = applyHeaders(res, merged, origin);
      return c.res;
    }

    if (isDev) {
      const devDirectives = {
        ...merged.directives,
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

      const userScript = merged.directives?.["script-src"];
      const reportScript = userScript
        ? Array.isArray(userScript)
          ? Array.from(new Set([...userScript, "'unsafe-inline'"]))
          : userScript
        : Array.from(
            new Set([
              "'self'",
              "'unsafe-inline'",
              "'inline-speculation-rules'",
              ...(merged.scriptResources || []),
            ]),
          );

      const userStyle = merged.directives?.["style-src"];
      const reportStyle = userStyle
        ? Array.isArray(userStyle)
          ? Array.from(new Set([...userStyle, "'unsafe-inline'"]))
          : userStyle
        : Array.from(new Set(["'self'", "'unsafe-inline'", ...(merged.styleResources || [])]));

      const reportOnlySimulation: SecurityConfig = {
        ...merged,
        directives: {
          ...merged.directives,
          "script-src": reportScript,
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": reportStyle,
        },
      };

      c.res = applyHeaders(
        res,
        { ...merged, directives: devDirectives },
        origin,
        undefined,
        reportOnlySimulation,
      );
      return c.res;
    }

    const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
    const nonce = btoa(String.fromCharCode(...nonceBytes));
    const activeManifest = { ...manifest, ...merged.manifest };

    if (typeof HTMLRewriter !== "undefined") {
      const rewriter = new HTMLRewriter()
        .on("script[src]", {
          element(el: any) {
            const src = el.getAttribute("src");
            if (src && activeManifest[src]) {
              el.setAttribute("integrity", activeManifest[src]);
              el.setAttribute("crossorigin", "anonymous");
            }
          },
        })
        .on('link[rel="stylesheet"][href]', {
          element(el: any) {
            const href = el.getAttribute("href");
            if (href && activeManifest[href]) {
              el.setAttribute("integrity", activeManifest[href]);
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
            el.append(`<meta name="csp-nonce" content="${nonce}">`, { html: true });
          },
        });

      c.res = applyHeaders(rewriter.transform(res), merged, origin, nonce);
      return c.res;
    }

    c.res = applyHeaders(res, merged, origin, nonce);
    return c.res;
  };
};

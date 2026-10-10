import generated from "virtual:rimelight-security";
import type { RimelightSecurityPluginOptions } from "./plugin";
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
  typeof generated?.manifest === "object" && generated.manifest !== null ? generated.manifest : {};

/**
 * Hono middleware to block /dev/ routes in non-development environments.
 */
export const devOnly =
  () =>
  async (c: any, next: () => Promise<any>): Promise<Response | void> => {
    const isDev =
      process.env["NODE_ENV"] === "development" ||
      (import.meta.env?.DEV === true &&
        process.env["NODE_ENV"] !== "production" &&
        process.env["NODE_ENV"] !== "test");

    if (!isDev && c.req?.path?.includes?.("/dev/")) {
      return typeof c.notFound === "function"
        ? c.notFound()
        : new Response("Not Found", { status: 404 });
    }
    return next();
  };

/**
 * Hono middleware for Cloudflare rate limiting on sensitive routes.
 */
export const ratelimit = () => {
  const raw = getSecurityConfig().ratelimit;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const {
    bindingName = "MY_RATE_LIMITER",
    routes = ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"],
    retryAfter = 60,
    fallback = "pass",
    keyGenerator = (c: any) =>
      (typeof c.req?.header === "function"
        ? c.req.header("CF-Connecting-IP") ||
          c.req.header("cf-connecting-ip") ||
          c.req.header("x-forwarded-for")
        : undefined) ||
      c.req?.raw?.headers?.get?.("cf-connecting-ip") ||
      c.req?.raw?.headers?.get?.("CF-Connecting-IP") ||
      "unknown",
    onRateLimited = (c: any, retry: number) => {
      if (typeof c.json === "function") {
        return c.json(
          {
            error: "Too Many Requests",
            message: "Rate limit exceeded. Please try again later.",
          },
          429,
          {
            "Retry-After": String(retry),
          },
        );
      }
      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retry),
          },
        },
      );
    },
  } = options;

  return async (c: any, next: () => Promise<any>): Promise<any> => {
    const path = c.req?.path || "";
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
      if (typeof c.json === "function")
        return c.json({ error: "Rate limiter not configured" }, 500);
      return new Response(JSON.stringify({ error: "Rate limiter not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const key = await keyGenerator(c);
      const { success } = await limiter.limit({ key });
      if (!success) return onRateLimited(c, retryAfter);
    } catch {
      if (fallback !== "pass") {
        if (typeof c.json === "function") return c.json({ error: "Rate limit check failed" }, 500);
        return new Response(JSON.stringify({ error: "Rate limit check failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return next();
  };
};

/**
 * Hono middleware to verify Cloudflare Turnstile token from form body.
 */
export const turnstile = () => {
  const raw = getSecurityConfig().turnstile;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const { field = "cf-turnstile-response", ...verifyOptions } = options;

  return async (c: any, next: () => Promise<any>): Promise<any> => {
    let body: any = {};
    if (typeof c.req?.parseBody === "function") {
      body = await c.req.parseBody().catch(() => ({}));
    } else if (typeof c.req?.json === "function") {
      body = await c.req.json().catch(() => ({}));
    }
    const token = body?.[field];

    const result = await verifyTurnstile({
      ...verifyOptions,
      token: typeof token === "string" ? token : undefined,
      env: c.env,
      remoteIp:
        typeof c.req?.header === "function"
          ? c.req.header("CF-Connecting-IP") || c.req.header("cf-connecting-ip")
          : c.req?.raw?.headers?.get?.("cf-connecting-ip"),
    });

    if (result.success) return next();

    const payload = { success: false, error: result.error };
    if (typeof c.json === "function") return c.json(payload, 400);
    return new Response(JSON.stringify(payload), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
export const construction = () => {
  const raw = getSecurityConfig().construction;
  const options = typeof raw === "object" && raw !== null ? raw : {};
  const apiPath = options.apiPath !== undefined ? options.apiPath : "/api/construction-guest";
  const constructionPath = options.constructionPath ?? "/construction";

  const resolveRedirect = (c: any, target: string) => {
    if (typeof c.redirect === "function") return c.redirect(target);
    const full = target.startsWith("http")
      ? target
      : new URL(target, c.req?.url || "http://localhost").toString();
    return Response.redirect(full, 302);
  };

  const getHeader = (c: any, name: string): string | undefined => {
    if (typeof c.req?.header === "function") {
      const val = c.req.header(name) || c.req.header(name.toLowerCase());
      if (val) return val;
    }
    return c.req?.raw?.headers?.get?.(name) || c.req?.raw?.headers?.get?.(name.toLowerCase());
  };

  return async (c: any, next: () => Promise<any>): Promise<any> => {
    const path: string = c.req?.path || new URL(c.req?.url || "http://localhost/").pathname || "/";
    const method: string = (c.req?.method || "GET").toUpperCase();
    const search: string = c.req?.url ? new URL(c.req.url).search : "";

    // Handle guest sign-in endpoint
    if (apiPath && path === apiPath && method === "POST") {
      try {
        const ct = (getHeader(c, "content-type") || "").toLowerCase();
        const isForm =
          ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");
        let passphrase = "";
        let rememberMe = true;
        let redirectUrl = "/";

        if (isForm) {
          let formData: any;
          if (typeof c.req?.parseBody === "function") {
            formData = await c.req.parseBody().catch(() => ({}));
            passphrase = String(formData["passphrase"] ?? "");
            rememberMe = formData["rememberMe"] !== "false" && formData["rememberMe"] !== false;
            redirectUrl = String(formData["redirect"] ?? "/");
          } else if (typeof c.req?.formData === "function") {
            formData = await c.req.formData().catch(() => undefined);
            if (formData) {
              passphrase = String(formData.get("passphrase") ?? "");
              rememberMe =
                formData.get("rememberMe") !== "false" && formData.get("rememberMe") !== null;
              redirectUrl = String(formData.get("redirect") ?? "/");
            }
          }
        } else {
          let body: any = {};
          if (typeof c.req?.json === "function") body = await c.req.json().catch(() => ({}));
          passphrase = String(body?.["passphrase"] ?? "");
          rememberMe = body?.["rememberMe"] !== false;
          redirectUrl = String(body?.["redirect"] ?? "/");
        }

        const signedIn = await signInConstructionGuest(c, passphrase, rememberMe);
        if (isForm) {
          if (!signedIn) {
            const loc = options.getLocale ? options.getLocale(redirectUrl) : "en";
            const fallbackTarget = `${options.constructionPath ?? `/${loc}/construction`}?error=invalid&redirect=${encodeURIComponent(redirectUrl)}`;
            return resolveRedirect(c, fallbackTarget);
          }
          return resolveRedirect(c, redirectUrl);
        }

        if (!signedIn) {
          return typeof c.json === "function"
            ? c.json({ error: "Invalid credentials" }, 401)
            : new Response('{"error":"Invalid credentials"}', {
                status: 401,
                headers: { "Content-Type": "application/json" },
              });
        }
        return typeof c.json === "function"
          ? c.json({ success: true }, 200)
          : new Response('{"success":true}', {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
      } catch (err: any) {
        if (typeof c.json === "function") {
          return c.json({ error: err?.message || "Authentication failed" }, 400);
        }
        return new Response(JSON.stringify({ error: err?.message || "Authentication failed" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
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

    const accept = getHeader(c, "accept");
    const secFetchDest = getHeader(c, "sec-fetch-dest");
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
      return !enabled || (await isAuthorized()) ? resolveRedirect(c, `/${locale}`) : next();
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

    return resolveRedirect(c, targetUrl);
  };
};

function applyHeaders(
  res: Response,
  opts: RimelightSecurityPluginOptions,
  origin?: string,
  nonce?: string,
  reportOnly?: RimelightSecurityPluginOptions,
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
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
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
 * Universal Hono Security Middleware orchestrating TLS, dev-only, rate limiting,
 * construction gating, CSP headers, nonces, and SRI injection with Cloudflare HTMLRewriter.
 */
export const security = () => {
  const pluginConfig = getSecurityConfig();
  const merged: RimelightSecurityPluginOptions = {
    ...pluginConfig,
    strictDynamic: pluginConfig.strictDynamic ?? true,
    enforceTls: pluginConfig.enforceTls ?? true,
  };

  const sub = [
    pluginConfig.devOnly !== false && devOnly(),
    pluginConfig.ratelimit !== false && ratelimit(),
    pluginConfig.construction !== false && construction(),
  ].filter(Boolean) as Array<(c: any, next: () => Promise<any>) => Promise<any>>;

  return async (c: any, next: any): Promise<Response | void> => {
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

    const rawReq = c.req?.raw || c.request;
    const cf = rawReq?.cf || c.req?.cf || c.env?.cf;
    const tls = cf?.tlsVersion;

    if (merged.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
      return new Response("TLS 1.2 or higher is required.", { status: 400 });
    }

    if (isProd && rawReq?.headers?.get?.("x-forwarded-proto") === "http" && rawReq?.url) {
      return Response.redirect(rawReq.url.replace(/^http:/, "https:"), 301);
    }

    const run = async (i: number): Promise<any> =>
      i < sub.length ? sub[i]!(c, () => run(i + 1)) : next();
    const early = await run(0);
    const res: Response | undefined = early instanceof Response ? early : c.res;
    if (early instanceof Response) c.res = early;
    if (!res) return early;

    const ct = res.headers.get("content-type") || "";
    const origin = rawReq?.url ? new URL(rawReq.url).origin : undefined;

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

      const reportOnlySimulation: RimelightSecurityPluginOptions = {
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

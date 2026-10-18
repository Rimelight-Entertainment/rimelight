import type { Context, MiddlewareHandler } from "hono";
import { setCookie } from "hono/cookie";
import { config } from "virtual:rimelight-security";
import type { SecurityConfig } from "./types";
import { buildCspHeader, activeConfig, verifyTurnstile } from "./runtime";
import { getConstructionFallbackHtml } from "./fallback";

declare const HTMLRewriter: any;

const initTrustedTypes = () => {
  const tt = (window as any).trustedTypes;
  if (tt?.createPolicy && !tt.defaultPolicy) {
    try {
      tt.createPolicy("default", {
        createHTML: (s: string) => s,
        createScript: (s: string) => s,
        createScriptURL: (s: string) => s,
      });
    } catch {}
  }
};

const initDevReporter = () => {
  const reported = new Set<string>();
  window.addEventListener("securitypolicyviolation", (e) => {
    const key = `${e.effectiveDirective}:${e.blockedURI || e.sample || ""}`;
    if (e.disposition !== "report" || reported.has(key)) return;
    reported.add(key);
    console.warn(
      `%c[Rimelight Security]%c Allowed in DEV, but will fail in PRODUCTION:\nDirective: ${e.effectiveDirective}\n${e.blockedURI ? `Blocked URI: ${e.blockedURI}\n` : ""}${e.sourceFile ? `Source: ${e.sourceFile}:${e.lineNumber || 0}\n` : ""}${e.sample ? `Sample: ${e.sample.slice(0, 100)}\n` : ""}Fix: Add to imgSrc, scriptResources, styleResources or use nonces in your security configuration`,
      "background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
      "color: inherit; font-weight: normal;",
    );
  });
};

const baseManifest: Record<string, string> =
  typeof config?.manifest === "object" && config.manifest !== null ? config.manifest : {};
const sriCache: Record<string, string> = {};
const sriInflight: Record<string, Promise<string | undefined>> = {};

const resolveAssetSri = (
  url: string,
  manifest: Record<string, string>,
  origin?: string,
  env?: any,
): Promise<string | undefined> | string | undefined =>
  manifest[url] ??
  baseManifest[url] ??
  sriCache[url] ??
  (sriInflight[url] ??= (async () => {
    try {
      const res = url.startsWith("https://")
        ? !new URL(url).hostname.includes("*") && !new URL(url).pathname.endsWith("/")
          ? await fetch(url)
          : undefined
        : url.startsWith("/") && !url.startsWith("//") && origin
          ? env?.ASSETS?.fetch
            ? await env.ASSETS.fetch(new Request(new URL(url, origin)))
            : await fetch(new URL(url, origin))
          : undefined;
      if (!res?.ok) return undefined;
      const digest = await crypto.subtle.digest("SHA-384", await res.arrayBuffer());
      return (sriCache[url] = `sha384-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`);
    } catch {
      return undefined;
    } finally {
      delete sriInflight[url];
    }
  })());

const matchesRoutes = (
  c: Context,
  routes?: (string | RegExp)[] | ((c: Context) => boolean),
  fallback = true,
) =>
  !routes
    ? fallback
    : typeof routes === "function"
      ? routes(c)
      : routes.some((r) => (typeof r === "string" ? c.req.path.startsWith(r) : r.test(c.req.path)));

const applyHeaders = (
  res: Response,
  opts: SecurityConfig,
  origin?: string,
  nonce?: string,
  reportOnly?: SecurityConfig,
) => {
  const h = new Headers(res.headers);
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "DENY");
  h.set("X-XSS-Protection", "0");
  h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  h.set("No-Vary-Search", 'except=("q" "search" "locale"), params=?1');

  for (const k of opts.stripHeaders === false
    ? []
    : opts.stripHeaders || ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"]) {
    h.delete(k);
  }

  for (const [header, val, def] of [
    ["Cross-Origin-Resource-Policy", opts.crossOriginResourcePolicy, "same-origin"],
    ["Cross-Origin-Opener-Policy", opts.crossOriginOpenerPolicy, "same-origin"],
    ["Cross-Origin-Embedder-Policy", opts.crossOriginEmbedderPolicy, "credentialless"],
  ] as const) {
    if (val !== false) h.set(header, typeof val === "string" ? val : def);
  }

  const csp = buildCspHeader(opts, nonce);
  if (csp) h.set("Content-Security-Policy", csp);

  if (reportOnly) {
    const reportCsp = buildCspHeader(
      {
        ...reportOnly,
        directives: { ...reportOnly.directives, "upgrade-insecure-requests": false },
      },
      nonce,
    );
    if (reportCsp) h.set("Content-Security-Policy-Report-Only", reportCsp);
  }

  if (origin) {
    h.set(
      "Link",
      [
        `<${origin}/sitemap-index.xml>; rel="sitemap"`,
        `<${origin}/llms.txt>; rel="llms"`,
        `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
        `<${origin}/rss.xml>; rel="alternate"; type="application/rss+xml"`,
      ].join(", "),
    );
  }

  for (const [k, v] of Object.entries(opts.headers || {})) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
};

/**
 * Unified Hono Security Pipeline orchestrating TLS, dev-only route protection, rate limiting,
 * Turnstile verification, construction gating, CSP headers, nonces, head scripts, and SRI injection.
 */
export const security = (): MiddlewareHandler => async (c, next) => {
  const isDev =
    process.env["NODE_ENV"] === "development" ||
    (import.meta.env?.DEV === true &&
      process.env["NODE_ENV"] !== "production" &&
      process.env["NODE_ENV"] !== "test");
  const isProd =
    !isDev &&
    (import.meta.env?.PROD === true ||
      process.env["NODE_ENV"] === "production" ||
      import.meta.env?.MODE === "test" ||
      process.env["NODE_ENV"] === "test");

  if (activeConfig.devOnly !== false && !isDev && c.req.path.startsWith("/dev")) {
    return c.notFound();
  }

  const rawReq = c.req.raw as Request & { cf?: { tlsVersion?: string } };
  const tls = (rawReq?.cf || (c.env as any)?.cf)?.tlsVersion;
  if (activeConfig.enforceTls && tls && tls !== "TLSv1.2" && tls !== "TLSv1.3") {
    return new Response("TLS 1.2 or higher is required.", { status: 400 });
  }
  if (isProd && rawReq?.headers?.get("x-forwarded-proto") === "http" && rawReq.url) {
    return Response.redirect(rawReq.url.replace(/^http:/, "https:"), 301);
  }

  // 1. Rate Limit Gate
  if (activeConfig.ratelimit !== false) {
    const rl = typeof activeConfig.ratelimit === "object" ? activeConfig.ratelimit : {};
    if (matchesRoutes(c, rl.routes, true)) {
      const limiter = rl.limiter
        ? rl.limiter(c)
        : (c.env as any)?.[rl.bindingName || "MY_RATE_LIMITER"];
      if (typeof limiter?.limit !== "function") {
        if (rl.fallback && rl.fallback !== "pass") {
          return (c.res = c.json({ error: "Rate limiter not configured" }, 500));
        }
      } else {
        try {
          const key = await (rl.keyGenerator
            ? rl.keyGenerator(c)
            : c.req.header("CF-Connecting-IP") || "unknown");
          if (!(await limiter.limit({ key })).success) {
            const retry = rl.retryAfter ?? 60;
            const res = rl.onRateLimited
              ? await rl.onRateLimited(c, retry)
              : c.json(
                  {
                    error: "Too Many Requests",
                    message: "Rate limit exceeded. Please try again later.",
                  },
                  429,
                  { "Retry-After": String(retry) },
                );
            return (c.res = res);
          }
        } catch {
          if (rl.fallback && rl.fallback !== "pass") {
            return (c.res = c.json({ error: "Rate limit check failed" }, 500));
          }
        }
      }
    }
  }

  // 2. Turnstile Gate
  const ts = typeof activeConfig.turnstile === "object" ? activeConfig.turnstile : undefined;
  if (
    ts?.routes &&
    /^(POST|PUT|PATCH|DELETE)$/i.test(c.req.method) &&
    matchesRoutes(c, ts.routes, false)
  ) {
    const cloned = c.req.raw?.clone?.();
    const body: any = (c.req.header("content-type") || "").toLowerCase().includes("form")
      ? cloned
        ? Object.fromEntries((await cloned.formData().catch(() => new FormData())).entries())
        : await c.req.parseBody?.().catch(() => ({}))
      : cloned
        ? await cloned.json().catch(() => ({}))
        : await c.req.json?.().catch(() => ({}));
    const field = ts.field || "cf-turnstile-response";
    const ok = await verifyTurnstile(
      typeof body?.[field] === "string" ? body[field] : undefined,
      ts.secretKey ?? (c.env as any)?.TURNSTILE_SECRET_KEY,
      c.req.header("CF-Connecting-IP"),
    );
    if (!ok)
      return (c.res = c.json({ success: false, error: "Turnstile verification failed" }, 400));
  }

  // 3. Construction Gate
  if (activeConfig.construction !== false && String((c.env as any)?.CONSTRUCTION_MODE) === "true") {
    const cfg = {
      constructionPath: "/construction",
      cookieName: "rimelight-construction-guest",
      cookieMaxAge: 604800,
      ...(typeof activeConfig.construction === "object" ? activeConfig.construction : {}),
    };
    const cookieOpts = { httpOnly: true, secure: true, maxAge: cfg.cookieMaxAge };
    const secret = (c.env as any)?.CONSTRUCTION_PASSPHRASE;
    const path = c.req.path;

    if (secret && c.req.query?.("preview") === secret) {
      setCookie(c, cfg.cookieName, secret, cookieOpts);
      return (c.res = c.redirect(path));
    }

    const authorized =
      c.req.header("cookie")?.includes(`${cfg.cookieName}=${secret}`) ||
      /^\/(_image|assets|@|favicon\.ico)/.test(path) ||
      (typeof cfg.whitelist === "function"
        ? cfg.whitelist(path)
        : cfg.whitelist?.some((w) =>
            typeof w === "string" ? path.startsWith(w) : w.test(path),
          )) ||
      (await cfg.isAuthorized?.(c));

    if (!authorized) {
      if (c.req.method === "POST" && path.includes(cfg.constructionPath)) {
        const b: any = await (c.req.parseBody?.() ?? c.req.formData?.() ?? c.req.json?.())?.catch(
          () => ({}),
        );
        const ok = Boolean(secret && (b?.passphrase ?? b?.get?.("passphrase")) === secret);
        const to = String(b?.redirect ?? b?.get?.("redirect") ?? "/");
        if (ok) setCookie(c, cfg.cookieName, secret!, cookieOpts);
        return (c.res = c.redirect(
          ok ? to : `${path}?error=invalid&redirect=${encodeURIComponent(to)}`,
        ));
      }
      if (!path.includes(cfg.constructionPath)) {
        return (c.res = await (path.includes(".")
          ? c.notFound()
          : cfg.renderFallback
            ? c.html(getConstructionFallbackHtml({ redirect: path }), 503)
            : c.redirect(
                `${cfg.constructionPath}?redirect=${encodeURIComponent(path + new URL(c.req.url).search)}`,
              )));
      }
    }
  }

  // 4. Downstream Execution
  const downstream: any = await next();
  const res: Response | undefined = downstream instanceof Response ? (c.res = downstream) : c.res;
  if (!res) return downstream;

  const origin = rawReq?.url ? new URL(rawReq.url).origin : undefined;
  if (!(res.headers.get("content-type") || "").includes("text/html")) {
    return (c.res = applyHeaders(res, activeConfig, origin));
  }

  const headTags = (nonce?: string) => {
    const attr = nonce ? ` nonce="${nonce}"` : "";
    return [
      nonce ? `<meta name="csp-nonce" content="${nonce}">` : "",
      activeConfig.trustedTypes ? `<script${attr}>(${initTrustedTypes.toString()})()</script>` : "",
      isDev ? `<script${attr}>(${initDevReporter.toString()})()</script>` : "",
    ].join("");
  };

  if (isDev) {
    const userScript = activeConfig.directives?.["script-src"];
    const userStyle = activeConfig.directives?.["style-src"];
    const html = headTags();
    return (c.res = applyHeaders(
      typeof HTMLRewriter !== "undefined" && html
        ? new HTMLRewriter()
            .on("head", { element: (el: any) => el.append(html, { html: true }) })
            .transform(res)
        : res,
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
          "script-src": userScript
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
              ),
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": userStyle
            ? Array.isArray(userStyle)
              ? Array.from(new Set([...userStyle, "'unsafe-inline'"]))
              : userStyle
            : Array.from(
                new Set(["'self'", "'unsafe-inline'", ...(activeConfig.styleResources || [])]),
              ),
        },
      },
    ));
  }

  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const manifest: Record<string, string> = {
    ...baseManifest,
    ...sriCache,
    ...activeConfig.manifest,
  };
  for (const url of new Set([
    ...(activeConfig.resources || []),
    ...(activeConfig.scriptResources || []),
    ...(activeConfig.styleResources || []),
  ])) {
    if (!manifest[url]) {
      const hash = await resolveAssetSri(url, manifest, origin, c.env);
      if (hash) manifest[url] = hash;
    }
  }

  const stampSri = (attr: string) => ({
    async element(el: any) {
      const val = el.getAttribute(attr);
      const integrity =
        val &&
        (manifest[val] ??
          (process.env["NODE_ENV"] === "production"
            ? await resolveAssetSri(val, manifest, origin, c.env)
            : undefined));
      if (integrity) {
        el.setAttribute("integrity", integrity);
        el.setAttribute("crossorigin", "anonymous");
      }
    },
  });

  const html = headTags(nonce);
  return (c.res = applyHeaders(
    typeof HTMLRewriter !== "undefined"
      ? new HTMLRewriter()
          .on("script[src]", stampSri("src"))
          .on('link[rel="stylesheet"][href]', stampSri("href"))
          .on("script", { element: (el: any) => el.setAttribute("nonce", nonce) })
          .on("style", { element: (el: any) => el.setAttribute("nonce", nonce) })
          .on("head", { element: (el: any) => html && el.append(html, { html: true }) })
          .transform(res)
      : res,
    activeConfig,
    origin,
    nonce,
  ));
};

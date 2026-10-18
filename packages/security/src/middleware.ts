import type { MiddlewareHandler } from "hono";
import { config } from "virtual:rimelight-security";
import type { SecurityConfig } from "./types";
import { fetchRemoteSriManifest } from "./sri";
import { buildCspHeader, activeConfig } from "./runtime";
import { ratelimit } from "./ratelimit";
import {
  construction,
  isConstructionGuest,
  signInConstructionGuest,
  CONSTRUCTION_GUEST_COOKIE,
} from "./construction";
import { turnstile } from "./turnstile";

export {
  ratelimit,
  construction,
  turnstile,
  isConstructionGuest,
  signInConstructionGuest,
  CONSTRUCTION_GUEST_COOKIE,
};

declare const HTMLRewriter: any;

const baseManifest: Record<string, string> =
  typeof config?.manifest === "object" && config.manifest !== null ? config.manifest : {};

let cachedRemoteManifest: Record<string, string> | null = null;
let remoteManifestPromise: Promise<Record<string, string>> | null = null;

async function resolveActiveManifest(
  explicitManifest?: Record<string, string>,
  resources?: string[],
): Promise<Record<string, string>> {
  const targetResources = Array.from(new Set(resources || config?.resources || []));

  if (targetResources.length > 0 && process.env["NODE_ENV"] !== "development") {
    if (!cachedRemoteManifest) {
      if (!remoteManifestPromise) {
        remoteManifestPromise = fetchRemoteSriManifest(targetResources).then((res) => {
          cachedRemoteManifest = res;
          return res;
        });
      }
      cachedRemoteManifest = await remoteManifestPromise;
    }
  }

  return {
    ...baseManifest,
    ...cachedRemoteManifest,
    ...explicitManifest,
  };
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
 * Hono Security Middleware orchestrating TLS, dev-only route protection, rate limiting,
 * construction gating, CSP headers, nonces, and SRI injection with Cloudflare HTMLRewriter.
 */
export const security = (): MiddlewareHandler => {
  const pluginConfig = activeConfig;
  const merged: SecurityConfig = {
    ...pluginConfig,
    strictDynamic: pluginConfig.strictDynamic ?? true,
    enforceTls: pluginConfig.enforceTls ?? true,
  };

  const sub = [
    pluginConfig.ratelimit !== false && ratelimit(),
    pluginConfig.construction !== false && construction(),
  ].filter(Boolean) as MiddlewareHandler[];

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

    // Block /dev routes in production if devOnly is enabled
    if (merged.devOnly !== false && !isDev && c.req.path.startsWith("/dev")) {
      return c.notFound();
    }

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
    const activeManifest = await resolveActiveManifest(merged.manifest, merged.resources);

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

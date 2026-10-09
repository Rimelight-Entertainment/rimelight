import type { SecurityOptions } from "../types";
import { buildCspHeader } from "../csp";
import { getSecurityConfig } from "../state";
import { devOnly } from "./dev-only";
import { ratelimit } from "./ratelimit";
import { construction } from "./construction";

import { manifest as sriManifest } from "#rimelight/security";

function isManifestRecord(obj: unknown): obj is Record<string, string> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

const manifest: Record<string, string> = isManifestRecord(sriManifest) ? sriManifest : {};

declare const HTMLRewriter: any;

function applySecurityHeaders(
  response: Response,
  options: SecurityOptions,
  origin?: string,
  nonce?: string,
  reportOnlyOptions?: SecurityOptions,
): Response {
  const cspHeader = buildCspHeader(options, nonce);
  const reportOnlyHeader = reportOnlyOptions
    ? buildCspHeader(
        {
          ...reportOnlyOptions,
          directives: { ...reportOnlyOptions.directives, "upgrade-insecure-requests": false },
        },
        nonce,
      )
    : undefined;

  const headers = new Headers(response.headers);
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "0");

  // Strip signature and fingerprinting headers
  const blockedHeaders =
    options.stripHeaders === false
      ? []
      : options.stripHeaders || ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"];
  for (const header of blockedHeaders) {
    headers.delete(header);
  }

  if (options.crossOriginResourcePolicy !== false) {
    headers.set(
      "Cross-Origin-Resource-Policy",
      typeof options.crossOriginResourcePolicy === "string"
        ? options.crossOriginResourcePolicy
        : "same-origin",
    );
  }

  if (options.crossOriginOpenerPolicy !== false) {
    headers.set(
      "Cross-Origin-Opener-Policy",
      typeof options.crossOriginOpenerPolicy === "string"
        ? options.crossOriginOpenerPolicy
        : "same-origin",
    );
  }

  if (options.crossOriginEmbedderPolicy !== false) {
    headers.set(
      "Cross-Origin-Embedder-Policy",
      typeof options.crossOriginEmbedderPolicy === "string"
        ? options.crossOriginEmbedderPolicy
        : "credentialless",
    );
  }

  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("No-Vary-Search", 'except=("q" "search" "locale"), params=?1');

  if (cspHeader) {
    headers.set("Content-Security-Policy", cspHeader);
  }

  if (reportOnlyHeader) {
    headers.set("Content-Security-Policy-Report-Only", reportOnlyHeader);
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

  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      headers.set(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Universal Security Middleware for Hono and Web Standards (Fetch API).
 *
 * Automatically orchestrates security sub-middlewares in optimal order:
 * 1. TLS 1.2+ and HTTPS enforcement
 * 2. Dev-only route protection (`/dev/` blocked in non-dev environments)
 * 3. Rate limiting on sensitive endpoints
 * 4. Construction / maintenance mode gating
 * 5. Security response headers, per-request CSP nonce, and SRI injection
 */
export function security() {
  const pluginConfig = getSecurityConfig();
  const mergedOptions: SecurityOptions = {
    ...pluginConfig,
    strictDynamic: pluginConfig.strictDynamic ?? true,
    enforceTls: pluginConfig.enforceTls ?? true,
  };

  const devOnlyMiddleware = pluginConfig.devOnly !== false ? devOnly() : null;
  const ratelimitMiddleware = pluginConfig.ratelimit !== false ? ratelimit() : null;
  const constructionMiddleware = pluginConfig.construction !== false ? construction() : null;

  const subMiddlewares: Array<(c: any, next: () => Promise<any>) => Promise<any>> = [];
  if (devOnlyMiddleware) subMiddlewares.push(devOnlyMiddleware);
  if (ratelimitMiddleware) subMiddlewares.push(ratelimitMiddleware);
  if (constructionMiddleware) subMiddlewares.push(constructionMiddleware);

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

    const req = c.req?.raw || c.request || c.req;
    const cf = req?.cf || c.req?.cf || c.env?.cf;
    const tlsVersion = cf?.tlsVersion;

    if (
      mergedOptions.enforceTls &&
      tlsVersion &&
      tlsVersion !== "TLSv1.2" &&
      tlsVersion !== "TLSv1.3"
    ) {
      return new Response("TLS 1.2 or higher is required.", { status: 400 });
    }

    const proto = req?.headers?.get("x-forwarded-proto");
    if (isProd && proto === "http" && req?.url) {
      const httpsUrl = req.url.replace(/^http:/, "https:");
      return Response.redirect(httpsUrl, 301);
    }

    const runPipeline = async (index: number): Promise<any> => {
      if (index < subMiddlewares.length) {
        return subMiddlewares[index]!(c, () => runPipeline(index + 1));
      }
      return next();
    };

    const pipelineResult = await runPipeline(0);

    // `c.res` auto-instantiates an empty 200 placeholder on its first read, so
    // reading it before consulting the pipeline shadows any Response a
    // sub-middleware returned early (the construction gate's redirect, a rate
    // limit 429, a dev-only 404) with a blank body. Prefer an explicit Response
    // from the pipeline; otherwise fall back to `c.res`, which the inner
    // dispatch commits once the chain reaches the terminal handler.
    const pipelineResponse = pipelineResult instanceof Response ? pipelineResult : undefined;
    const response: Response | undefined = pipelineResponse ?? c.res;
    if (pipelineResponse) {
      c.res = pipelineResponse;
    }

    if (!response) return pipelineResult;

    const contentType = response.headers.get("content-type") || "";
    const origin = req?.url ? new URL(req.url).origin : undefined;

    // For non-HTML responses (e.g. JSON API, static images), apply headers only
    if (!contentType.includes("text/html")) {
      c.res = applySecurityHeaders(response, mergedOptions, origin);
      return c.res;
    }

    // In dev mode, keep active CSP relaxed for Vite/Toolbar.
    // In Report-Only, enforce strict prod external origins (img-src, connect-src, frame-src)
    // while permitting dev-internal inline styles/scripts so the browser doesn't spam for Vite HMR.
    if (isDev) {
      const devDirectives: Record<string, string[] | boolean> = {
        ...mergedOptions.directives,
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

      // Prod simulation: check strict production directives in Report-Only mode
      // so any violation that will break in production emits a warning in dev.
      // We permit 'unsafe-inline' for scripts and styles in Report-Only simulation because in production
      // HTMLRewriter automatically injects nonces on all HTML tags, whereas in dev mode tags are un-nonced.
      const userScriptSrc = mergedOptions.directives?.["script-src"];
      const reportScriptSrc = userScriptSrc
        ? Array.isArray(userScriptSrc)
          ? Array.from(new Set([...userScriptSrc, "'unsafe-inline'"]))
          : userScriptSrc
        : Array.from(
            new Set([
              "'self'",
              "'unsafe-inline'",
              "'inline-speculation-rules'",
              ...(mergedOptions.scriptResources || []),
            ]),
          );

      const userStyleSrc = mergedOptions.directives?.["style-src"];
      const reportStyleSrc = userStyleSrc
        ? Array.isArray(userStyleSrc)
          ? Array.from(new Set([...userStyleSrc, "'unsafe-inline'"]))
          : userStyleSrc
        : Array.from(
            new Set(["'self'", "'unsafe-inline'", ...(mergedOptions.styleResources || [])]),
          );

      const reportOnlySimulation: SecurityOptions = {
        ...mergedOptions,
        directives: {
          ...mergedOptions.directives,
          "script-src": reportScriptSrc,
          "script-src-attr": ["'unsafe-inline'"],
          "style-src": reportStyleSrc,
        },
      };

      c.res = applySecurityHeaders(
        response,
        { ...mergedOptions, directives: devDirectives },
        origin,
        undefined,
        reportOnlySimulation,
      );
      return c.res;
    }

    // Generate dynamic per-request 128-bit Base64 nonce (W3C CSP & Cloudflare edge parser standard)
    const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
    const nonce = btoa(String.fromCharCode(...nonceBytes));

    // Use HTMLRewriter when available (Cloudflare Workers / Pages / Edge runtime)
    const activeManifest = { ...manifest, ...mergedOptions.manifest };

    if (typeof HTMLRewriter !== "undefined") {
      let rewriter = new HTMLRewriter();

      rewriter = rewriter
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

      c.res = applySecurityHeaders(rewriter.transform(response), mergedOptions, origin, nonce);
      return c.res;
    }

    c.res = applySecurityHeaders(response, mergedOptions, origin, nonce);
    return c.res;
  };
}

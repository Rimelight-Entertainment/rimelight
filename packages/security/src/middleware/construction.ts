import type { ConstructionOptions } from "../types";
import { getConstructionFallbackHtml } from "../construction/fallback";
import { getSecurityConfig } from "../runtime";

export const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest";

const DEFAULT_WHITELISTED_PATTERNS = [
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

const getPassphrase = (c: any, options?: ConstructionOptions): string | undefined => {
  if (options?.passphrase) return options.passphrase;
  const envKey = options?.passphraseEnvKey ?? "CONSTRUCTION_PASSPHRASE";
  return (
    c?.env?.[envKey] ??
    (typeof process !== "undefined" ? process.env?.[envKey] : undefined) ??
    (import.meta as any)?.env?.[envKey]
  );
};

const isModeEnabled = (c: any, options?: ConstructionOptions): boolean => {
  const envKey = options?.modeEnvKey ?? "CONSTRUCTION_MODE";
  const val =
    c?.env?.[envKey] ??
    (typeof process !== "undefined" ? process.env?.[envKey] : undefined) ??
    (import.meta as any)?.env?.[envKey];
  return val === "true" || val === true;
};

const encodeBase64Url = (value: Uint8Array): string =>
  btoa(String.fromCharCode(...value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const decodeBase64Url = (value: string): Uint8Array => {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const timingSafeEqual = async (a: string, b: string): Promise<boolean> => {
  const enc = new TextEncoder();
  const aHash = await crypto.subtle.digest("SHA-256", enc.encode(a));
  const bHash = await crypto.subtle.digest("SHA-256", enc.encode(b));
  const aBuf = new Uint8Array(aHash);
  const bBuf = new Uint8Array(bHash);
  if ((crypto.subtle as any).timingSafeEqual) {
    return (crypto.subtle as any).timingSafeEqual(aBuf, bBuf);
  }
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) {
    diff |= aBuf[i]! ^ bBuf[i]!;
  }
  return diff === 0;
};

const signHmac = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return {
    key,
    signature: await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
  };
};

const getContextHelpers = (c: any) => {
  const req = c.req?.raw || c.request || c.req;
  const urlObj =
    c.url instanceof URL ? c.url : req?.url ? new URL(req.url) : new URL("http://localhost/");
  const path: string = c.req?.path || urlObj.pathname || "/";
  const method: string = (c.req?.method || req?.method || "GET").toUpperCase();
  const search: string = c.req?.url ? new URL(c.req.url).search : urlObj.search || "";

  const redirect = (target: string) => {
    if (typeof c.redirect === "function") {
      return c.redirect(target);
    }
    const fullTarget = target.startsWith("http")
      ? target
      : new URL(target, urlObj.origin).toString();
    return Response.redirect(fullTarget, 302);
  };

  const json = (data: any, status = 200) => {
    if (typeof c.json === "function") {
      return c.json(data, status);
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };

  const getHeader = (name: string): string | undefined => {
    const lowered = name.toLowerCase();
    if (typeof c.req?.header === "function") {
      const viaHono = c.req.header(lowered);
      if (viaHono) return viaHono;
    }
    return c.req?.raw?.headers?.get?.(name) || c.request?.headers?.get?.(name) || undefined;
  };

  const getCookieValue = (name: string): string | undefined => {
    if (typeof c.req?.header === "function") {
      const headerVal = c.req.header("cookie");
      if (headerVal) {
        const match = headerVal.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
        if (match) return decodeURIComponent(match[1]);
      }
    }

    if (c.cookies?.get) {
      const val = c.cookies.get(name);
      return typeof val === "string" ? val : val?.value;
    }

    const cookieHeader = req?.headers?.get?.("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  const setCookieValue = (name: string, value: string, maxAge?: number) => {
    const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
    if (typeof maxAge === "number") {
      parts.push(`Max-Age=${maxAge}`);
    }
    const headerStr = parts.join("; ");

    if (typeof c.header === "function") {
      c.header("Set-Cookie", headerStr, { append: true });
    }

    if (c.cookies?.set) {
      c.cookies.set(name, value, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        ...(typeof maxAge === "number" ? { maxAge } : {}),
      });
    }

    if (c.res?.headers?.append) {
      c.res.headers.append("Set-Cookie", headerStr);
    }
  };

  return { path, method, search, redirect, json, getHeader, getCookieValue, setCookieValue };
};

/**
 * Distinguishes top-level document navigations from subresource requests (scripts, styles, images,
 * fetch/XHR). Only navigations may be redirected to the construction page: redirecting a
 * subresource makes the browser reject the HTML body on MIME type instead of a clean 404.
 */
const isDocumentNavigation = (
  getHeader: (name: string) => string | undefined,
  path: string,
): boolean => {
  // A path with a file extension is never a top-level page (e.g. a missing hashed chunk).
  if (/\.[a-z0-9]{2,8}$/i.test(path)) return false;

  const secFetchDest = getHeader("sec-fetch-dest");
  if (secFetchDest) return secFetchDest === "document" || secFetchDest === "iframe";

  const accept = getHeader("accept");
  // No request headers at all (non-browser clients, tests): keep the historical behaviour.
  if (!accept) return true;

  return accept.includes("text/html");
};

/**
 * Validates whether the incoming request carries a valid, signed construction guest cookie.
 */
export const isConstructionGuest = async (
  c: any,
  options?: ConstructionOptions,
): Promise<boolean> => {
  const rawConstruction = getSecurityConfig().construction;
  const opts: ConstructionOptions | undefined =
    options ??
    (typeof rawConstruction === "object" && rawConstruction !== null ? rawConstruction : undefined);
  const cookieName = opts?.cookieName ?? CONSTRUCTION_GUEST_COOKIE;
  const helpers = getContextHelpers(c);
  const token = helpers.getCookieValue(cookieName);
  const passphrase = getPassphrase(c, opts);
  if (!token || !passphrase) return false;

  try {
    const [encodedPayload, encodedSignature] = token.split(".");
    if (!encodedPayload || !encodedSignature) return false;

    const payload = new TextDecoder().decode(decodeBase64Url(encodedPayload));
    const { key } = await signHmac(payload, passphrase);
    const signatureBuffer = decodeBase64Url(encodedSignature);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer as unknown as BufferSource,
      new TextEncoder().encode(payload),
    );
    return valid && JSON.parse(payload).expiresAt > Date.now();
  } catch {
    return false;
  }
};

/**
 * Signs and sets the construction guest cookie on the Hono or Astro context.
 */
export const signInConstructionGuest = async (
  c: any,
  passphrase: string,
  rememberMe = true,
  options?: ConstructionOptions,
): Promise<boolean> => {
  const rawConstruction = getSecurityConfig().construction;
  const opts: ConstructionOptions | undefined =
    options ??
    (typeof rawConstruction === "object" && rawConstruction !== null ? rawConstruction : undefined);
  const expectedPassphrase = getPassphrase(c, opts);
  if (!expectedPassphrase || !passphrase) {
    return false;
  }

  const isMatch = await timingSafeEqual(passphrase, expectedPassphrase);
  if (!isMatch) {
    return false;
  }

  const cookieName = opts?.cookieName ?? CONSTRUCTION_GUEST_COOKIE;
  const maxAge = opts?.cookieMaxAge ?? 60 * 60 * 24 * 7; // 7 days

  const payload = JSON.stringify({
    expiresAt: Date.now() + maxAge * 1000,
  });

  const { signature } = await signHmac(payload, expectedPassphrase);
  const cookieValue =
    encodeBase64Url(new TextEncoder().encode(payload)) +
    "." +
    encodeBase64Url(new Uint8Array(signature));

  const helpers = getContextHelpers(c);
  helpers.setCookieValue(cookieName, cookieValue, rememberMe ? maxAge : undefined);

  return true;
};

const resolveLocale = (path: string, options?: ConstructionOptions): string => {
  if (options?.getLocale) {
    return options.getLocale(path);
  }
  if (options?.locales && options.locales.length > 0) {
    const matched = options.locales.find(
      (loc) => path === `/${loc}` || path.startsWith(`/${loc}/`),
    );
    if (matched) return matched;
  }
  // Auto-detection using RFC-5646 language tag pattern at path start (e.g. /en, /en-US, /pt)
  const match = path.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)(\/|$)/);
  return match?.[1]?.toLowerCase() ?? "en";
};

/**
 * Universal Construction Mode Middleware for Hono and Astro.
 *
 * Intercepts unauthenticated traffic when CONSTRUCTION_MODE is active, handles POST requests to the
 * guest auth endpoint automatically, and passes authenticated requests or whitelisted assets
 * cleanly.
 */
export function construction() {
  const rawConstruction = getSecurityConfig().construction;
  const options: ConstructionOptions =
    typeof rawConstruction === "object" && rawConstruction !== null ? rawConstruction : {};
  const apiPath = options.apiPath !== undefined ? options.apiPath : "/api/construction-guest";
  const constructionPath = options.constructionPath ?? "/construction";

  return async (c: any, next: any) => {
    const { path, method, search, redirect, json, getHeader } = getContextHelpers(c);

    // 1. Auto-handle API guest authentication endpoint
    if (apiPath && path === apiPath && method === "POST") {
      try {
        const contentType = (
          (typeof c.req?.header === "function" ? c.req.header("content-type") : undefined) ??
          c.req?.headers?.get?.("content-type") ??
          c.request?.headers?.get?.("content-type") ??
          ""
        ).toLowerCase();

        let passphrase = "";
        let rememberMe = true;
        let redirectUrl = "/";
        const isFormPost =
          contentType.includes("application/x-www-form-urlencoded") ||
          contentType.includes("multipart/form-data");

        if (isFormPost) {
          let formData: FormData | undefined;
          if (typeof c.req?.parseBody === "function") {
            const body = await c.req.parseBody().catch(() => ({}));
            passphrase = (body["passphrase"] as string) ?? "";
            rememberMe = body["rememberMe"] !== "false" && body["rememberMe"] !== false;
            redirectUrl = (body["redirect"] as string) ?? "/";
          } else if (typeof c.req?.formData === "function") {
            formData = await c.req.formData().catch(() => undefined);
          } else if (c.request && typeof c.request.formData === "function") {
            formData = await c.request.formData().catch(() => undefined);
          }

          if (formData) {
            const passVal = formData.get("passphrase");
            passphrase = typeof passVal === "string" ? passVal : "";
            const rememberVal = formData.get("rememberMe");
            rememberMe = rememberVal !== "false" && rememberVal !== null;
            const redirVal = formData.get("redirect");
            redirectUrl = typeof redirVal === "string" ? redirVal : "/";
          }
        } else {
          let body: any = {};
          if (typeof c.req?.json === "function") {
            body = await c.req.json().catch(() => ({}));
          } else if (c.request && typeof c.request.json === "function") {
            body = await c.request.json().catch(() => ({}));
          }
          passphrase = body?.passphrase ?? "";
          rememberMe = body?.rememberMe ?? true;
          redirectUrl = body?.redirect ?? "/";
        }

        const signedIn = await signInConstructionGuest(c, passphrase, rememberMe, options);

        if (isFormPost) {
          if (!signedIn) {
            const locale = resolveLocale(redirectUrl, options);
            const fallbackPath = options.constructionPath ?? `/${locale}/construction`;
            const errorTarget = `${fallbackPath}?error=invalid&redirect=${encodeURIComponent(redirectUrl)}`;
            return redirect(errorTarget);
          }
          return redirect(redirectUrl);
        }

        if (!signedIn) {
          return json({ error: "Invalid credentials" }, 401);
        }
        return json({ success: true });
      } catch (err: any) {
        return json({ error: err?.message || "Authentication failed" }, 400);
      }
    }

    const enabled = isModeEnabled(c, options);
    const locale = resolveLocale(path, options);
    const isDocNav = isDocumentNavigation(getHeader, path);

    const normalizedConstructionPath = constructionPath.startsWith("/")
      ? constructionPath.replace(/\/+$/, "")
      : "/" + constructionPath.replace(/\/+$/, "");
    const normalizedPath = path.length > 1 ? path.replace(/\/+$/, "") : path;

    const isConstructionPage =
      isDocNav &&
      (normalizedPath === normalizedConstructionPath ||
        normalizedPath === `/${locale}${normalizedConstructionPath}`);

    // Helper to check user authorization
    const isAuthorized = async (): Promise<boolean> => {
      if (options.isAuthorized) {
        const customAuth = await options.isAuthorized(c);
        if (customAuth) return true;
      }
      return await isConstructionGuest(c, options);
    };

    // 2. If user visits the construction page directly:
    if (isConstructionPage) {
      if (!enabled || (await isAuthorized())) {
        return redirect(`/${locale}`);
      }
      return next();
    }

    // 3. If construction mode is off, proceed normally
    if (!enabled) {
      return next();
    }

    // 4. Built-in and custom whitelist verification
    const isWhitelisted = DEFAULT_WHITELISTED_PATTERNS.some((pattern) => path.includes(pattern));
    if (isWhitelisted) {
      return next();
    }

    if (options.whitelist) {
      if (typeof options.whitelist === "function") {
        if (options.whitelist(path)) return next();
      } else if (Array.isArray(options.whitelist)) {
        const match = options.whitelist.some((pattern) =>
          typeof pattern === "string" ? path.includes(pattern) : pattern.test(path),
        );
        if (match) return next();
      }
    }

    // 5. Authorized users proceed
    if (await isAuthorized()) {
      return next();
    }

    // 5b. Subresource requests must never be redirected to the construction page. A .css/.js
    // request answered with text/html fails strict MIME checking and breaks hydration, so a
    // missing asset gets a plain 404 instead.
    if (!isDocNav) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    // 6. Redirect unauthorized users to construction page or serve fallback HTML
    const redirectTo = encodeURIComponent(path + search);
    const targetUrl = `/${locale}${constructionPath}?redirect=${redirectTo}`;

    if (options.onUnauthorized) {
      return options.onUnauthorized(c, {
        locale,
        path,
        redirectUrl: targetUrl,
      });
    }

    if (options.renderFallback) {
      const error = search.includes("error=invalid") ? "invalid" : undefined;
      const redirectTarget = new URLSearchParams(search).get("redirect") || path || `/${locale}`;
      const fallbackOpts = {
        redirect: redirectTarget,
        endpoint: typeof apiPath === "string" ? apiPath : "/api/construction-guest",
        ...(error ? { error } : {}),
      };
      const html = getConstructionFallbackHtml(fallbackOpts);
      return new Response(html, {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Retry-After": "3600",
        },
      });
    }

    return redirect(targetUrl);
  };
}

import {
  applyLocaleOverrides,
  defaultLocale,
  getLocale,
  kvBinding,
  localeFromPathname,
  locales,
  prefixDefaultLocale,
  setLocale,
  skipPaths,
  stripLocalePrefix,
} from "./runtime";

/** Static-asset suffix: a dot plus up to 8 alphanumerics at the end of the last path segment. */
const FILE_SUFFIX = /\.[A-Za-z0-9]{1,8}$/;

/**
 * Whether a path renders a localized page. Paths under the configured `skipPaths` and static
 * assets are excluded — they are never redirected and never read from KV.
 */
function isPagePath(pathname: string): boolean {
  if (skipPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }
  return !FILE_SUFFIX.test(pathname.slice(pathname.lastIndexOf("/") + 1));
}

/** Ranks an `Accept-Language` header and returns the first supported locale, else `fallback`. */
function getPreferredLocale(
  acceptLanguage: string | null,
  supported: readonly string[],
  fallback: string,
): string {
  if (!acceptLanguage) return fallback;

  const ranked = acceptLanguage
    .split(",")
    .map((entry) => {
      const [code = "", ...params] = entry.split(";");
      const normalized = code.trim().toLowerCase();
      const quality = /q=([\d.]+)/.exec(params.join(";"))?.[1];
      return {
        code: normalized,
        base: normalized.split("-")[0] ?? "",
        q: quality === undefined ? 1 : Number.parseFloat(quality),
      };
    })
    .toSorted((a, b) => b.q - a.q);

  for (const { code, base } of ranked) {
    if (supported.includes(code)) return code;
    if (supported.includes(base)) return base;
  }

  return fallback;
}

interface ResolvedRequest {
  /** True when the request renders a localized page — this is what gates the KV prefetch. */
  isPage: boolean;
  /** Redirect target for a 302, or null to serve the request as-is. */
  redirectTo: string | null;
}

/**
 * Parses a request once: applies the resolved locale and computes any redirect. Non-GET/HEAD
 * requests and non-page paths only resolve locale state, never redirect. All configuration
 * (locales, defaultLocale, prefixDefaultLocale, skipPaths) comes from the Vite plugin.
 */
function resolveRequest(request: Request): ResolvedRequest {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isPage = isPagePath(pathname);
  const segmentLocale = localeFromPathname(pathname, locales);

  // Non-GET/HEAD requests only resolve locale state, never redirect.
  if (request.method !== "GET" && request.method !== "HEAD") {
    setLocale(segmentLocale ?? defaultLocale);
    return { isPage, redirectTo: null };
  }
  if (!isPage) return { isPage, redirectTo: null };

  // All locales are prefixed (e.g. /en/about, /pt/about)
  if (prefixDefaultLocale) {
    if (segmentLocale) {
      setLocale(segmentLocale);
      return { isPage, redirectTo: null };
    }
    // Unprefixed path → redirect to the preferred locale
    const locale = getPreferredLocale(
      request.headers.get("accept-language"),
      locales,
      defaultLocale,
    );
    setLocale(locale);
    return { isPage, redirectTo: `/${locale}${pathname}${url.search}` };
  }

  // Only non-default locales are prefixed (e.g. /about, /pt/about)
  if (segmentLocale === defaultLocale) {
    // Strip the redundant default-locale prefix: /en/about → /about
    setLocale(defaultLocale);
    return { isPage, redirectTo: `/${stripLocalePrefix(pathname, locales)}${url.search}` };
  }

  // Non-default locale or no locale prefix → serve as-is
  setLocale(segmentLocale ?? defaultLocale);
  return { isPage, redirectTo: null };
}

/**
 * Fetch-standard locale resolution: inspects a request, updates the active locale, and returns
 * the URL the client should be redirected to (302), or null to serve the request as-is.
 */
export function resolveLocale(request: Request): string | null {
  return resolveRequest(request).redirectTo;
}

/**
 * The Hono context surface this middleware touches — a structural stand-in so the package stays
 * free of a Hono dependency.
 */
interface MiddlewareContext {
  req: { raw: Request };
  env?: any;
  redirect(path: string, status?: number): Response;
}

/** Structural stand-in for the Cloudflare KV namespace binding the worker injects. */
interface TranslationKV {
  get(key: string, opts?: { type: "json"; cacheTtl?: number }): Promise<unknown>;
}

/**
 * KV-first translation prefetch: reads the aggregate `locale:<locale>` key (edge-cached for 60s)
 * and layers it over the bundled translations before rendering, so `t()` serves KV values without
 * ever becoming async. Silently no-ops — bundled translations win — when the binding is missing,
 * unreadable, or the locale is unseeded.
 */
async function applyKvTranslations(c: MiddlewareContext): Promise<void> {
  const locale = getLocale();
  if (!locale) return;

  try {
    const kv = (c.env?.[kvBinding] ?? null) as TranslationKV | null;
    if (!kv) return;
    const overrides = await kv.get(`locale:${locale}`, { type: "json", cacheTtl: 60 });
    applyLocaleOverrides(locale, overrides);
  } catch {
    // KV unavailable → bundled translations
  }
}

/**
 * Hono middleware for Rimelight i18n. Resolves the request locale (redirecting when needed),
 * layers KV translation overrides over the bundled ones, then delegates to the handler. Takes no
 * options — locales, defaultLocale, prefixDefaultLocale, skipPaths, and kvBinding are all
 * configured once in the Vite plugin and read from `virtual:rimelight-i18n-config`.
 */
export function i18n() {
  return async (c: MiddlewareContext, next: () => Promise<void>): Promise<Response | void> => {
    const { isPage, redirectTo } = resolveRequest(c.req.raw);
    if (redirectTo) return c.redirect(redirectTo, 302);

    if (isPage) await applyKvTranslations(c);
    return next();
  };
}

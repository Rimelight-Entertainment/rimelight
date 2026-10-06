import {
  applyLocaleOverrides,
  currentLocale,
  defaultLocale as configDefaultLocale,
  localeFromPathname,
  locales as configLocales,
  prefixDefaultLocale as configPrefixDefaultLocale,
  stripLocalePrefix,
} from "./runtime";

export interface I18nMiddlewareOptions {
  /** Supported locale codes. Defaults to the configured Vite plugin locales. */
  locales?: string[];
  /** Default fallback locale code. Defaults to the configured Vite plugin default locale. */
  defaultLocale?: string;
  /** Whether the default locale is prefixed in URLs. Defaults to the configured Vite plugin setting. */
  prefixDefaultLocale?: boolean;
  /**
   * KV namespace binding holding runtime translation overrides (default: "TRANSLATIONS_KV").
   * Requests fall back to bundled translations when the binding is absent or the locale is
   * unseeded.
   */
  kvBinding?: string;
  /**
   * Path prefixes that never render a localized page: no locale redirect and no KV read. Matched
   * exactly or as a segment prefix (`/api` skips `/api` and `/api/users`, not `/apiflow`).
   * Defaults to API routes and framework internals: `["/api", "/_"]`.
   */
  skipPaths?: string[];
}

/** Static-asset suffix: a dot plus up to 8 alphanumerics at the end of the last path segment. */
const FILE_SUFFIX = /\.[A-Za-z0-9]{1,8}$/;

const DEFAULT_SKIP_PATHS = ["/api", "/_"];

/**
 * Whether a path renders a localized page. Paths under `skipPaths` and static assets are
 * excluded — they are never redirected and never read from KV.
 */
function isPagePath(pathname: string, skipPaths: readonly string[]): boolean {
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
 * Parses a request once: applies the resolved locale to `currentLocale` and computes any
 * redirect. Non-GET/HEAD requests and non-page paths only resolve locale state, never redirect.
 */
function resolveRequest(request: Request, options?: I18nMiddlewareOptions): ResolvedRequest {
  const supported = options?.locales ?? configLocales;
  const defaultLocale = options?.defaultLocale ?? configDefaultLocale;
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? configPrefixDefaultLocale;

  const url = new URL(request.url);
  const pathname = url.pathname;
  const isPage = isPagePath(pathname, options?.skipPaths ?? DEFAULT_SKIP_PATHS);
  const segmentLocale = localeFromPathname(pathname, supported);

  // Non-GET/HEAD requests only resolve locale state, never redirect.
  if (request.method !== "GET" && request.method !== "HEAD") {
    currentLocale.set(segmentLocale ?? defaultLocale);
    return { isPage, redirectTo: null };
  }
  if (!isPage) return { isPage, redirectTo: null };

  // All locales are prefixed (e.g. /en/about, /pt/about)
  if (prefixDefaultLocale) {
    if (segmentLocale) {
      currentLocale.set(segmentLocale);
      return { isPage, redirectTo: null };
    }
    // Unprefixed path → redirect to the preferred locale
    const locale = getPreferredLocale(
      request.headers.get("accept-language"),
      supported,
      defaultLocale,
    );
    currentLocale.set(locale);
    return { isPage, redirectTo: `/${locale}${pathname}${url.search}` };
  }

  // Only non-default locales are prefixed (e.g. /about, /pt/about)
  if (segmentLocale === defaultLocale) {
    // Strip the redundant default-locale prefix: /en/about → /about
    currentLocale.set(defaultLocale);
    return { isPage, redirectTo: `/${stripLocalePrefix(pathname, supported)}${url.search}` };
  }

  // Non-default locale or no locale prefix → serve as-is
  currentLocale.set(segmentLocale ?? defaultLocale);
  return { isPage, redirectTo: null };
}

/**
 * Fetch-standard locale resolution: inspects a request, updates `currentLocale`, and returns the
 * URL the client should be redirected to (302), or null to serve the request as-is.
 */
export function resolveLocale(request: Request, options?: I18nMiddlewareOptions): string | null {
  return resolveRequest(request, options).redirectTo;
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
async function applyKvTranslations(c: MiddlewareContext, binding: string): Promise<void> {
  const locale = currentLocale.get();
  if (!locale) return;

  try {
    const kv = (c.env?.[binding] ?? null) as TranslationKV | null;
    if (!kv) return;
    const overrides = await kv.get(`locale:${locale}`, { type: "json", cacheTtl: 60 });
    applyLocaleOverrides(locale, overrides);
  } catch {
    // KV unavailable → bundled translations
  }
}

/**
 * Hono middleware for Rimelight i18n. Resolves the request locale (redirecting when needed),
 * layers KV translation overrides over the bundled ones, then delegates to the handler.
 */
export function i18n(options?: I18nMiddlewareOptions) {
  const kvBinding = options?.kvBinding ?? "TRANSLATIONS_KV";

  return async (c: MiddlewareContext, next: () => Promise<void>): Promise<Response | void> => {
    const { isPage, redirectTo } = resolveRequest(c.req.raw, options);
    if (redirectTo) return c.redirect(redirectTo, 302);

    if (isPage) await applyKvTranslations(c, kvBinding);
    return next();
  };
}

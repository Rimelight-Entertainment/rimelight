import {
  currentLocale,
  defaultLocale as configDefaultLocale,
  localeFromPathname,
  locales as configLocales,
  prefixDefaultLocale as configPrefixDefaultLocale,
  stripLocalePrefix,
} from "./runtime";
import { setKVBinding } from "./kv";

export interface I18nMiddlewareOptions {
  /**
   * List of supported locale codes. Defaults to configured Vite plugin locales.
   */
  locales?: string[];
  /**
   * The default fallback locale code. Defaults to configured Vite plugin defaultLocale.
   */
  defaultLocale?: string;
  /**
   * Whether the default locale is prefixed in URLs. Defaults to configured Vite plugin setting.
   */
  prefixDefaultLocale?: boolean;
  /**
   * The Cloudflare KV namespace binding name (default: "TRANSLATIONS_KV").
   */
  kvBinding?: string;
}

function getPreferredLocale(
  acceptLanguage: string | null,
  supportedLocales: Set<string>,
  defaultLocale: string,
): string {
  if (!acceptLanguage) return defaultLocale;

  const parsed = acceptLanguage
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

  for (const { code, base } of parsed) {
    if (supportedLocales.has(code)) return code;
    if (supportedLocales.has(base)) return base;
  }

  return defaultLocale;
}

/**
 * Fetch-standard locale resolution: inspects a request, updates `currentLocale`, and returns the
 * URL the client should be redirected to (302), or null to serve the request as-is. Handles
 * GET/HEAD routing only — API routes, internal framework routes, and static assets always pass
 * through untouched.
 */
export function resolveLocale(request: Request, options?: I18nMiddlewareOptions): string | null {
  const supported = options?.locales ?? configLocales;
  const supportedLocales = new Set(supported);
  const defaultLocale = options?.defaultLocale ?? configDefaultLocale;
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? configPrefixDefaultLocale;

  const url = new URL(request.url);
  const pathname = url.pathname;
  const segmentLocale = localeFromPathname(pathname, supported);

  // Non-GET/HEAD requests only resolve locale state, never redirect.
  if (request.method !== "GET" && request.method !== "HEAD") {
    currentLocale.set(segmentLocale ?? defaultLocale);
    return null;
  }

  // Skip API routes, internal framework routes (Astro, SvelteKit, Next, Nuxt), and static assets.
  if (pathname.startsWith("/api") || pathname.startsWith("/_") || pathname.includes(".")) {
    return null;
  }

  // All locales are prefixed (e.g. /en/about, /pt/about)
  if (prefixDefaultLocale) {
    if (segmentLocale) {
      currentLocale.set(segmentLocale);
      return null;
    }
    // Unprefixed path → redirect to the preferred locale
    const locale = getPreferredLocale(
      request.headers.get("accept-language"),
      supportedLocales,
      defaultLocale,
    );
    currentLocale.set(locale);
    return `/${locale}${pathname}${url.search}`;
  }

  // Only non-default locales are prefixed (e.g. /about, /pt/about)
  if (segmentLocale === defaultLocale) {
    // Strip the redundant default-locale prefix: /en/about → /about
    currentLocale.set(defaultLocale);
    return `/${stripLocalePrefix(pathname, supported)}${url.search}`;
  }

  // Non-default locale or no locale prefix → serve as-is
  currentLocale.set(segmentLocale ?? defaultLocale);
  return null;
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

/**
 * Hono middleware for Rimelight i18n. Binds the worker KV namespace when present, then delegates
 * locale routing and redirects to the Fetch-standard `resolveLocale` core.
 */
export function i18n(options?: I18nMiddlewareOptions) {
  const kvKey = options?.kvBinding ?? "TRANSLATIONS_KV";

  return async (c: MiddlewareContext, next: () => Promise<void>): Promise<Response | void> => {
    try {
      const kv = c.env?.[kvKey];
      if (kv) {
        setKVBinding(kv);
      }
    } catch {
      // Ignore if env is not accessible
    }

    const redirectTo = resolveLocale(c.req.raw, options);
    if (redirectTo) return c.redirect(redirectTo, 302);
    return next();
  };
}

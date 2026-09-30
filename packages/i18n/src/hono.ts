import {
  locales as configLocales,
  defaultLocale as configDefaultLocale,
  prefixDefaultLocale as configPrefixDefaultLocale,
  setKVBinding
} from "./index";
import { currentLocale } from "./runtime";

export interface HonoI18nOptions {
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
  defaultLocale: string
): string {
  if (!acceptLanguage) return defaultLocale;

  const parsed = acceptLanguage
    .split(",")
    .map((lang) => {
      const parts = lang.split(";");
      const code = (parts[0] ?? "").trim().toLowerCase();
      const base = code.split("-")[0] ?? "";
      let q = 1.0;
      const qualityPart = parts[1];
      if (qualityPart) {
        const qMatch = qualityPart.match(/q=([0-9.]+)/);
        if (qMatch) {
          q = parseFloat(qMatch[1] ?? "1");
        }
      }
      return { code, base, q };
    })
    .toSorted((a, b) => b.q - a.q);

  for (const item of parsed) {
    if (supportedLocales.has(item.code)) {
      return item.code;
    }
    const base: string = item.base;
    if (supportedLocales.has(base)) {
      return base;
    }
  }

  return defaultLocale;
}

/**
 * Hono middleware for Rimelight i18n. Handles locale routing, redirection, currentLocale store
 * updates, and Cloudflare KV binding setup.
 */
export function i18n(options?: HonoI18nOptions) {
  const supportedLocales = new Set(options?.locales ?? configLocales);
  const defaultLocale = options?.defaultLocale ?? configDefaultLocale;
  const prefixDefaultLocale = options?.prefixDefaultLocale ?? configPrefixDefaultLocale;
  const kvKey = options?.kvBinding ?? "TRANSLATIONS_KV";

  return async (c: any, next: any) => {
    // 1. Initialize KV if available in Hono context or worker env
    try {
      const kv = c.env?.[kvKey];
      if (kv) {
        setKVBinding(kv);
      }
    } catch {
      // Ignore if env is not accessible
    }

    // 2. Execute routing & locale detection
    const url = new URL(c.req.url);
    const pathname = url.pathname;

    // Only handle GET/HEAD requests
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      const paramLocale = c.req.param("locale");
      const firstSegment = pathname.split("/").find(Boolean);
      const activeLocale =
        (paramLocale && supportedLocales.has(paramLocale) ? paramLocale : null) ||
        (firstSegment && supportedLocales.has(firstSegment) ? firstSegment : null) ||
        defaultLocale;
      currentLocale.set(activeLocale);
      return next();
    }

    // Skip API routes, internal framework routes (Astro, SvelteKit, Next, Nuxt), and static assets
    if (pathname.startsWith("/api") || pathname.startsWith("/_") || pathname.includes(".")) {
      return next();
    }

    const firstSegment = pathname.split("/").find(Boolean);
    const firstIsLocale = firstSegment !== undefined && supportedLocales.has(firstSegment);

    if (prefixDefaultLocale) {
      // All locales are prefixed (e.g. /en/about, /pt/about)
      const paramLocale = c.req.param("locale");
      const activeLocale =
        (paramLocale && supportedLocales.has(paramLocale) ? paramLocale : null) ||
        (firstIsLocale ? firstSegment! : null) ||
        defaultLocale;

      currentLocale.set(activeLocale);

      // If pathname already has a valid locale prefix, proceed
      if (firstIsLocale) {
        return next();
      }

      // Otherwise redirect to preferred locale
      const acceptLanguage = c.req.header("accept-language") || null;
      const locale = getPreferredLocale(acceptLanguage, supportedLocales, defaultLocale);
      currentLocale.set(locale);
      const targetPath = `/${locale}${pathname}${url.search}`;
      return c.redirect(targetPath, 302);
    } else {
      // Only non-default locales are prefixed (e.g. /about, /pt/about)
      if (firstIsLocale) {
        if (firstSegment === defaultLocale) {
          // Strip the redundant default-locale prefix: /en/about → /about
          const rest = pathname.slice(defaultLocale.length + 1) || "/";
          currentLocale.set(defaultLocale);
          return c.redirect(`${rest}${url.search}`, 302);
        }
        // Non-default locale — serve as-is
        currentLocale.set(firstSegment!);
        return next();
      }

      // No locale prefix → default locale, serve as-is
      currentLocale.set(defaultLocale);
      return next();
    }
  };
}

import {
  locales as configLocales,
  defaultLocale as configDefaultLocale,
  prefixDefaultLocale as configPrefixDefaultLocale,
} from "./config";
import { setKVBinding } from "./kv";
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
  defaultLocale: string,
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
    const firstSegment = pathname.split("/").find(Boolean);
    const segmentLocale =
      firstSegment !== undefined && supportedLocales.has(firstSegment) ? firstSegment : null;

    // Locale for the current request: explicit route param > URL prefix > default
    const resolveLocale = (): string => {
      const paramLocale = c.req.param("locale");
      if (paramLocale && supportedLocales.has(paramLocale)) return paramLocale;
      return segmentLocale ?? defaultLocale;
    };

    // Only handle GET/HEAD requests
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      currentLocale.set(resolveLocale());
      return next();
    }

    // Skip API routes, internal framework routes (Astro, SvelteKit, Next, Nuxt), and static assets
    if (pathname.startsWith("/api") || pathname.startsWith("/_") || pathname.includes(".")) {
      return next();
    }

    if (prefixDefaultLocale) {
      // All locales are prefixed (e.g. /en/about, /pt/about)
      const activeLocale = resolveLocale();
      currentLocale.set(activeLocale);

      // If pathname already has a valid locale prefix, proceed
      if (segmentLocale) {
        return next();
      }

      // Otherwise redirect to preferred locale
      const acceptLanguage = c.req.header("accept-language") || null;
      const locale = getPreferredLocale(acceptLanguage, supportedLocales, defaultLocale);
      currentLocale.set(locale);
      const targetPath = `/${locale}${pathname}${url.search}`;
      return c.redirect(targetPath, 302);
    }

    // Only non-default locales are prefixed (e.g. /about, /pt/about)
    if (segmentLocale) {
      if (firstSegment === defaultLocale) {
        // Strip the redundant default-locale prefix: /en/about → /about
        const rest = pathname.slice(defaultLocale.length + 1) || "/";
        currentLocale.set(defaultLocale);
        return c.redirect(`${rest}${url.search}`, 302);
      }
      // Non-default locale — serve as-is
      currentLocale.set(segmentLocale);
      return next();
    }

    // No locale prefix → default locale, serve as-is
    currentLocale.set(defaultLocale);
    return next();
  };
}

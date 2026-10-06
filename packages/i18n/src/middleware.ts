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

const FILE_SUFFIX = /\.[A-Za-z0-9]{1,8}$/;

function isPagePath(pathname: string): boolean {
  if (skipPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }
  return !FILE_SUFFIX.test(pathname.slice(pathname.lastIndexOf("/") + 1));
}

function getPreferredLocale(
  acceptLanguage: string | null,
  supported: readonly string[],
  fallback: string,
): string {
  if (!acceptLanguage) return fallback;

  const parsed = acceptLanguage
    .split(",")
    .map((entry) => {
      const [code = "", ...params] = entry.split(";");
      const normalized = code.trim().toLowerCase();
      const qMatch = /q=([\d.]+)/.exec(params.join(";"));
      return {
        code: normalized,
        base: normalized.split("-")[0] ?? "",
        q: qMatch?.[1] ? Number.parseFloat(qMatch[1]) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code, base } of parsed) {
    if (supported.includes(code)) return code;
    if (supported.includes(base)) return base;
  }

  return fallback;
}

function resolveLocaleAndRedirect(request: Request): {
  isPage: boolean;
  redirectTo: string | null;
} {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isPage = isPagePath(pathname);
  const segmentLocale = localeFromPathname(pathname, locales);
  const resolvedLocale = segmentLocale ?? defaultLocale;

  setLocale(resolvedLocale);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return { isPage, redirectTo: null };
  }
  if (!isPage) return { isPage, redirectTo: null };

  if (prefixDefaultLocale) {
    if (!segmentLocale) {
      const locale = getPreferredLocale(
        request.headers.get("accept-language"),
        locales,
        defaultLocale,
      );
      setLocale(locale);
      return { isPage, redirectTo: `/${locale}${pathname}${url.search}` };
    }
    return { isPage, redirectTo: null };
  }

  if (segmentLocale === defaultLocale) {
    return { isPage, redirectTo: `/${stripLocalePrefix(pathname, locales)}${url.search}` };
  }

  return { isPage, redirectTo: null };
}

export function resolveLocale(request: Request): string | null {
  return resolveLocaleAndRedirect(request).redirectTo;
}

interface MiddlewareContext {
  req: { raw: Request };
  env?: any;
  redirect(path: string, status?: number): Response;
}

interface TranslationKV {
  get(key: string, opts?: { type: "json"; cacheTtl?: number }): Promise<unknown>;
}

async function applyKvTranslations(c: MiddlewareContext): Promise<void> {
  const locale = getLocale();
  if (!locale) return;

  const kv = c.env?.[kvBinding] as TranslationKV | null;
  if (!kv) return;

  try {
    const overrides = await kv.get(`locale:${locale}`, { type: "json", cacheTtl: 60 });
    applyLocaleOverrides(locale, overrides);
  } catch {
    // KV unavailable → bundled translations
  }
}

export function i18n() {
  return async (c: MiddlewareContext, next: () => Promise<void>): Promise<Response | void> => {
    const { isPage, redirectTo } = resolveLocaleAndRedirect(c.req.raw);
    if (redirectTo) return c.redirect(redirectTo, 302);

    if (isPage) await applyKvTranslations(c);
    return next();
  };
}

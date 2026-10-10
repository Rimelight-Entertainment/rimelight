import {
  defaultLocale,
  localeFromPathname,
  locales,
  prefixDefaultLocale,
  setCurrentLocale,
  skipPaths,
  stripLocalePrefix,
} from "./locale";

const FILE_SUFFIX = /\.[A-Za-z0-9]{1,8}$/;

function isLocalizedPage(pathname: string): boolean {
  if (skipPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return false;
  return !FILE_SUFFIX.test(pathname.slice(pathname.lastIndexOf("/") + 1));
}

export function resolveLocale(request: Request): string | null {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const segmentLocale = localeFromPathname(pathname, locales);

  setCurrentLocale(segmentLocale ?? defaultLocale);

  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (!isLocalizedPage(pathname)) return null;

  if (prefixDefaultLocale) {
    if (!segmentLocale) {
      const header = request.headers.get("accept-language");
      let locale = defaultLocale;

      if (header) {
        for (const entry of header.split(",")) {
          const code = entry.split(";")[0]?.trim().toLowerCase();
          if (!code) continue;
          if (locales.includes(code)) {
            locale = code;
            break;
          }
          const base = code.split("-")[0];
          if (base && locales.includes(base)) {
            locale = base;
            break;
          }
        }
      }

      setCurrentLocale(locale);
      return `/${locale}${pathname}${url.search}`;
    }
    return null;
  }

  if (segmentLocale === defaultLocale) {
    return `/${stripLocalePrefix(pathname, locales)}${url.search}`;
  }

  return null;
}

export function i18n() {
  return async (
    c: { req: { raw: Request }; redirect(path: string, status?: number): Response },
    next: () => Promise<void>,
  ): Promise<Response | void> => {
    const redirectTo = resolveLocale(c.req.raw);
    if (redirectTo) return c.redirect(redirectTo, 302);

    return next();
  };
}

import { config, localeFromPathname, setCurrentLocale, stripLocalePrefix } from "./locale";

const isLocalizedPage = (p: string) =>
  !config.skipPaths.some((s) => p === s || p.startsWith(`${s}/`)) &&
  !/\.[A-Za-z0-9]{1,8}$/.test(p.slice(p.lastIndexOf("/") + 1));

const matchAcceptLanguage = (header: string | null): string | undefined => {
  if (!header) return undefined;
  for (const entry of header.split(",")) {
    const code = entry.split(";")[0]?.trim().toLowerCase();
    if (!code) continue;
    const match = config.locales.find((l) => l === code || l === code.split("-")[0]);
    if (match) return match;
  }
  return undefined;
};

export const resolveLocale = (request: Request): string | null => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const segmentLocale = localeFromPathname(pathname);

  setCurrentLocale(segmentLocale ?? config.defaultLocale);

  if ((request.method !== "GET" && request.method !== "HEAD") || !isLocalizedPage(pathname)) {
    return null;
  }

  if (config.prefixDefaultLocale) {
    if (!segmentLocale) {
      const locale =
        matchAcceptLanguage(request.headers.get("accept-language")) ?? config.defaultLocale;
      setCurrentLocale(locale);
      return `/${locale}${pathname}${url.search}`;
    }
    return null;
  }

  if (segmentLocale === config.defaultLocale) {
    const clean = stripLocalePrefix(pathname);
    return `${clean || "/"}${url.search}`;
  }

  return null;
};

export const i18n =
  () =>
  async (
    c: { req: { raw: Request }; redirect(path: string, status?: number): Response },
    next: () => Promise<void>,
  ): Promise<Response | void> => {
    const redirectTo = resolveLocale(c.req.raw);
    return redirectTo ? c.redirect(redirectTo, 302) : next();
  };

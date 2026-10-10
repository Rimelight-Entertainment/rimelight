import { config, setCurrentLocale } from "./runtime";

export const resolveLocale = (request: Request): string | null => {
  const { pathname, search } = new URL(request.url);
  const segmentLocale = config.locales.find(
    (locale) => locale.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
  );

  setCurrentLocale(segmentLocale ?? config.defaultLocale);

  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    config.skipPaths.some((skip) => pathname === skip || pathname.startsWith(`${skip}/`)) ||
    /\.[A-Za-z0-9]{1,8}$/.test(pathname.slice(pathname.lastIndexOf("/") + 1))
  ) {
    return null;
  }

  if (config.prefixDefaultLocale && !segmentLocale) {
    const preferredLocale =
      request.headers
        .get("accept-language")
        ?.split(",")
        .map((entry) => {
          const code = entry.split(";")[0]?.trim().toLowerCase();
          return config.locales.find((locale) => locale === code || locale === code?.split("-")[0]);
        })
        .find(Boolean) ?? config.defaultLocale;

    setCurrentLocale(preferredLocale);
    return `/${preferredLocale}${pathname}${search}`;
  }

  if (!config.prefixDefaultLocale && segmentLocale === config.defaultLocale) {
    return `${pathname.slice(segmentLocale.length + 1) || "/"}${search}`;
  }

  return null;
};

export const i18n =
  () =>
  async (
    context: { req: { raw: Request }; redirect(path: string, status?: number): Response },
    next: () => Promise<void>,
  ) => {
    const redirectTo = resolveLocale(context.req.raw);
    return redirectTo ? context.redirect(redirectTo, 302) : next();
  };

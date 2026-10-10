import { config, setCurrentLocale } from "./runtime";

export const i18n =
  () =>
  async (
    context: { req: { raw: Request }; redirect(path: string, status?: number): Response },
    next: () => Promise<void>,
  ) => {
    const { method, headers, url } = context.req.raw;
    const { pathname, search } = new URL(url);
    const segmentLocale = config.locales.find(
      (locale) => locale.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
    );

    setCurrentLocale(segmentLocale ?? config.defaultLocale);

    if (
      (method !== "GET" && method !== "HEAD") ||
      config.skipPaths.some((skip) => pathname === skip || pathname.startsWith(`${skip}/`)) ||
      /\/[^/]+\.[A-Za-z0-9]{1,8}$/.test(pathname)
    ) {
      return next();
    }

    if (config.prefixDefaultLocale && !segmentLocale) {
      const preferredLocale =
        headers
          .get("accept-language")
          ?.split(",")
          .map((entry) => entry.split(";")[0]?.trim().toLowerCase())
          .flatMap((code) =>
            config.locales.filter((locale) => locale === code || locale === code?.split("-")[0]),
          )[0] ?? config.defaultLocale;

      setCurrentLocale(preferredLocale);
      return context.redirect(`/${preferredLocale}${pathname}${search}`, 302);
    }

    if (!config.prefixDefaultLocale && segmentLocale === config.defaultLocale) {
      return context.redirect(`${pathname.slice(segmentLocale.length + 1) || "/"}${search}`, 302);
    }

    return next();
  };

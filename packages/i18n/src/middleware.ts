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

    const preferredLocale =
      segmentLocale ??
      headers
        .get("accept-language")
        ?.split(",")
        .map((entry) => entry.split(";")[0]?.trim().toLowerCase())
        .map((code) =>
          config.locales.find((locale) => locale === code || locale === code?.split("-")[0]),
        )
        .find(Boolean) ??
      config.defaultLocale;

    setCurrentLocale(preferredLocale);

    const isLocalized =
      (method === "GET" || method === "HEAD") &&
      !config.skipPaths.some((skip) => `${pathname}/`.startsWith(`${skip}/`)) &&
      !/\.[a-z0-9]{1,8}$/i.test(pathname);

    const redirectPath =
      isLocalized && config.prefixDefaultLocale && !segmentLocale
        ? `/${preferredLocale}${pathname}${search}`
        : isLocalized && !config.prefixDefaultLocale && segmentLocale === config.defaultLocale
          ? `${pathname.slice(segmentLocale.length + 1) || "/"}${search}`
          : null;

    return redirectPath ? context.redirect(redirectPath, 302) : next();
  };

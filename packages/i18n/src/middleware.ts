import { config, setCurrentLocale } from "./runtime";

export const i18n =
  () =>
  async (
    context: { req: { raw: Request }; redirect(path: string, status?: number): Response },
    next: () => Promise<void>,
  ) => {
    const { method, headers, url } = context.req.raw;
    const { pathname, search } = new URL(url);

    const segment = pathname.split("/")[1]?.toLowerCase();
    const segmentLocale = config.locales.find((l) => l.toLowerCase() === segment);

    const preferredLocale =
      segmentLocale ??
      headers
        .get("accept-language")
        ?.split(",")
        .flatMap((e) => {
          const code = e.split(";")[0]?.trim().toLowerCase();
          return config.locales.find((l) => l === code || l === code?.split("-")[0]) ?? [];
        })[0] ??
      config.defaultLocale;

    setCurrentLocale(preferredLocale);

    const isLocalized =
      /^(GET|HEAD)$/i.test(method) &&
      !config.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
      !/\.[a-z0-9]{1,8}$/i.test(pathname);

    const target =
      config.prefixDefaultLocale && !segmentLocale
        ? `/${preferredLocale}${pathname}`
        : !config.prefixDefaultLocale && segmentLocale === config.defaultLocale
          ? pathname.slice(segmentLocale.length + 1) || "/"
          : null;

    return isLocalized && target ? context.redirect(`${target}${search}`, 302) : next();
  };

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

    const accept = headers.get("accept-language")?.split(",") ?? [];
    const preferredLocale =
      segmentLocale ??
      accept.flatMap((e) => {
        const [tag] = e.trim().toLowerCase().split(";");
        return config.locales.find((l) => l === tag || l === tag?.split("-")[0]) ?? [];
      })[0] ??
      config.defaultLocale;

    setCurrentLocale(preferredLocale);

    const isLocalized =
      /^(GET|HEAD)$/i.test(method) &&
      !config.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
      !/\.[a-z0-9]{1,8}$/i.test(pathname);

    const target = config.prefixDefaultLocale
      ? !segmentLocale && `/${preferredLocale}${pathname}`
      : segmentLocale === config.defaultLocale && (pathname.slice(segmentLocale.length + 1) || "/");

    return isLocalized && target ? context.redirect(`${target}${search}`, 302) : next();
  };

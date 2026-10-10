import { config, setCurrentLocale } from "./runtime";

export const i18n =
  () =>
  async (
    context: { req: { raw: Request }; redirect(path: string, status?: number): Response },
    next: () => Promise<void>,
  ) => {
    const { pathname, search } = new URL(context.req.raw.url);

    const prefix = config.locales.find(
      (l) => l.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
    );

    const locale =
      prefix ??
      context.req.raw.headers
        .get("accept-language")
        ?.split(",")
        .flatMap((e) => {
          const [tag] = e.trim().toLowerCase().split(";");
          return config.locales.find((l) => l === tag || l === tag?.split("-")[0]) ?? [];
        })[0] ??
      config.defaultLocale;

    setCurrentLocale(locale);

    const isLocalized =
      /^(GET|HEAD)$/i.test(context.req.raw.method) &&
      !config.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
      !/\.[a-z0-9]{1,8}$/i.test(pathname);

    const target = config.prefixDefaultLocale
      ? !prefix && `/${locale}${pathname}`
      : prefix === config.defaultLocale && (pathname.slice(prefix.length + 1) || "/");

    return isLocalized && target ? context.redirect(`${target}${search}`, 302) : next();
  };

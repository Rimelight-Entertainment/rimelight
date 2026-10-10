import { config, i18nContext, setCurrentLocale } from "./runtime";

/**
 * Universal i18n middleware for locale resolution and route redirection.
 *
 * 1. **Locale Resolution**: Resolves the active locale from the URL segment prefix,
 *    falling back to `Accept-Language` header negotiation and `defaultLocale`.
 * 2. **State Propagation**: Sets the active request locale via `setCurrentLocale()`.
 * 3. **Canonical Redirection**: Automatically redirects unprefixed or default-prefixed routes
 *    according to the `prefixDefaultLocale` configuration, while preserving query parameters
 *    and ignoring API routes, skip paths, and static asset requests.
 */
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

    const target =
      /^(GET|HEAD)$/i.test(context.req.raw.method) &&
      !config.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
      !/\.[a-z0-9]{1,8}$/i.test(pathname) &&
      (config.prefixDefaultLocale
        ? !prefix && `/${locale}${pathname}`
        : prefix === config.defaultLocale && (pathname.slice(prefix.length + 1) || "/"));

    return target ? context.redirect(`${target}${search}`, 302) : i18nContext.run({ locale }, next);
  };

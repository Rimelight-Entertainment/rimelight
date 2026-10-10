import { config, i18nContext, setCurrentLocale, t } from "./runtime";
import serverTranslations from "#rimelight/i18n/server";

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
export const i18n = () => async (c: any, next: () => Promise<void>) => {
  const { pathname, search } = new URL(c.req.url);
  const prefix = config.locales.find(
    (l) => l.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
  );

  const locale =
    prefix ??
    (c.req.header?.("accept-language") ?? c.req.raw?.headers?.get("accept-language") ?? "")
      .split(",")
      .flatMap((e: string) => {
        const tag = e.split(";")[0]?.trim().toLowerCase();
        return config.locales.find((l) => l === tag || l === tag?.split("-")[0]) ?? [];
      })[0] ??
    config.defaultLocale;

  setCurrentLocale(locale);
  c.set?.("locale", locale);
  c.set?.("t", t);

  const target =
    /^(GET|HEAD)$/i.test(c.req.method) &&
    !config.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
    !/\.[a-z0-9]{1,8}$/i.test(pathname) &&
    (config.prefixDefaultLocale
      ? !prefix && `/${locale}${pathname}`
      : prefix === config.defaultLocale && (pathname.slice(prefix.length + 1) || "/"));

  return target
    ? c.redirect(`${target}${search}`, 302)
    : i18nContext.run(
        { locale, translations: serverTranslations?.[locale] ?? config.translations?.[locale] },
        next,
      );
};

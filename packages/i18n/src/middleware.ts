import { AsyncLocalStorage } from "node:async_hooks";
import { config, t } from "./runtime";
import serverTranslations from "virtual:rimelight-i18n/server";

export const i18nContext = new AsyncLocalStorage<{
  locale: string;
  translations?: Record<string, unknown> | undefined;
}>();

globalThis.__rimelight_i18n = i18nContext;

/**
 * Universal i18n middleware for locale resolution, route redirection,
 * and Hono context injection (`c.set('locale')` & `c.set('t')`).
 */
export const i18n = () => async (c: any, next: () => Promise<void>) => {
  const { pathname, search } = new URL(c.req.url);
  const prefix = config.locales.find(
    (l) => l.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
  );

  const locale =
    prefix ??
    (c.req.header("accept-language") ?? "").split(",").flatMap((e: string) => {
      const tag = e.split(";")[0]?.trim().toLowerCase();
      return config.locales.find((l) => l === tag || l === tag?.split("-")[0]) ?? [];
    })[0] ??
    config.defaultLocale;

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

import type { MiddlewareHandler } from "hono";
import { AsyncLocalStorage } from "node:async_hooks";
import { config, t, type I18nContextStore } from "./runtime";

/**
 * Hono context variables injected by the i18n middleware.
 */
export interface I18nVariables {
  locale: string;
  t: typeof t;
}

/**
 * Hono i18n middleware for locale resolution, route redirection,
 * context injection (`c.set('locale')` & `c.set('t')`), and serving
 * `/locales/:locale.json` for external consumers (e.g. game clients).
 */
export const i18n = (): MiddlewareHandler => async (c, next) => {
  const { pathname, search } = new URL(c.req.url);

  // Serve static JSON translations over HTTP for external consumers (e.g. game clients)
  if (pathname.startsWith("/locales/") && pathname.endsWith(".json")) {
    const reqLocale = pathname.slice("/locales/".length, -".json".length);
    const translations = config.translations?.[reqLocale];
    if (translations) {
      return c.json(translations, 200, {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      });
    }
    return c.notFound();
  }

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

  c.set("locale", locale);
  c.set("t", t);

  const target =
    /^(GET|HEAD)$/i.test(c.req.method) &&
    !config.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
    !/\.[a-z0-9]{1,8}$/i.test(pathname) &&
    (config.prefixDefaultLocale
      ? !prefix && `/${locale}${pathname}`
      : prefix === config.defaultLocale && (pathname.slice(prefix.length + 1) || "/"));

  return target
    ? c.redirect(`${target}${search}`, 302)
    : (globalThis.__rimelight_i18n ??= new AsyncLocalStorage<I18nContextStore>()).run(
        { locale, translations: config.translations?.[locale] },
        next,
      );
};

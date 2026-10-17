import type { MiddlewareHandler } from "hono";
import { AsyncLocalStorage } from "node:async_hooks";
import { activeConfig } from "./runtime";
import type { I18nContextStore } from "./types";

/**
 * Hono i18n middleware for locale resolution, route redirection,
 * and serving `/locales/:locale.json` for external consumers (e.g. game clients).
 */
export const i18n = (): MiddlewareHandler => async (c, next) => {
  const { pathname, search } = new URL(c.req.url);

  // Serve static JSON translations over HTTP for external consumers (e.g. game clients)
  if (pathname.startsWith("/locales/") && pathname.endsWith(".json")) {
    const reqLocale = pathname.slice("/locales/".length, -".json".length);
    const translations = activeConfig.translations[reqLocale];
    if (translations) {
      return c.json(translations, 200, {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      });
    }
    return c.notFound();
  }

  const prefix = activeConfig.locales.find(
    (l) => l.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
  );

  const locale =
    prefix ??
    (c.req.header("accept-language") ?? "").split(",").flatMap((e: string) => {
      const tag = e.split(";")[0]?.trim().toLowerCase();
      return activeConfig.locales.find((l) => l === tag || l === tag?.split("-")[0]) ?? [];
    })[0] ??
    activeConfig.defaultLocale;

  const target =
    /^(GET|HEAD)$/i.test(c.req.method) &&
    !activeConfig.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
    !/\.[a-z0-9]{1,8}$/i.test(pathname) &&
    (activeConfig.prefixDefaultLocale
      ? !prefix && `/${locale}${pathname}`
      : prefix === activeConfig.defaultLocale && (pathname.slice(prefix.length + 1) || "/"));

  return target
    ? c.redirect(`${target}${search}`, 302)
    : (globalThis.__rimelight_i18n ??= new AsyncLocalStorage<I18nContextStore>()).run(
        { locale, translations: activeConfig.translations[locale] },
        next,
      );
};

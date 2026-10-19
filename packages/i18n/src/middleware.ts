import { AsyncLocalStorage } from "node:async_hooks";
import type { MiddlewareHandler } from "hono";
import { activeConfig } from "./runtime";

const storage = new AsyncLocalStorage<string>();
activeConfig.getLocale = () => storage.getStore();

/**
 * Hono i18n middleware for locale resolution, route redirection,
 * and serving `/locales/:locale.json` for external consumers (e.g. game clients).
 */
export const i18n = (): MiddlewareHandler => async (c, next) => {
  const { pathname, search } = new URL(c.req.url);

  // Serve static JSON translations over HTTP for external consumers (e.g. game clients)
  if (pathname.startsWith("/locales/") && pathname.endsWith(".json")) {
    const translations = activeConfig.translations[pathname.slice(9, -5)];
    return translations
      ? c.json(translations, 200, {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        })
      : c.notFound();
  }

  const prefix = activeConfig.locales.find(
    (l) => l.toLowerCase() === pathname.split("/")[1]?.toLowerCase(),
  );

  const locale =
    prefix ??
    (c.req.header("accept-language") ?? "")
      .split(",")
      .map((e) => {
        const tag = e.split(";")[0]?.trim().toLowerCase();
        return activeConfig.locales.find(
          (l) => l.toLowerCase() === tag || l.toLowerCase() === tag?.split("-")[0],
        );
      })
      .find(Boolean) ??
    activeConfig.defaultLocale;

  const target =
    /^(GET|HEAD)$/i.test(c.req.method) &&
    !activeConfig.skipPaths.some((p) => `${pathname}/`.startsWith(`${p}/`)) &&
    !/\.[a-z0-9]{1,8}$/i.test(pathname) &&
    (activeConfig.prefixDefaultLocale
      ? !prefix && `/${locale}${pathname}`
      : prefix === activeConfig.defaultLocale && (pathname.slice(prefix.length + 1) || "/"));

  return target ? c.redirect(`${target}${search}`, 302) : storage.run(locale, next);
};

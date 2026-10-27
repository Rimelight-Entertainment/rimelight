import { AsyncLocalStorage } from "node:async_hooks";
import type { MiddlewareHandler } from "hono";
import { activeConfig, isSkippedPath, matchLocale, registerLocaleResolver } from "./runtime";

/** The first configured locale that an `Accept-Language` header asks for, matching the full tag before the base. */
const fromAcceptLanguage = (header = ""): string | undefined => {
  for (const entry of header.split(",")) {
    const tag = entry.split(";")[0]!.trim();
    const match = matchLocale(tag) ?? matchLocale(tag.split("-")[0]);
    if (match) return match;
  }
  return undefined;
};

/**
 * Hono i18n middleware for locale resolution, route redirection,
 * and serving `/locales/:locale.json` for external consumers (e.g. game clients).
 * Calling it registers the per-request locale with `getCurrentLocale()`.
 */
export const i18n = (): MiddlewareHandler => {
  const storage = new AsyncLocalStorage<string>();
  registerLocaleResolver(() => storage.getStore());

  return async (c, next) => {
    const { pathname, search } = new URL(c.req.url);

    // Serve static JSON translations over HTTP for external consumers (e.g. game clients)
    if (pathname.startsWith("/locales/") && pathname.endsWith(".json")) {
      const locale = pathname.slice(9, -5);
      const translations = Object.hasOwn(activeConfig.translations, locale)
        ? activeConfig.translations[locale]
        : undefined;
      return translations
        ? c.json(translations, 200, {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          })
        : c.notFound();
    }

    const prefix = matchLocale(pathname.split("/")[1]);
    const locale =
      prefix ?? fromAcceptLanguage(c.req.header("accept-language")) ?? activeConfig.defaultLocale;

    const target =
      /^(GET|HEAD)$/i.test(c.req.method) &&
      !isSkippedPath(pathname) &&
      (activeConfig.prefixDefaultLocale
        ? !prefix && `/${locale}${pathname}`
        : prefix === activeConfig.defaultLocale && (pathname.slice(prefix.length + 1) || "/"));

    return target ? c.redirect(`${target}${search}`, 302) : storage.run(locale, next);
  };
};

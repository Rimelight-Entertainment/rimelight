import { AsyncLocalStorage } from "node:async_hooks";
import type { Context, MiddlewareHandler } from "hono";
import {
  activeConfig,
  chunkIdsOf,
  isSkippedPath,
  loadLocale,
  loadPathname,
  matchLocale,
  registerLocaleResolver,
} from "./runtime";

type AssetsBinding = { fetch: (input: URL) => Promise<Response> };

/** Workers' streaming HTML rewriter. Declared here: this package has no Workers types. */
declare class HTMLRewriter {
  on(
    selector: string,
    handlers: {
      element: (head: { append: (html: string, options: { html: boolean }) => void }) => void;
    },
  ): HTMLRewriter;
  transform(response: Response): Response;
}

/** Client build manifest, served with the static assets. */
const MANIFEST_PATH = "/.vite/manifest.json";

/** Public URL of each namespace chunk, by `bucket/locale`. Read once per isolate. */
let chunkUrls: Promise<Map<string, string>> | undefined;

const readChunkUrls = (assets: AssetsBinding, origin: string): Promise<Map<string, string>> =>
  (chunkUrls ??= assets
    .fetch(new URL(MANIFEST_PATH, origin))
    .then(async (res) => {
      const manifest = (await res.json()) as Record<string, { file: string }>;
      const urls = new Map<string, string>();
      for (const [key, entry] of Object.entries(manifest)) {
        const id = key.match(/rimelight-i18n-ns\/(.+)$/)?.[1];
        if (id) urls.set(id, `/${entry.file}`);
      }
      return urls;
    })
    .catch(() => {
      // Not cached: the next page retries.
      chunkUrls = undefined;
      return new Map<string, string>();
    }));

/**
 * Adds `<link rel="modulepreload">` for the namespace chunks a page loads, before `</head>`, so the
 * browser fetches them alongside the app's modules instead of after the config runs.
 */
const preloadChunks = async (c: Context, pathname: string): Promise<void> => {
  const res = c.res;
  if (!res.headers.get("content-type")?.includes("text/html")) return;

  const assets = (c.env as { ASSETS?: AssetsBinding } | undefined)?.ASSETS;
  // Dev has no build manifest: Vite serves each virtual module at its `/@id/` URL.
  const urls = activeConfig.devServer
    ? undefined
    : assets
      ? await readChunkUrls(assets, new URL(c.req.url).origin)
      : new Map<string, string>();
  const hrefs = chunkIdsOf(pathname)
    .map((id) => (urls ? urls.get(id) : `/@id/__x00__virtual:rimelight-i18n-ns/${id}`))
    .filter((href): href is string => Boolean(href));
  if (hrefs.length === 0) return;

  const tags = hrefs
    .map((href) => `<link rel="modulepreload" href="${href}" crossorigin>`)
    .join("");
  // Streams through: the rewriter appends to <head> as the page passes, so nothing waits for the full render.
  c.res = new HTMLRewriter()
    .on("head", { element: (head) => head.append(tags, { html: true }) })
    .transform(res);
};

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
      const known = Object.hasOwn(activeConfig.translations, locale);
      if (known) await loadLocale(locale);
      const translations = known ? activeConfig.translations[locale] : undefined;
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

    if (target) return c.redirect(`${target}${search}`, 302);

    // Render with this URL's namespaces loaded, so the page's first translations are already in place.
    return storage.run(locale, async () => {
      if (!isSkippedPath(pathname)) await loadPathname(pathname);
      await next();
      if (!isSkippedPath(pathname)) await preloadChunks(c, pathname);
    });
  };
};

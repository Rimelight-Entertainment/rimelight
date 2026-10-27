import { createContext, createMemo, Show, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  applyPayload,
  getCurrentLocale,
  getDefaultLocale,
  isPathnameLoaded,
  loadPathname,
  matchLocale,
  payloadOf,
} from "./runtime";
import type { TranslationPayload } from "./runtime";

const LocaleContext = createContext<() => string>(getCurrentLocale);

/**
 * The locale of the page being rendered, as a reactive accessor. It follows the router's pathname,
 * so it updates on client navigation, and on the server it comes from the request's URL. Outside
 * `RLI18n` it falls back to `getCurrentLocale()`, which is not reactive.
 */
export const useLocale = (): (() => string) => useContext(LocaleContext);

export interface RLI18nProps {
  /** The current URL, e.g. `router.location.pathname`. */
  pathname: string;
  /** The page to hold: the router's children. */
  children?: unknown;
}

const EMBED_ID = "rimelight-i18n";

/** The translations the server embedded for this URL. Only a server-rendered page has them. */
const readEmbedded = (pathname: string): TranslationPayload | undefined => {
  const text = document.getElementById(EMBED_ID)?.textContent;
  if (!text) return undefined;
  const embedded = JSON.parse(text) as { pathname: string; payload: TranslationPayload };
  return embedded.pathname === pathname ? embedded.payload : undefined;
};

/**
 * Holds the page until the translations for its URL are in. The server renders synchronously with
 * the translations the middleware already loaded, and embeds them in the HTML. Hydration reads them
 * from there, so nothing is fetched and no render pass waits on a promise. A navigation that needs
 * chunks keeps the previous page on screen until they load, drops a stale navigation, and sends a
 * failed load to the nearest error boundary.
 */
export const RLI18n = (props: RLI18nProps): JSX.Element => {
  const locale = (): string => matchLocale(props.pathname.split("/")[1]) ?? getDefaultLocale();
  const payload = createMemo(() => {
    const pathname = props.pathname;
    const loaded = (): { pathname: string; payload: TranslationPayload } => ({
      pathname,
      payload: payloadOf(pathname),
    });
    if (isPathnameLoaded(pathname)) return loaded();
    if (typeof document !== "undefined") {
      const embedded = readEmbedded(pathname);
      if (embedded) {
        applyPayload(embedded);
        return loaded();
      }
    }
    return loadPathname(pathname).then(loaded);
  });
  return (
    <LocaleContext value={locale}>
      {Show({
        keyed: true,
        get when() {
          return payload();
        },
        children: ({ pathname, payload: value }) => {
          applyPayload(value);
          // Escaped so the JSON can't close the script tag early.
          const json = JSON.stringify({ pathname, payload: value }).replace(/</g, "\\u003c");
          return (
            <>
              <script id={EMBED_ID} type="application/json">
                {json}
              </script>
              {props.children as never}
            </>
          );
        },
      })}
    </LocaleContext>
  );
};

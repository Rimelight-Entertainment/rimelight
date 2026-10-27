import { createMemo, Show } from "solid-js";
import { applyPayload, isPathnameLoaded, loadPathname, payloadOf } from "./runtime";

export interface RLI18nProps {
  /** The current URL, e.g. `router.location.pathname`. */
  pathname: string;
  /** The page to hold: the router's children. */
  children?: unknown;
}

/** No `window` on the server. There the memo always answers with a promise, which Solid serializes for the client to adopt. */
const onServer = typeof window === "undefined";

/**
 * Holds the page until the translations for its URL are in. The server renders with them and sends
 * them to the client in the HTML, so hydration adopts them and nothing is fetched. A navigation that
 * needs chunks keeps the previous page on screen until they load, drops a stale navigation, and sends
 * a failed load to the nearest error boundary.
 */
export const RLI18n = (props: RLI18nProps): ReturnType<typeof Show> => {
  const payload = createMemo(() => {
    const pathname = props.pathname;
    if (!onServer && isPathnameLoaded(pathname)) return payloadOf(pathname);
    return loadPathname(pathname).then(() => payloadOf(pathname));
  });
  return Show({
    keyed: true,
    get when() {
      return payload();
    },
    children: (value) => {
      applyPayload(value);
      return props.children as never;
    },
  });
};

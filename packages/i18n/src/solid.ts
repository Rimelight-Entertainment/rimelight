import { createMemo, Show } from "solid-js";
import { isPathnameLoaded, loadPathname } from "./runtime";

export interface RLI18nProps {
  /** The current URL, e.g. `router.location.pathname`. */
  pathname: string;
  /** The page to hold: the router's children. */
  children?: unknown;
}

/**
 * Holds the page until the namespaces for its URL are loaded. Use it around the router's children,
 * inside a `Loading` boundary.
 *
 * A URL whose namespaces are already in (the first URL, any page visited before, every page on the
 * server) renders at once. Otherwise the page is async: a navigation keeps the previous page on screen
 * until the new one is ready, a stale navigation is dropped, and a failed load reaches the nearest
 * error boundary.
 */
export const RLI18n = (props: RLI18nProps): ReturnType<typeof Show> => {
  let generation = 1;
  const ready = createMemo(() => {
    const pathname = props.pathname;
    return isPathnameLoaded(pathname)
      ? generation
      : loadPathname(pathname).then(() => ++generation);
  });
  return Show({
    keyed: true,
    get when() {
      return ready();
    },
    children: (_ready) => props.children as never,
  });
};

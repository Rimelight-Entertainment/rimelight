import { getRequestEvent, parseCookieHeader, serializeCookie } from "@solidjs/web";

/**
 * Cookie-backed theme preference shared by the server render and the client.
 *
 * SSR reads the `theme` cookie and stamps `<html data-theme>`, so the right
 * theme ships in the initial HTML with no pre-paint inline script. `system` is
 * stored verbatim and resolved by CSS (`color-scheme: light dark`), because
 * only the client knows the OS preference.
 */

export type ThemePreference = "dark" | "light" | "system";

export const THEME_COOKIE = "theme";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const parseThemePreference = (
  value: string | null | undefined,
): ThemePreference | undefined =>
  value === "dark" || value === "light" || value === "system" ? value : undefined;

/** The persisted preference: `document.cookie` on the client, the request's `Cookie` header during SSR. */
export const getThemePreference = (): ThemePreference | undefined => {
  const event = getRequestEvent();
  const cookie = event
    ? event.request.headers.get("cookie")
    : typeof document !== "undefined"
      ? document.cookie
      : undefined;
  return parseThemePreference(parseCookieHeader(cookie)[THEME_COOKIE]);
};

/**
 * The `<html data-theme>` value: explicit `dark`/`light`, `undefined` for
 * `system`/unset so the CSS fallbacks (which match an absent attribute) apply.
 */
export const getDocumentTheme = (): "dark" | "light" | undefined => {
  const preference = getThemePreference();
  return preference === "system" ? undefined : preference;
};

/** A `document.cookie` assignment persisting the preference for a year. */
export const serializeThemePreference = (preference: ThemePreference): string =>
  serializeCookie(THEME_COOKIE, preference, {
    path: "/",
    maxAge: THEME_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: typeof location !== "undefined" && location.protocol === "https:",
  });

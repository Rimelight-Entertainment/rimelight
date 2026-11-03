import type { RLLinkProps } from "./link.types";
import { getLocaleUrl } from "@rimelight/i18n";

const EXTERNAL_URL_RE = /^(?:https?:)?\/\//;

/**
 * Localizes an internal href (one starting with `/`) with i18n's `getLocaleUrl`.
 * External, relative and opted-out (`localize === false`) hrefs are returned as-is;
 * a locale code targets that locale.
 */
export function localizeHref(
  href: string | undefined,
  localize?: boolean | string,
  external = false,
): string | undefined {
  if (
    !href ||
    external ||
    localize === false ||
    !href.startsWith("/") ||
    EXTERNAL_URL_RE.test(href)
  )
    return href;
  return getLocaleUrl(href, typeof localize === "string" ? localize : undefined);
}

export function resolveLinkAttrs(props: Partial<RLLinkProps>) {
  const isExternal = !!(props.external || (props.href && EXTERNAL_URL_RE.test(props.href)));

  const showTrailingIcon =
    isExternal && !props.noExternalIcon && !props.trailingIcon
      ? props.externalIcon || "external-link"
      : props.trailingIcon;

  const target = props.target || (isExternal ? "_blank" : undefined);

  const rel =
    props.rel === "" || props.rel === null
      ? undefined
      : (props.rel ??
        (isExternal || (target && target !== "_self") ? "noopener noreferrer" : undefined));

  const ariaCurrent = props.active ? (props.current ?? "page") : undefined;

  const href = props.disabled ? undefined : localizeHref(props.href, props.localize, isExternal);
  const ariaDisabled: "true" | undefined = props.disabled ? "true" : undefined;

  return {
    isExternal,
    showTrailingIcon,
    target,
    rel,
    ariaCurrent,
    href,
    ariaDisabled,
  };
}

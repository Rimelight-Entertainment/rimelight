import type { RLLinkProps } from "./link.types";
import { getLocaleUrl } from "@rimelight/i18n";

const EXTERNAL_URL_RE = /^(?:https?:)?\/\//;

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

  const rawAriaCurrent = props.active ? (props.ariaCurrentValue ?? "page") : undefined;
  const ariaCurrent =
    rawAriaCurrent === true ? "true" : rawAriaCurrent === false ? "false" : rawAriaCurrent;

  const href =
    props.disabled || !props.href
      ? undefined
      : isExternal || props.localize === false || !props.href.startsWith("/")
        ? props.href
        : getLocaleUrl(props.href, typeof props.localize === "string" ? props.localize : undefined);
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

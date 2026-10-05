import type { RLLinkProps } from "./link.types";

const EXTERNAL_URL_RE = /^(?:https?:)?\/\//;

export function resolveLinkAttrs(props: Partial<RLLinkProps>) {
  const isExternal = !!(props.external || (props.href && EXTERNAL_URL_RE.test(props.href)));

  const showTrailingIcon =
    isExternal && !props.noExternalIcon && !props.trailingIcon
      ? props.externalIcon || "externalLink"
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

  const prefetchAttr =
    props.prefetch !== undefined
      ? props.prefetch === true
        ? "viewport"
        : props.prefetch === false
          ? "false"
          : props.prefetch
      : undefined;

  const href = props.disabled ? undefined : props.href;
  const ariaDisabled: "true" | undefined = props.disabled ? "true" : undefined;

  return {
    isExternal,
    showTrailingIcon,
    target,
    rel,
    ariaCurrent,
    prefetchAttr,
    href,
    ariaDisabled,
  };
}

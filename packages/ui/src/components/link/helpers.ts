import type { LinkProps } from "./link"

export function resolveLinkAttrs(props: Partial<LinkProps>) {
  const isExternal = !!(props.external || (props.href && /^(?:https?:)?\/\//.test(props.href)))

  const showTrailingIcon =
    isExternal && !props.noExternalIcon && !props.trailingIcon
      ? props.externalIcon || "externalLink"
      : props.trailingIcon

  const target = props.target || (isExternal ? "_blank" : undefined)

  const rel =
    props.rel === "" || props.rel === null
      ? undefined
      : (props.rel ??
        (isExternal || (target && target !== "_self") ? "noopener noreferrer" : undefined))

  const rawAriaCurrent = props.active ? (props.ariaCurrentValue ?? "page") : undefined
  const ariaCurrent =
    rawAriaCurrent === true ? "true" : rawAriaCurrent === false ? "false" : rawAriaCurrent

  const prefetchAttr = props.prefetch
    ? typeof props.prefetch === "string"
      ? props.prefetch
      : "viewport"
    : undefined

  const href = props.disabled ? undefined : props.href
  const ariaDisabled: "true" | undefined = props.disabled ? "true" : undefined

  return {
    isExternal,
    showTrailingIcon,
    target,
    rel,
    ariaCurrent,
    prefetchAttr,
    href,
    ariaDisabled
  }
}

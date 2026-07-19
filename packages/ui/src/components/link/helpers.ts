import type { LinkProps } from "./link"

export function resolveLinkAttrs(props: Partial<LinkProps>) {
  const isExternal = !!(props.external || (props.href && /^(?:https?:)?\/\//.test(props.href)))

  const showTrailingIcon =
    isExternal && !props.noExternalIcon && !props.trailingIcon
      ? props.externalIcon || "externalLink"
      : props.trailingIcon

  const target = props.target || (isExternal ? "_blank" : undefined)

  const rel =
    props.rel === null || props.rel === ""
      ? undefined
      : (props.rel ??
        (isExternal || (target && target !== "_self") ? "noopener noreferrer" : undefined))

  const ariaCurrent = props.active ? (props.ariaCurrentValue ?? "page") : undefined

  return {
    isExternal,
    showTrailingIcon,
    target,
    rel,
    ariaCurrent
  }
}

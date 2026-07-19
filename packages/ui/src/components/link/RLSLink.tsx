import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkThemeDefault, { createLinkTheme } from "./link.theme"
import { getUIConfig } from "virtual:rimelight-ui"
import RLSIcon from "../icon/RLSIcon"

const uiConfig = getUIConfig()
const linkTheme = uiConfig.colors ? createLinkTheme() : linkThemeDefault
const linkScv = scv(linkTheme)

type RLSLinkProps = LinkProps & { children?: JSX.Element }

const RLSLink: Component<RLSLinkProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "to",
    "href",
    "external",
    "label",
    "ariaLabel",
    "externalIcon",
    "target",
    "rel",
    "trailingIcon",
    "noExternalIcon",
    "tag",
    "theme",
    "ui",
    "class",
    "children"
  ])

  const linkHref = createMemo(
    () => props.href || (typeof props.to === "string" ? props.to : undefined)
  )

  const isExternal = createMemo(
    () =>
      !!(
        props.external ||
        (linkHref() &&
          (linkHref()!.startsWith("http://") ||
            linkHref()!.startsWith("https://") ||
            linkHref()!.startsWith("//")))
      )
  )

  const linkTarget = createMemo(() => props.target || (isExternal() ? "_blank" : undefined))
  const linkRel = createMemo(() => props.rel || (isExternal() ? "noopener noreferrer" : undefined))

  const showExternalIcon = createMemo(() => {
    if (isExternal() && !props.noExternalIcon && !props.trailingIcon) {
      return props.externalIcon || "externalLink"
    }
    return props.trailingIcon
  })

  const classes = createMemo(() =>
    resolveClasses(linkScv, { theme: props.theme }, useUi("link", props.ui), props.class)
  )

  const iconEl = createMemo(() => {
    const icon = showExternalIcon()
    return icon ? (
      <RLSIcon name={icon} size="sm" class="!-translate-y-[1.5px]" aria-hidden="true" />
    ) : null
  })

  const LinkTag: any = props.tag || "a"

  return (
    <LinkTag
      class={classes().root}
      data-slot="root"
      href={LinkTag === "a" ? linkHref() : undefined}
      target={LinkTag === "a" ? linkTarget() : undefined}
      rel={LinkTag === "a" ? linkRel() : undefined}
      aria-label={LinkTag === "a" ? props.ariaLabel : undefined}
      {...rest}
    >
      {props.label !== undefined && props.label !== null ? (
        <span class={classes().label} data-slot="label">
          {props.label}
        </span>
      ) : (
        props.children
      )}
      {iconEl()}
      {isExternal() && !props.ariaLabel && (
        <span class="sr-only" data-slot="external-hint">
          {" "}
          (opens in a new tab)
        </span>
      )}
    </LinkTag>
  )
}

export default RLSLink

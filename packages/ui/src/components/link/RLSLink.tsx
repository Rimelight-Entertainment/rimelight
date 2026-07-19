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
    "ariaLabel",
    "externalIcon",
    "target",
    "rel",
    "trailingIcon",
    "noExternalIcon",
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

  return (
    <a
      href={linkHref()}
      target={linkTarget()}
      rel={linkRel()}
      aria-label={props.ariaLabel}
      class={classes().root}
      data-slot="root"
      {...rest}
    >
      {props.children}
      {iconEl()}
      {isExternal() && !props.ariaLabel && <span class="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

export default RLSLink

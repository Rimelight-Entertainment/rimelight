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
    "label",
    "leadingIcon",
    "trailingIcon",
    "href",
    "external",
    "externalIcon",
    "noExternalIcon",
    "target",
    "rel",
    "prefetch",
    "locale",
    "active",
    "exact",
    "disabled",
    "raw",
    "ariaLabel",
    "ariaCurrentValue",
    "theme",
    "ui",
    "class",
    "children"
  ])

  const linkHref = createMemo(() => props.href)

  const localizedHref = createMemo(() => {
    const path = linkHref()
    if (!path || props.locale === false) return path
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//"))
      return path
    return path
  })

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

  const linkRel = createMemo(() => {
    if (props.rel === null || props.rel === "") return undefined
    if (props.rel !== undefined) return props.rel
    if (isExternal() || (props.target && props.target !== "_self")) return "noopener noreferrer"
    return undefined
  })

  const isLinkActive = createMemo(() => {
    if (props.active !== undefined) return props.active
    if (isExternal()) return false
    return false
  })

  const showTrailingIcon = createMemo(() => {
    if (isExternal() && !props.noExternalIcon && !props.trailingIcon) {
      return props.externalIcon || "externalLink"
    }
    return props.trailingIcon
  })

  const themeActive = createMemo(() => {
    if (props.active !== undefined) return props.active
    if (isLinkActive()) return true
    return undefined
  })

  const classes = createMemo(() => {
    if (props.raw) {
      return { root: props.class || "", label: "", leadingIcon: "", trailingIcon: "" }
    }

    return resolveClasses(
      linkScv,
      {
        theme: props.theme,
        ...(themeActive() !== undefined ? { active: themeActive() } : {}),
        ...(props.disabled ? { disabled: true } : {})
      },
      useUi("link", props.ui),
      props.class
    )
  })

  const prefetchAttr = createMemo(() => {
    if (!props.prefetch) return undefined
    if (typeof props.prefetch === "string") return props.prefetch
    return "viewport"
  })

  function onClick(e: MouseEvent) {
    if (props.disabled) {
      e.stopPropagation()
      e.preventDefault()
      return
    }
  }

  return (
    <a
      class={classes().root}
      data-slot="root"
      href={!props.disabled ? localizedHref() : undefined}
      target={linkTarget()}
      rel={linkRel()}
      aria-label={props.ariaLabel}
      aria-current={isLinkActive() && props.exact ? props.ariaCurrentValue || "page" : undefined}
      aria-disabled={props.disabled ? "true" : undefined}
      data-astro-prefetch={prefetchAttr()}
      onClick={onClick}
      {...rest}
    >
      {props.leadingIcon ? (
        <span class={classes().leadingIcon} data-slot="leading-icon">
          <RLSIcon
            name={props.leadingIcon}
            size="sm"
            class="!-translate-y-[1.5px]"
            aria-hidden="true"
          />
        </span>
      ) : null}

      {props.label !== undefined && props.label !== null ? (
        <span class={classes().label} data-slot="label">
          {props.label}
        </span>
      ) : (
        props.children
      )}

      {showTrailingIcon() ? (
        <span class={classes().trailingIcon} data-slot="trailing-icon">
          <RLSIcon
            name={showTrailingIcon()!}
            size="sm"
            class="!-translate-y-[1.5px]"
            aria-hidden="true"
          />
        </span>
      ) : null}

      {isExternal() && !props.ariaLabel && (
        <span class="sr-only" data-slot="external-hint">
          {" "}
          (opens in a new tab)
        </span>
      )}
    </a>
  )
}

export default RLSLink

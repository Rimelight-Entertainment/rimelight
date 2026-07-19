import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkTheme from "./link.theme"
import RLSIcon from "../icon/RLSIcon"
import { resolveLinkAttrs } from "./helpers"

const link = scv(linkTheme)

type RLSLinkProps = LinkProps & {
  children?: JSX.Element
  leading?: JSX.Element
  trailing?: JSX.Element
}

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
    "active",
    "disabled",
    "raw",
    "ariaLabel",
    "ariaCurrentValue",
    "theme",
    "ui",
    "class",
    "children",
    "leading",
    "trailing"
  ])

  const attrs = createMemo(() => resolveLinkAttrs(props))

  const classes = createMemo<Record<string, string>>(() => {
    if (props.raw) {
      return { root: props.class || "" }
    }

    return resolveClasses(
      link,
      {
        theme: props.theme,
        ...(props.active !== undefined ? { active: props.active } : {}),
        disabled: !!props.disabled
      },
      useUi("link", props.ui),
      props.class
    )
  })

  return (
    <a
      class={classes().root}
      data-slot="root"
      href={attrs().href}
      target={attrs().target}
      rel={attrs().rel}
      aria-label={props.ariaLabel}
      aria-current={attrs().ariaCurrent}
      aria-disabled={attrs().ariaDisabled}
      data-astro-prefetch={attrs().prefetchAttr}
      {...rest}
    >
      {props.leading ? (
        props.leading
      ) : props.leadingIcon ? (
        <span class={classes().leadingIcon} data-slot="leading-icon">
          <RLSIcon name={props.leadingIcon} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {props.children !== undefined && props.children !== null ? (
        props.children
      ) : props.label !== undefined && props.label !== null ? (
        <span class={classes().label} data-slot="label">
          {props.label}
        </span>
      ) : null}

      {props.trailing ? (
        props.trailing
      ) : attrs().showTrailingIcon ? (
        <span class={classes().trailingIcon} data-slot="trailing-icon">
          <RLSIcon name={attrs().showTrailingIcon!} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {attrs().isExternal && !props.ariaLabel && (
        <span class="sr-only" data-slot="external-hint">
          (opens in a new tab)
        </span>
      )}
    </a>
  )
}

export default RLSLink

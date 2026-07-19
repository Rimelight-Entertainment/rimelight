import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { scv } from "css-variants"
import { useUi } from "../../utils/useUi"
import { resolveClasses } from "../../utils/resolveClasses"
import type { LinkProps } from "./link"
import linkTheme from "./link.theme"
import RLSIcon from "../icon/RLSIcon"

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

  const isExternal = createMemo(
    () => !!(props.external || (props.href && /^(?:https?:)?\/\//.test(props.href)))
  )

  const showTrailingIcon = createMemo(() => {
    if (isExternal() && !props.noExternalIcon && !props.trailingIcon) {
      return props.externalIcon || "externalLink"
    }
    return props.trailingIcon
  })

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
      href={!props.disabled ? props.href : undefined}
      target={props.target || (isExternal() ? "_blank" : undefined)}
      rel={
        props.rel === null || props.rel === ""
          ? undefined
          : (props.rel ??
            (isExternal() || (props.target && props.target !== "_self")
              ? "noopener noreferrer"
              : undefined))
      }
      aria-label={props.ariaLabel}
      aria-current={props.active ? props.ariaCurrentValue || "page" : undefined}
      aria-disabled={props.disabled ? "true" : undefined}
      data-astro-prefetch={
        props.prefetch
          ? typeof props.prefetch === "string"
            ? props.prefetch
            : "viewport"
          : undefined
      }
      onClick={onClick}
      {...rest}
    >
      {props.leading ? (
        props.leading
      ) : props.leadingIcon ? (
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

      {props.trailing ? (
        props.trailing
      ) : showTrailingIcon() ? (
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

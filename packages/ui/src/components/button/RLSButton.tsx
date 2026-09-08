import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ButtonProps } from "./button"
import { buttonTheme } from "./button.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSButtonProps extends ButtonProps {
  children?: JSX.Element
  leading?: JSX.Element
  trailing?: JSX.Element
  onClick?: (e: MouseEvent) => void
  type?: "button" | "submit" | "reset"
}

const RLSButton: Component<RLSButtonProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "variant",
    "color",
    "size",
    "href",
    "label",
    "leadingIcon",
    "trailingIcon",
    "loading",
    "loadingAuto",
    "square",
    "block",
    "justify",
    "active",
    "activeColor",
    "activeVariant",
    "rounded",
    "theme",
    "ui",
    "class",
    "disabled",
    "children",
    "leading",
    "trailing",
    "onClick",
    "type",
    "external",
    "externalIcon",
    "noExternalIcon",
    "target",
    "rel",
    "prefetch",
    "raw",
    "ariaLabel",
    "ariaCurrentValue"
  ])

  const isLeading = () => !!(props.leadingIcon || props.leading) || !!props.loading
  const isTrailing = () =>
    !!(props.trailingIcon || props.trailing) || (!!props.loading && !isLeading())

  const showLeadingIcon = () => {
    if (props.loading) return "loaderCircle"
    return props.leadingIcon
  }

  const showTrailingIcon = () => {
    if (props.loading) return "loaderCircle"
    return props.trailingIcon
  }

  const leadingIconClass = () => (props.loading && isLeading() ? "animate-spin" : "")
  const trailingIconClass = () => (props.loading && isTrailing() ? "animate-spin" : "")

  const classes = createMemo<Record<string, string>>(() =>
    buttonTheme({
      variant:
        props.active && props.activeVariant ? props.activeVariant : (props.variant ?? "solid"),
      color: props.active && props.activeColor ? props.activeColor : (props.color ?? "primary"),
      size: props.size ?? "md",
      justify: props.justify,
      block: props.block,
      square: props.square !== undefined ? props.square : !props.label && !props.children,
      rounded: props.rounded ?? false,
      leading: isLeading(),
      trailing: isTrailing(),
      loading: props.loading,
      active: props.active,
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  if (props.href) {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel || undefined}
        class={classes()["root"]}
        data-slot="root"
        aria-label={props.ariaLabel}
        aria-disabled={props.disabled ? "true" : undefined}
        onClick={props.onClick}
        {...rest}
      >
        {props.leading ? (
          props.leading
        ) : isLeading() && showLeadingIcon() ? (
          <span
            class={`${classes()["leadingIcon"]}  ${leadingIconClass()}`}
            data-slot="leading-icon"
          >
            <RLSIcon name={showLeadingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
          </span>
        ) : null}

        {props.children !== undefined && props.children !== null ? (
          props.children
        ) : props.label !== undefined && props.label !== null ? (
          <span class={classes()["label"]} data-slot="label">
            {props.label}
          </span>
        ) : null}

        {props.trailing ? (
          props.trailing
        ) : isTrailing() && showTrailingIcon() ? (
          <span
            class={`${classes()["trailingIcon"]}  ${trailingIconClass()}`}
            data-slot="trailing-icon"
          >
            <RLSIcon name={showTrailingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
          </span>
        ) : null}
      </a>
    )
  }

  return (
    <button
      type={props.type || "button"}
      disabled={props.disabled}
      class={classes()["root"]}
      data-slot="root"
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      {...rest}
    >
      {props.leading ? (
        props.leading
      ) : isLeading() && showLeadingIcon() ? (
        <span class={`${classes()["leadingIcon"]}  ${leadingIconClass()}`} data-slot="leading-icon">
          <RLSIcon name={showLeadingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
        </span>
      ) : null}

      {props.children !== undefined && props.children !== null ? (
        props.children
      ) : props.label !== undefined && props.label !== null ? (
        <span class={classes()["label"]} data-slot="label">
          {props.label}
        </span>
      ) : null}

      {props.trailing ? (
        props.trailing
      ) : isTrailing() && showTrailingIcon() ? (
        <span
          class={`${classes()["trailingIcon"]}  ${trailingIconClass()}`}
          data-slot="trailing-icon"
        >
          <RLSIcon name={showTrailingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
        </span>
      ) : null}
    </button>
  )
}

export default RLSButton

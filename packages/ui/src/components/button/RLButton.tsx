import { createMemo, omit, type Component } from "solid-js"
import { dynamic, type JSX } from "@solidjs/web"
import type { ButtonProps } from "./button"
import { buttonTheme } from "./button.theme"
import { RLIcon } from "../icon/RLIcon"
import { RLAvatar } from "../avatar/RLAvatar"

export interface RLButtonProps extends ButtonProps {
  children?: JSX.Element
  leading?: JSX.Element
  trailing?: JSX.Element
  avatar?: any
  onClick?: (e: MouseEvent) => void
  type?: "button" | "submit" | "reset"
}

const RLButton: Component<RLButtonProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "variant",
    "color",
    "size",
    "href",
    "to",
    "label",
    "leadingIcon",
    "trailingIcon",
    "avatar",
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
  )

  const href = () => props.href || (props["to"] as string | undefined)
  const isLink = () => Boolean(href())
  const isLeading = () => !!(props.leadingIcon || props.avatar || props.leading) || !!props.loading
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
      rounded: (props["rounded"] as boolean | string | undefined) ?? false,
      leading: isLeading(),
      trailing: isTrailing(),
      loading: props.loading,
      active: props.active,
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  const renderLeading = () => {
    if (props.leading) return props.leading
    if (!isLeading()) return null

    return (
      <span class={`${classes()["leadingIcon"]} ${leadingIconClass()}`} data-slot="leading-icon">
        {props.loading || props.leadingIcon ? (
          <RLIcon name={showLeadingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
        ) : props.avatar ? (
          <RLAvatar
            {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
            size={classes()["leadingAvatarSize"] as any}
            class={classes()["leadingAvatar"]}
            data-slot="leading-avatar"
          />
        ) : null}
      </span>
    )
  }

  const renderTrailing = () => {
    if (props.trailing) return props.trailing
    if (!isTrailing() || !showTrailingIcon()) return null

    return (
      <span class={`${classes()["trailingIcon"]} ${trailingIconClass()}`} data-slot="trailing-icon">
        <RLIcon name={showTrailingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
      </span>
    )
  }

  const Root = dynamic(() => (isLink() ? "a" : "button"))

  return (
    <Root
      type={!isLink() ? props.type || "button" : undefined}
      href={isLink() ? href() : undefined}
      target={isLink() ? props.target : undefined}
      rel={isLink() ? props.rel || undefined : undefined}
      disabled={!isLink() ? props.disabled : undefined}
      aria-disabled={isLink() && props.disabled ? "true" : undefined}
      class={classes()["root"]}
      data-slot="root"
      data-theme={props.theme}
      data-loading={props.loading ? "true" : undefined}
      data-loading-auto={props.loadingAuto ? "true" : undefined}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      {...rest}
    >
      {isLeading() ? renderLeading() : null}

      {props.children !== undefined && props.children !== null ? (
        props.children
      ) : props.label !== undefined && props.label !== null ? (
        <span class={classes()["label"]} data-slot="label">
          {props.label}
        </span>
      ) : null}

      {isTrailing() ? renderTrailing() : null}
    </Root>
  )
}

export { RLButton }

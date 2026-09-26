import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { AvatarProps } from "./avatar"
import { avatarTheme } from "./avatar.theme"
import RLIcon from "../icon/RLIcon"

export interface RLAvatarProps extends AvatarProps {
  children?: JSX.Element
  fallbackSlot?: JSX.Element
  badgeSlot?: JSX.Element
  imgProps?: JSX.ImgHTMLAttributes<HTMLImageElement>
}

const RLAvatar: Component<RLAvatarProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "src",
    "alt",
    "fallback",
    "initials",
    "title",
    "subtitle",
    "label",
    "badge",
    "badgeColor",
    "badgePosition",
    "size",
    "color",
    "loading",
    "referrerpolicy",
    "crossorigin",
    "decoding",
    "height",
    "width",
    "sizes",
    "srcset",
    "ui",
    "class",
    "children",
    "fallbackSlot",
    "badgeSlot",
    "imgProps"
  )

  const resolvedClasses = createMemo(() =>
    avatarTheme({
      size: props.size ?? "md",
      color: props.color ?? "neutral",
      badgePosition: props.badgePosition ?? "bottom-right",
      ui: props.ui,
      class: props.class
    })
  )

  const avatarFallback = () => props.fallback || props.initials
  const badgeClass = () =>
    props.badgeColor?.startsWith("bg-")
      ? props.badgeColor
      : `bg-${props.badgeColor ?? "success"}-500`

  const avatarContent = () => {
    if (props.children) return props.children
    if (props.src) {
      return (
        <img
          src={props.src}
          alt={props.alt ?? ""}
          class={resolvedClasses().image}
          data-slot="image"
          loading={props.loading}
          referrerpolicy={props.referrerpolicy || undefined}
          crossorigin={props.crossorigin || undefined}
          decoding={props.decoding}
          {...props.imgProps}
        />
      )
    }
    const fallbackVal = props.fallbackSlot ?? avatarFallback()
    if (fallbackVal) {
      return (
        <span class={resolvedClasses().fallback} data-slot="fallback">
          {fallbackVal}
        </span>
      )
    }
    return (
      <span class={resolvedClasses().fallback} data-slot="fallback">
        <RLIcon name="user" class={resolvedClasses().icon} aria-hidden="true" />
      </span>
    )
  }

  const avatarBadge = () => {
    if (!props.badge && !props.badgeSlot) return null
    return (
      <span class={`${resolvedClasses().badge} ${badgeClass()}`} data-slot="badge">
        {props.badgeSlot ?? props.badge}
      </span>
    )
  }

  const avatarRoot = () => (
    <span
      class={resolvedClasses().root}
      data-slot="root"
      aria-label={props.label || props.title}
      role={props.label || props.title ? "img" : undefined}
      {...rest}
    >
      {avatarContent()}
      {avatarBadge()}
    </span>
  )

  if (props.title || props.subtitle) {
    return (
      <div class="flex items-center gap-3" data-slot="profile-wrapper">
        {avatarRoot()}
        <div class="flex flex-col leading-tight">
          {props.title && (
            <span class="font-medium text-sm text-default" data-slot="title">
              {props.title}
            </span>
          )}
          {props.subtitle && (
            <span class="text-xs text-muted" data-slot="subtitle">
              {props.subtitle}
            </span>
          )}
        </div>
      </div>
    )
  }

  return avatarRoot()
}

export { RLAvatar }
export default RLAvatar

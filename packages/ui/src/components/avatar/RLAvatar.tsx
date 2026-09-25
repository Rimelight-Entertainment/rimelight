import { createMemo, splitProps, type Component, type JSX } from "solid-js"
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
  const [props, rest] = splitProps(allProps, [
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
  ])

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
  const hasTextLayout = () => Boolean(props.title || props.subtitle)
  const badgeClass = () =>
    props.badgeColor?.startsWith("bg-")
      ? props.badgeColor
      : `bg-${props.badgeColor ?? "success"}-500`

  const image = () => (
    <>
      {props.src ? (
        <img
          src={props.src}
          alt={props.alt ?? ""}
          class={resolvedClasses().image}
          data-slot="image"
          loading={props.loading}
          referrerPolicy={props.referrerpolicy || undefined}
          crossorigin={props.crossorigin || undefined}
          decoding={props.decoding}
          {...props.imgProps}
        />
      ) : (
        <span class={resolvedClasses().fallback} data-slot="fallback">
          {props.fallbackSlot ? (
            props.fallbackSlot
          ) : avatarFallback() ? (
            avatarFallback()
          ) : (
            <RLIcon name="i-rl-user" class={resolvedClasses().icon} aria-hidden="true" />
          )}
        </span>
      )}
    </>
  )

  const badgeEl = () =>
    props.badge || props.badgeSlot ? (
      <span class={`${resolvedClasses().badge}  ${badgeClass()}`} data-slot="badge">
        {props.badgeSlot
          ? props.badgeSlot
          : typeof props.badge === "string" || typeof props.badge === "number"
            ? props.badge
            : null}
      </span>
    ) : null

  if (hasTextLayout()) {
    return (
      <div class="flex items-center gap-3" data-slot="profile-wrapper">
        <span
          class={resolvedClasses().root}
          data-slot="root"
          aria-label={props.label || props.title}
          role={props.label || props.title ? "img" : undefined}
          {...rest}
        >
          {props.children ? props.children : image()}
          {badgeEl()}
        </span>
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

  return (
    <span
      class={resolvedClasses().root}
      data-slot="root"
      aria-label={props.label}
      role={props.label ? "img" : undefined}
      {...rest}
    >
      {props.children ? props.children : image()}
      {badgeEl()}
    </span>
  )
}

export { RLAvatar }
export default RLAvatar

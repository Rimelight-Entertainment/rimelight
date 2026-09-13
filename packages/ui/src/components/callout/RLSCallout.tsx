import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { CalloutProps } from "./callout"
import { calloutTheme } from "./callout.theme"
import RLSAvatar from "../avatar/RLSAvatar"
import RLSIcon from "../icon/RLSIcon"

export interface RLSCalloutProps extends CalloutProps {
  children?: JSX.Element
  iconSlot?: JSX.Element
  titleSlot?: JSX.Element
  headerSlot?: JSX.Element
  avatarSlot?: JSX.Element
  closeSlot?: JSX.Element
  actionsSlot?: JSX.Element
  avatar?: string | Record<string, any>
  close?: boolean
  actions?: boolean
  onClose?: () => void
}

const colorToIcon: Record<string, string | undefined> = {
  error: "i-rl-circleCheck",
  warning: "i-rl-alertTriangle",
  info: "i-rl-info",
  success: "i-rl-circleCheck",
  primary: undefined,
  secondary: undefined,
  commentary: undefined,
  ideation: undefined,
  source: undefined,
  neutral: undefined
}

const RLSCallout: Component<RLSCalloutProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "variant",
    "color",
    "title",
    "description",
    "icon",
    "avatar",
    "actions",
    "close",
    "theme",
    "ui",
    "class",
    "children",
    "iconSlot",
    "titleSlot",
    "headerSlot",
    "avatarSlot",
    "closeSlot",
    "actionsSlot",
    "onClose"
  ])

  const resolvedColor = props.variant === "destructive" ? "error" : (props.color ?? "primary")
  const resolvedVariant =
    props.variant === "solid" ||
    props.variant === "outline" ||
    props.variant === "soft" ||
    props.variant === "subtle"
      ? props.variant
      : "solid"
  const resolvedIcon = props.icon ?? colorToIcon[resolvedColor]
  const hasTitleRow = !!(
    props.title ||
    props.titleSlot ||
    props.headerSlot ||
    props.avatar ||
    props.avatarSlot ||
    props.close ||
    props.closeSlot
  )

  const classes = createMemo(() =>
    calloutTheme({
      variant: resolvedVariant,
      color: resolvedColor as any,
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={classes()["root"]} data-slot="root" role="alert" data-theme={props.theme} {...rest}>
      {props.iconSlot !== undefined ? (
        props.iconSlot
      ) : resolvedIcon ? (
        <span class={classes()["icon"]} data-slot="icon">
          <RLSIcon name={resolvedIcon} />
        </span>
      ) : null}

      <div class={classes()["body"]} data-slot="body">
        {hasTitleRow && (
          <div class="flex items-center gap-2.5">
            {props.avatarSlot !== undefined ? (
              props.avatarSlot
            ) : props.avatar ? (
              <RLSAvatar
                {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
                size={classes()["avatarSize"] as any}
                class={classes()["avatar"]}
                data-slot="avatar"
              />
            ) : null}

            {(props.title !== undefined || props.titleSlot !== undefined) && (
              <h5 class={classes()["title"]} data-slot="title">
                {props.title}
                {props.titleSlot}
              </h5>
            )}

            {props.headerSlot}

            {props.closeSlot !== undefined ? (
              props.closeSlot
            ) : props.close ? (
              <button
                type="button"
                class={classes()["close"]}
                data-slot="close"
                onClick={props.onClose}
              >
                <RLSIcon name="i-rl-close" class="size-4" />
              </button>
            ) : null}
          </div>
        )}

        {(props.description !== undefined || props.children !== undefined) && (
          <div class={classes()["content"]} data-slot="content">
            {props.description}
            {props.children}
          </div>
        )}

        {(props.actions === true || props.actionsSlot !== undefined) && (
          <div class={classes()["actions"]} data-slot="actions">
            {props.actionsSlot}
          </div>
        )}
      </div>
    </div>
  )
}

export default RLSCallout

import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { EmptyProps } from "./empty"
import { emptyTheme } from "./empty.theme"
import RLSButton from "../button/RLSButton"
import RLSAvatar from "../avatar/RLSAvatar"
import RLSIcon from "../icon/RLSIcon"

export interface RLSEmptyProps extends EmptyProps {
  children?: JSX.Element
  headerSlot?: JSX.Element
  leadingSlot?: JSX.Element
  titleSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  bodySlot?: JSX.Element
  actionsSlot?: JSX.Element
  footerSlot?: JSX.Element
}

const RLSEmpty: Component<RLSEmptyProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "icon",
    "avatar",
    "loading",
    "loadingIcon",
    "title",
    "description",
    "actions",
    "variant",
    "size",
    "as",
    "ui",
    "class",
    "children",
    "headerSlot",
    "leadingSlot",
    "titleSlot",
    "descriptionSlot",
    "bodySlot",
    "actionsSlot",
    "footerSlot"
  ])

  const activeIcon = props.loading ? (props.loadingIcon ?? "i-lucide-loader-circle") : props.icon
  const actionList = props.actions ?? []

  const classes = createMemo(() =>
    emptyTheme({
      variant: props.variant ?? "outline",
      size: props.size ?? "md",
      loading: props.loading ?? false,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      {props.headerSlot !== undefined ? (
        props.headerSlot
      ) : (
        <div class={classes()["header"]} data-slot="header">
          {props.leadingSlot !== undefined ? (
            props.leadingSlot
          ) : activeIcon ? (
            <div class={classes()["avatar"]} data-slot="avatar">
              <RLSIcon
                name={activeIcon}
                class={`size-full ${props.loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
            </div>
          ) : props.avatar ? (
            <div class={classes()["avatar"]} data-slot="avatar">
              <RLSAvatar {...props.avatar} />
            </div>
          ) : null}

          {(props.title || props.titleSlot !== undefined) && (
            <div class={classes()["title"]} data-slot="title">
              {props.titleSlot !== undefined ? props.titleSlot : props.title}
            </div>
          )}

          {(props.description || props.descriptionSlot !== undefined) && (
            <div class={classes()["description"]} data-slot="description">
              {props.descriptionSlot !== undefined ? props.descriptionSlot : props.description}
            </div>
          )}
        </div>
      )}

      {(props.bodySlot !== undefined || props.children !== undefined) && (
        <div class={classes()["body"]} data-slot="body">
          {props.bodySlot !== undefined ? props.bodySlot : props.children}
        </div>
      )}

      {((props.actions?.length ?? 0) > 0 || props.actionsSlot !== undefined) && (
        <div class={classes()["actions"]} data-slot="actions">
          {props.actionsSlot !== undefined ? (
            props.actionsSlot
          ) : (
            <For each={actionList}>
              {(action) => (
                <RLSButton
                  size={props.size === "xs" || props.size === "sm" ? "xs" : "sm"}
                  color={(action.color || "primary") as any}
                  variant={(action.variant || "solid") as any}
                  leadingIcon={action.icon}
                  {...action}
                >
                  {action.label}
                </RLSButton>
              )}
            </For>
          )}
        </div>
      )}

      {props.footerSlot !== undefined && (
        <div class={classes()["footer"]} data-slot="footer">
          {props.footerSlot}
        </div>
      )}
    </div>
  )
}

export default RLSEmpty

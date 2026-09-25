import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { EmptyProps } from "./empty"
import { emptyTheme } from "./empty.theme"
import RLButton from "../button/RLButton"
import RLAvatar from "../avatar/RLAvatar"
import RLIcon from "../icon/RLIcon"

export interface RLEmptyProps extends EmptyProps {
  children?: JSX.Element
  headerSlot?: JSX.Element
  leadingSlot?: JSX.Element
  titleSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  bodySlot?: JSX.Element
  actionsSlot?: JSX.Element
  footerSlot?: JSX.Element
}

const RLEmpty: Component<RLEmptyProps> = (allProps) => {
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
              <RLIcon
                name={activeIcon}
                class={`size-full ${props.loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
            </div>
          ) : props.avatar ? (
            <div class={classes()["avatar"]} data-slot="avatar">
              <RLAvatar {...props.avatar} />
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
              {(action) => {
                const { icon, label, color, variant, ...actionRest } = action
                return (
                  <RLButton
                    size={props.size === "xs" || props.size === "sm" ? "xs" : "sm"}
                    color={(color || "primary") as any}
                    variant={(variant || "solid") as any}
                    {...(icon ? { leadingIcon: icon } : {})}
                    {...actionRest}
                  >
                    {label}
                  </RLButton>
                )
              }}
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

export { RLEmpty }
export default RLEmpty

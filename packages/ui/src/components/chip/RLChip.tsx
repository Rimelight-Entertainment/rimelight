import { createMemo, omit, Show, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { ChipProps } from "./chip"
import { chipTheme } from "./chip.theme"

export interface RLChipProps extends ChipProps {
  children?: JSX.Element
  content?: JSX.Element
  text?: any
  standalone?: boolean
  show?: boolean
}

const RLChip: Component<RLChipProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "text",
    "standalone",
    "show",
    "theme",
    "color",
    "size",
    "position",
    "inset",
    "ui",
    "class",
    "children",
    "content"
  )

  const classes = createMemo(() =>
    chipTheme({
      color: props["color"],
      size: props["size"],
      position: props["position"],
      inset: props["inset"],
      standalone: props.standalone ?? false,
      ui: props["ui"],
      class: props["class"]
    })
  )

  const show = props.show ?? true

  if (props.standalone) {
    return (
      <Show when={show}>
        <span class={classes()["base"]} data-slot="base">
          {props.children !== undefined ? props.children : props.text}
        </span>
      </Show>
    )
  }

  return (
    <div class={classes()["root"]} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
      {show && (
        <span class={classes()["base"]} data-slot="base">
          {props.content !== undefined ? props.content : props.text}
        </span>
      )}
    </div>
  )
}

export { RLChip }
export default RLChip

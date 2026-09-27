import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { TreeProps } from "./tree"
import { treeTheme } from "./tree.theme"

export interface RLTreeProps extends TreeProps {
  children?: JSX.Element
}

const RLTree: Component<RLTreeProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

  const resolvedClasses = createMemo(() =>
    treeTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLTree }

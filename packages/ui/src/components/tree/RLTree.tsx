import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { TreeProps } from "./tree"
import { treeTheme } from "./tree.theme"

export interface RLTreeProps extends TreeProps {
  children?: JSX.Element
}

const RLTree: Component<RLTreeProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

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
export default RLTree

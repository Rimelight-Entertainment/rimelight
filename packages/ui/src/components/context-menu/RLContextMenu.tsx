import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ContextMenuProps } from "./context-menu"
import { contextMenuTheme } from "./context-menu.theme"

export interface RLContextMenuProps extends ContextMenuProps {
  children?: JSX.Element
}

const RLContextMenu: Component<RLContextMenuProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    contextMenuTheme({
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

export { RLContextMenu }
export default RLContextMenu

import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ListboxProps } from "./listbox"
import { listboxTheme } from "./listbox.theme"

export interface RLSListboxProps extends ListboxProps {
  children?: JSX.Element
}

const RLSListbox: Component<RLSListboxProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    listboxTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSListbox

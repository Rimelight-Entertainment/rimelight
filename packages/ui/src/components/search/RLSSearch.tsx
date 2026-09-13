import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SearchProps } from "./search"
import { searchTheme } from "./search.theme"

export interface RLSSearchProps extends SearchProps {
  children?: JSX.Element
}

const RLSSearch: Component<RLSSearchProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing"
  ])

  const resolvedClasses = createMemo(() =>
    searchTheme({
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

export default RLSSearch

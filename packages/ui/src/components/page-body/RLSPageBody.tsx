import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PageBodyProps } from "./page-body"
import { pageBodyTheme } from "./page-body.theme"

export interface RLSPageBodyProps extends PageBodyProps {
  children?: JSX.Element
}

const RLSPageBody: Component<RLSPageBodyProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => pageBodyTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSPageBody

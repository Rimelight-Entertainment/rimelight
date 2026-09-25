import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PageBodyProps } from "./page-body"
import { pageBodyTheme } from "./page-body.theme"

export interface RLPageBodyProps extends PageBodyProps {
  children?: JSX.Element
}

const RLPageBody: Component<RLPageBodyProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => pageBodyTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPageBody }
export default RLPageBody

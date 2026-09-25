import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PageAsideProps } from "./page-aside"
import { pageAsideTheme } from "./page-aside.theme"

export interface RLPageAsideProps extends PageAsideProps {
  children?: JSX.Element
}

const RLPageAside: Component<RLPageAsideProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => pageAsideTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPageAside }
export default RLPageAside

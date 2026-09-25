import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { PageAsideProps } from "./page-aside"
import { pageAsideTheme } from "./page-aside.theme"

export interface RLPageAsideProps extends PageAsideProps {
  children?: JSX.Element
}

const RLPageAside: Component<RLPageAsideProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

  const resolvedClasses = createMemo(() => pageAsideTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPageAside }
export default RLPageAside

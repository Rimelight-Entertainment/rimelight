import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PageAsideProps } from "./page-aside"
import { pageAsideTheme } from "./page-aside.theme"

export interface RLSPageAsideProps extends PageAsideProps {
  children?: JSX.Element
}

const RLSPageAside: Component<RLSPageAsideProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => pageAsideTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSPageAside

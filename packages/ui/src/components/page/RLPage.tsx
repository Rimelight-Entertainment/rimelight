import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PageProps } from "./page"
import { pageTheme } from "./page.theme"

export interface RLPageProps extends PageProps {
  children?: JSX.Element
}

const RLPage: Component<RLPageProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => pageTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPage }
export default RLPage

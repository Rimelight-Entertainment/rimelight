import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PageHeaderProps } from "./page-header"
import { pageHeaderTheme } from "./page-header.theme"

export interface RLPageHeaderProps extends PageHeaderProps {
  children?: JSX.Element
}

const RLPageHeader: Component<RLPageHeaderProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => pageHeaderTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPageHeader }
export default RLPageHeader

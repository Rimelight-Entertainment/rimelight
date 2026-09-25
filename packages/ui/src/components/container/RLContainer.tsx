import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Dynamic } from "@solidjs/web"
import type { ContainerProps } from "./container"
import { containerTheme } from "./container.theme"

export interface RLContainerProps extends ContainerProps {
  children?: JSX.Element
}

const RLContainer: Component<RLContainerProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "as", "ui", "class", "children")

  const tag = () => props.as ?? "div"

  const resolvedClasses = createMemo(() => containerTheme({ ui: props.ui, class: props.class }))

  return (
    <Dynamic component={tag()} class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </Dynamic>
  )
}

export { RLContainer }
export default RLContainer

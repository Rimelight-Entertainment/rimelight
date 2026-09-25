import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { ContainerProps } from "./container"
import { containerTheme } from "./container.theme"

export interface RLContainerProps extends ContainerProps {
  children?: JSX.Element
}

const RLContainer: Component<RLContainerProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["as", "ui", "class", "children"])

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

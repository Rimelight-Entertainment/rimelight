import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ThreeDHoverProps } from "./3d-hover"
import { hover3dTheme } from "./3d-hover.theme"

export interface RL3dHoverProps extends ThreeDHoverProps {
  children?: JSX.Element
}

const RL3dHover: Component<RL3dHoverProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => hover3dTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RL3dHover }
export default RL3dHover

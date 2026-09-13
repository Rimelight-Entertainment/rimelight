import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ThreeDHoverProps } from "./3d-hover"
import { hover3dTheme } from "./3d-hover.theme"

export interface RLS3dHoverProps extends ThreeDHoverProps {
  children?: JSX.Element
}

const RLS3dHover: Component<RLS3dHoverProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => hover3dTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLS3dHover

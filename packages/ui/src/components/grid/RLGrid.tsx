import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { GridProps } from "./grid"
import { gridTheme } from "./grid.theme"

export interface RLGridProps extends GridProps {
  children?: JSX.Element
}

const RLGrid: Component<RLGridProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "cols", "stagger", "gap", "ui", "class", "children")

  const resolvedClasses = createMemo(() =>
    gridTheme({
      cols: props.cols ?? 2,
      gap: props.gap ?? "md",
      stagger: props.stagger ?? false,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} {...rest}>
      {props.children}
    </div>
  )
}

export { RLGrid }
export default RLGrid

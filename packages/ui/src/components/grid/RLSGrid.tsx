import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { GridProps } from "./grid"
import { gridTheme } from "./grid.theme"

export interface RLSGridProps extends GridProps {
  children?: JSX.Element
}

const RLSGrid: Component<RLSGridProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["cols", "stagger", "gap", "ui", "class", "children"])

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

export default RLSGrid

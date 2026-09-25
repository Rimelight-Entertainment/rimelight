import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { TourProps } from "./tour"
import { tourTheme } from "./tour.theme"

export interface RLTourProps extends TourProps {
  children?: JSX.Element
}

const RLTour: Component<RLTourProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    tourTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLTour }
export default RLTour

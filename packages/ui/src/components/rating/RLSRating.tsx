import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { RatingProps } from "./rating"
import { ratingTheme } from "./rating.theme"

export interface RLSRatingProps extends RatingProps {
  children?: JSX.Element
}

const RLSRating: Component<RLSRatingProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing"
  ])

  const resolvedClasses = createMemo(() =>
    ratingTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSRating

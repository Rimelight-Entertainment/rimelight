import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { RatingProps } from "./rating"
import { ratingTheme } from "./rating.theme"

export interface RLRatingProps extends RatingProps {
  children?: JSX.Element
}

const RLRating: Component<RLRatingProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

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

export { RLRating }

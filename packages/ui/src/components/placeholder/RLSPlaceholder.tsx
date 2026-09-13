import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PlaceholderProps } from "./placeholder"
import { placeholderTheme } from "./placeholder.theme"

export interface RLSPlaceholderProps extends PlaceholderProps {
  children?: JSX.Element
}

const RLSPlaceholder: Component<RLSPlaceholderProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const classes = createMemo(() =>
    placeholderTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={classes()["base"]} {...rest}>
      <svg class={classes()["svg"]}>
        <defs>
          <pattern
            id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
          </pattern>
        </defs>
        <rect
          stroke="none"
          fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
          width="100%"
          height="100%"
        />
      </svg>

      {props.children}
    </div>
  )
}

export default RLSPlaceholder

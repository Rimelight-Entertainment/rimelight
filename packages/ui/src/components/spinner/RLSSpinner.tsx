import { createMemo, splitProps, type Component } from "solid-js"
import type { SpinnerProps } from "./spinner"
import { spinnerTheme } from "./spinner.theme"

export interface RLSSpinnerProps extends SpinnerProps {}

const RLSSpinner: Component<RLSSpinnerProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["size", "color", "theme", "ui", "class"])

  const classes = createMemo(() =>
    spinnerTheme({
      size: props.size ?? "md",
      color: props.color ?? "current",
      ui: props.ui,
      class: props.class
    })
  )

  return <div class={classes()["root"]} data-slot="root" data-theme={props.theme} {...rest} />
}

export default RLSSpinner

import { createMemo, splitProps, type Component } from "solid-js"
import type { SkeletonProps } from "./skeleton"
import { skeletonTheme } from "./skeleton.theme"

export interface RLSSkeletonProps extends SkeletonProps {}

const RLSSkeleton: Component<RLSSkeletonProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["shape", "ui", "class"])

  const classes = createMemo(() =>
    skeletonTheme({
      shape: props.shape ?? "rounded",
      ui: props.ui,
      class: props.class
    })
  )

  return <div class={classes()["root"]} data-slot="root" {...rest} />
}

export default RLSSkeleton

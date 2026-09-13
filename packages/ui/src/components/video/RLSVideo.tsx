import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { VideoProps } from "./video"
import { videoTheme } from "./video.theme"

export interface RLSVideoProps extends VideoProps {
  children?: JSX.Element
}

const RLSVideo: Component<RLSVideoProps> = (allProps) => {
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
    videoTheme({
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

export default RLSVideo

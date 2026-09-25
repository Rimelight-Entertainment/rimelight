import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { AspectRatioProps } from "./aspect-ratio"
import { aspectRatioTheme } from "./aspect-ratio.theme"

export interface RLAspectRatioProps extends AspectRatioProps {
  children?: JSX.Element
}

const RLAspectRatio: Component<RLAspectRatioProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ratio", "ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    aspectRatioTheme({ ratio: props.ratio, ui: props.ui, class: props.class })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <svg
        viewBox={`0 0 100 ${(1 / (props.ratio ?? 1)) * 100}`}
        class="w-full h-auto pointer-events-none block"
        aria-hidden="true"
      />
      <div class={resolvedClasses().content} data-slot="content">
        {props.children}
      </div>
    </div>
  )
}

export { RLAspectRatio }
export default RLAspectRatio

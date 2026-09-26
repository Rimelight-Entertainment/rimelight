import { createMemo, omit, type Component } from "solid-js"
import { dynamic, type JSX } from "@solidjs/web"
import type { AspectRatioProps } from "./aspect-ratio"
import { aspectRatioTheme } from "./aspect-ratio.theme"

export interface RLAspectRatioProps extends AspectRatioProps {
  children?: JSX.Element
}

const RLAspectRatio: Component<RLAspectRatioProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "as", "ratio", "ui", "class", "children")

  const safeRatio = () => {
    const value = props.ratio ?? 1
    return Number.isFinite(value) && value > 0 ? value : 1
  }

  const resolvedClasses = createMemo(() => aspectRatioTheme({ ui: props.ui, class: props.class }))

  const spacerHeight = () => (1 / safeRatio()) * 100

  const inner = () => (
    <>
      <svg
        viewBox={`0 0 100 ${spacerHeight()}`}
        class={resolvedClasses().spacer}
        data-slot="spacer"
        aria-hidden="true"
      />
      <div class={resolvedClasses().content} data-slot="content">
        {props.children}
      </div>
    </>
  )

  const Root = dynamic(() => props.as ?? "div")

  return (
    <Root class={resolvedClasses().root} data-slot="root" data-ratio={safeRatio()} {...rest}>
      {inner()}
    </Root>
  )
}

export { RLAspectRatio }
export default RLAspectRatio

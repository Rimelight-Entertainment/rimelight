import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { WatermarkProps } from "./watermark"
import { watermarkTheme } from "./watermark.theme"

export interface RLWatermarkProps extends WatermarkProps {
  children?: JSX.Element
}

const RLWatermark: Component<RLWatermarkProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    watermarkTheme({
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

export { RLWatermark }
export default RLWatermark

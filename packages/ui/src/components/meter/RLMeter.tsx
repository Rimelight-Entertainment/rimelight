import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { MeterProps } from "./meter"
import { meterTheme } from "./meter.theme"

export interface RLMeterProps extends MeterProps {
  children?: JSX.Element
}

const RLMeter: Component<RLMeterProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    meterTheme({
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

export { RLMeter }
export default RLMeter

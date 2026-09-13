import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { MeterProps } from "./meter"
import { meterTheme } from "./meter.theme"

export interface RLSMeterProps extends MeterProps {
  children?: JSX.Element
}

const RLSMeter: Component<RLSMeterProps> = (allProps) => {
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

export default RLSMeter

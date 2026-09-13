import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ProgressProps } from "./progress"
import { progressTheme } from "./progress.theme"

export interface RLSProgressProps extends ProgressProps {
  children?: JSX.Element
}

const RLSProgress: Component<RLSProgressProps> = (allProps) => {
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
    progressTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <div
        class={resolvedClasses().indicator}
        data-slot="indicator"
        style={{ width: `${Math.min(100, Math.max(0, props.value ?? 0))}%` }}
      />
      {props.children}
    </div>
  )
}

export default RLSProgress

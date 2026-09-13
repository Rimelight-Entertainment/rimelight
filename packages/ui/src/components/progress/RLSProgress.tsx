import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ProgressProps } from "./progress"
import { progressTheme } from "./progress.theme"

export interface RLSProgressProps extends ProgressProps {
  children?: JSX.Element
}

const RLSProgress: Component<RLSProgressProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "value",
    "max",
    "theme",
    "color",
    "ui",
    "class",
    "children"
  ])

  const value = () => props.value ?? 0
  const max = () => props.max ?? 100
  const percentage = createMemo(() => Math.min(100, Math.max(0, (value() / max()) * 100)))

  const resolvedClasses = createMemo(() =>
    progressTheme({
      color: props.color,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div
      class={resolvedClasses().root}
      data-slot="progress-root"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max()}
      aria-valuenow={value()}
      data-theme={props.theme}
      {...rest}
    >
      <div
        class={resolvedClasses().indicator}
        data-slot="indicator"
        style={{ transform: `translateX(-${100 - percentage()}%)` }}
      />
      {props.children}
    </div>
  )
}

export default RLSProgress

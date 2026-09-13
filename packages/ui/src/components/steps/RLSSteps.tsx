import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { StepsProps } from "./steps"
import { stepsTheme } from "./steps.theme"

export interface RLSStepsProps extends StepsProps {
  children?: JSX.Element
}

const RLSSteps: Component<RLSStepsProps> = (allProps) => {
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
    stepsTheme({
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

export default RLSSteps

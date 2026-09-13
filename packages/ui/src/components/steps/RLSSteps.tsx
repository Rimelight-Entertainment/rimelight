import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { StepsProps } from "./steps"
import { stepsTheme } from "./steps.theme"

export interface RLSStepsProps extends StepsProps {
  children?: JSX.Element
}

const RLSSteps: Component<RLSStepsProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["size", "ui", "class", "children"])

  const size = () => props.size || "md"

  const resolvedClasses = createMemo(() =>
    stepsTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={`${resolvedClasses().root} rl-steps`} data-slot="root" data-size={size()} {...rest}>
      <ol class="rl-steps-list">{props.children}</ol>
    </div>
  )
}

export default RLSSteps

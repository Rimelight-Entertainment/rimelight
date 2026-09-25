import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PricingPlanProps } from "./pricing-plan"
import { pricingPlanTheme } from "./pricing-plan.theme"

export interface RLPricingPlanProps extends PricingPlanProps {
  children?: JSX.Element
}

const RLPricingPlan: Component<RLPricingPlanProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    pricingPlanTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPricingPlan }
export default RLPricingPlan

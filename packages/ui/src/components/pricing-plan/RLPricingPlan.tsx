import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { PricingPlanProps } from "./pricing-plan";
import { pricingPlanTheme } from "./pricing-plan.theme";

export interface RLPricingPlanProps extends PricingPlanProps {
  children?: JSX.Element;
}

const RLPricingPlan: Component<RLPricingPlanProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    pricingPlanTheme({
      ui: props.ui,
      class: props.class
    })
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

export { RLPricingPlan };

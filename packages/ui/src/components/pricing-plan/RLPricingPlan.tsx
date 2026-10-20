import type { Component } from "solid-js";
import type { RLPricingPlanProps } from "./pricing-plan.types";
import { RLPricingPlanTheme } from "./pricing-plan.theme";

export const RLPricingPlan: Component<RLPricingPlanProps> = (props) => {
  const { classes, rest } = RLPricingPlanTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

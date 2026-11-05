import type { Component } from "solid-js";
import type { RLPricingPlanProps } from "./pricing-plan.types";
import { RLPricingPlanTheme } from "./pricing-plan.theme";

export const RLPricingPlan: Component<RLPricingPlanProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPricingPlanTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};

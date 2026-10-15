import type { RLPricingPlanProps } from "./pricing-plan.types";
import { RLPricingPlanTheme } from "./pricing-plan.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPricingPlan: Component<RLPricingPlanProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLPricingPlanTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

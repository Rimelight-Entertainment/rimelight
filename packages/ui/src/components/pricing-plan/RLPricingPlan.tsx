import { createMemo, omit, type Component } from "solid-js";
import type { RLPricingPlanProps } from "./pricing-plan";
import { pricingPlanTheme } from "./pricing-plan.theme";

export const RLPricingPlan: Component<RLPricingPlanProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    pricingPlanTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

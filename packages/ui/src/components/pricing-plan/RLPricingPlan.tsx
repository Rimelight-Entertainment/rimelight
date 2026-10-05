import type { RLPricingPlanProps } from "./pricing-plan.types";
import { RLPricingPlanTheme } from "./pricing-plan.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPricingPlan: Component<RLPricingPlanProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLPricingPlanTheme({
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

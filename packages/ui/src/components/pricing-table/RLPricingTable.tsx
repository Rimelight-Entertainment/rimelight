import type { RLPricingTableProps } from "./pricing-table.types";
import { RLPricingTableTheme } from "./pricing-table.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPricingTable: Component<RLPricingTableProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLPricingTableTheme({
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

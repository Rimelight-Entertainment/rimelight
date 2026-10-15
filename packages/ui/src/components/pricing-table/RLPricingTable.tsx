import type { RLPricingTableProps } from "./pricing-table.types";
import { RLPricingTableTheme } from "./pricing-table.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPricingTable: Component<RLPricingTableProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLPricingTableTheme({
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

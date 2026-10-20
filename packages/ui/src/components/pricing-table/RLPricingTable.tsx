import type { Component } from "solid-js";
import type { RLPricingTableProps } from "./pricing-table.types";
import { RLPricingTableTheme } from "./pricing-table.theme";

export const RLPricingTable: Component<RLPricingTableProps> = (props) => {
  const { classes, rest } = RLPricingTableTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

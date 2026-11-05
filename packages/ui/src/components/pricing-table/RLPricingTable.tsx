import type { Component } from "solid-js";
import type { RLPricingTableProps } from "./pricing-table.types";
import { RLPricingTableTheme } from "./pricing-table.theme";

export const RLPricingTable: Component<RLPricingTableProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPricingTableTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};

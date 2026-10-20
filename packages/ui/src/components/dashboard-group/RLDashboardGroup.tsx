import type { Component } from "solid-js";
import type { RLDashboardGroupProps } from "./dashboard-group.types";
import { RLDashboardGroupTheme } from "./dashboard-group.theme";

export const RLDashboardGroup: Component<RLDashboardGroupProps> = (props) => {
  const { Tag, classes, rest } = RLDashboardGroupTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};

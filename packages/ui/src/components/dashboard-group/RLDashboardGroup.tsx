import type { Component } from "solid-js";
import type { RLDashboardGroupProps } from "./dashboard-group.types";
import { RLDashboardGroupTheme } from "./dashboard-group.theme";

export const RLDashboardGroup: Component<RLDashboardGroupProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLDashboardGroupTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};

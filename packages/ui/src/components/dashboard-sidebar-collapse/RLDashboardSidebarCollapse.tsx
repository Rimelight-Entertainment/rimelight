import type { Component } from "solid-js";
import type { RLDashboardSidebarCollapseProps } from "./dashboard-sidebar-collapse.types";
import { RLDashboardSidebarCollapseTheme } from "./dashboard-sidebar-collapse.theme";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["icon"] as const;

export const RLDashboardSidebarCollapse: Component<RLDashboardSidebarCollapseProps> = (props) => {
  const { classes, rest } = RLDashboardSidebarCollapseTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <button
      type="button"
      data-dashboard-toggle="collapse"
      class={classes().root}
      data-slot="root"
      aria-label="Collapse sidebar"
      {...rest}
    >
      <RLIcon
        name={props.icon || "panel-left"}
        class="size-5"
        data-dashboard-collapse-icon
        data-expanded
      />
      <RLIcon
        name="panel-right"
        class="size-5 hidden"
        data-dashboard-collapse-icon
        data-collapsed
      />
      {props.children}
    </button>
  );
};

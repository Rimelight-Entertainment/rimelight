import type { Component } from "solid-js";
import type { RLDashboardSidebarToggleProps } from "./dashboard-sidebar-toggle.types";
import { RLDashboardSidebarToggleTheme } from "./dashboard-sidebar-toggle.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon"] as const;

export const RLDashboardSidebarToggle: Component<RLDashboardSidebarToggleProps> = (props) => {
  const { classes, rest } = RLDashboardSidebarToggleTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <button
      type="button"
      data-dashboard-toggle="mobile"
      class={classes().root}
      data-slot="root"
      aria-label={uiT("sidebar.toggle")}
      {...rest}
    >
      <RLIcon name={props.icon || "menu"} class="size-5" />
      {props.children}
    </button>
  );
};

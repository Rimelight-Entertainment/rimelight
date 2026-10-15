import type { RLDashboardSidebarToggleProps } from "./dashboard-sidebar-toggle.types";
import { RLDashboardSidebarToggleTheme } from "./dashboard-sidebar-toggle.theme";
import { createMemo, omit, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLDashboardSidebarToggle: Component<RLDashboardSidebarToggleProps> = (props) => {
  const rest = omit(props, "icon", "ui", "class", "children");

  const classes = createMemo(() =>
    RLDashboardSidebarToggleTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <button
      type="button"
      data-dashboard-toggle="mobile"
      class={classes().root}
      data-slot="root"
      aria-label="Toggle sidebar"
      {...rest}
    >
      <RLIcon name={props.icon || "menu"} class="size-5" />
      {props.children}
    </button>
  );
};

import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { DashboardSidebarToggleProps } from "./dashboard-sidebar-toggle";
import { dashboardSidebarToggleTheme } from "./dashboard-sidebar-toggle.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLDashboardSidebarToggleProps extends DashboardSidebarToggleProps {
  children?: JSX.Element;
}

const RLDashboardSidebarToggle: Component<RLDashboardSidebarToggleProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "icon", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    dashboardSidebarToggleTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <button
      type="button"
      data-dashboard-toggle="mobile"
      class={resolvedClasses().root}
      data-slot="root"
      aria-label="Toggle sidebar"
      {...rest}
    >
      <RLIcon name={props.icon || "menu"} class="size-5" />
      {props.children}
    </button>
  );
};

export { RLDashboardSidebarToggle };

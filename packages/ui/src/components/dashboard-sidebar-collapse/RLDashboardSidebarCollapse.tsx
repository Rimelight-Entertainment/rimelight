import { createMemo, omit, type Component } from "solid-js";
import type { RLDashboardSidebarCollapseProps } from "./dashboard-sidebar-collapse.types";
import { dashboardSidebarCollapseTheme } from "./dashboard-sidebar-collapse.theme";
import { RLIcon } from "../icon/RLIcon";

export const RLDashboardSidebarCollapse: Component<RLDashboardSidebarCollapseProps> = (
  allProps,
) => {
  const props = allProps;
  const rest = omit(allProps, "icon", "ui", "class", "children", "side");

  const resolvedClasses = createMemo(() =>
    dashboardSidebarCollapseTheme({
      side: props.side ?? "left",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <button
      type="button"
      data-dashboard-toggle="collapse"
      class={resolvedClasses().root}
      data-slot="root"
      aria-label="Collapse sidebar"
      {...rest}
    >
      <RLIcon
        name={props.icon || "panelLeft"}
        class="size-5"
        data-dashboard-collapse-icon
        data-expanded
      />
      <RLIcon name="panelRight" class="size-5 hidden" data-dashboard-collapse-icon data-collapsed />
      {props.children}
    </button>
  );
};

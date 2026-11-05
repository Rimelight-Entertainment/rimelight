import type { Component } from "solid-js";
import type { RLDashboardSidebarCollapseProps } from "./dashboard-sidebar-collapse.types";
import { RLDashboardSidebarCollapseTheme } from "./dashboard-sidebar-collapse.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon"] as const;

export const RLDashboardSidebarCollapse: Component<RLDashboardSidebarCollapseProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLDashboardSidebarCollapseTheme.setup(props, {
    as: "button",
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      type="button"
      data-dashboard-toggle="collapse"
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      aria-label={uiT("sidebar.collapse")}
      {...rest}
    >
      <RLIcon
        name={props.icon || "panel-left"}
        class={classes().icon}
        data-dashboard-collapse-icon
        data-state="expanded"
      />
      <RLIcon
        name="panel-right"
        class={classes().collapsedIcon}
        data-dashboard-collapse-icon
        data-state="collapsed"
      />
      {children()}
    </Tag>
  );
};

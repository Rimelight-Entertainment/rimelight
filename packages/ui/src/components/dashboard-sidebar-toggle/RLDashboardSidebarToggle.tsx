import type { Component } from "solid-js";
import type { RLDashboardSidebarToggleProps } from "./dashboard-sidebar-toggle.types";
import { RLDashboardSidebarToggleTheme } from "./dashboard-sidebar-toggle.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon"] as const;

export const RLDashboardSidebarToggle: Component<RLDashboardSidebarToggleProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLDashboardSidebarToggleTheme.setup(props, {
    as: "button",
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      type="button"
      data-dashboard-toggle="mobile"
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      aria-label={uiT("sidebar.toggle")}
      {...rest}
    >
      <RLIcon name={props.icon || "menu"} class="size-5" />
      {children()}
    </Tag>
  );
};

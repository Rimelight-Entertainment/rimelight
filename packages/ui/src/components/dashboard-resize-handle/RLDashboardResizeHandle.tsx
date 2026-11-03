import type { Component } from "solid-js";
import type { RLDashboardResizeHandleProps } from "./dashboard-resize-handle.types";
import { RLDashboardResizeHandleTheme } from "./dashboard-resize-handle.theme";

export const RLDashboardResizeHandle: Component<RLDashboardResizeHandleProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLDashboardResizeHandleTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} role="separator" {...rest}>
      {children()}
    </Tag>
  );
};

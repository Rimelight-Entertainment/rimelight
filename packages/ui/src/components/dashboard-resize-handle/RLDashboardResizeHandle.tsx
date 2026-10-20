import type { Component } from "solid-js";
import type { RLDashboardResizeHandleProps } from "./dashboard-resize-handle.types";
import { RLDashboardResizeHandleTheme } from "./dashboard-resize-handle.theme";

export const RLDashboardResizeHandle: Component<RLDashboardResizeHandleProps> = (props) => {
  const { Tag, classes, rest } = RLDashboardResizeHandleTheme.setup(props);

  return (
    <Tag data-slot="root" class={classes().root} role="separator" {...rest}>
      {props.children}
    </Tag>
  );
};

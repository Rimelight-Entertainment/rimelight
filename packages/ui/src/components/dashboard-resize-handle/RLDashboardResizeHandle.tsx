import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";
import type { DashboardResizeHandleProps } from "./dashboard-resize-handle";
import { dashboardResizeHandleTheme } from "./dashboard-resize-handle.theme";

export interface RLDashboardResizeHandleProps extends DashboardResizeHandleProps {
  children?: JSX.Element;
}

export const RLDashboardResizeHandle: Component<RLDashboardResizeHandleProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  const Tag = () => props.as || "div";

  const resolvedClasses = createMemo(() =>
    dashboardResizeHandleTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Dynamic
      component={Tag()}
      data-slot="root"
      class={resolvedClasses().root}
      role="separator"
      {...rest}
    >
      {props.children}
    </Dynamic>
  );
};

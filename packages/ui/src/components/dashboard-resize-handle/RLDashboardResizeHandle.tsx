import type { RLDashboardResizeHandleProps } from "./dashboard-resize-handle.types";
import { RLDashboardResizeHandleTheme } from "./dashboard-resize-handle.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLDashboardResizeHandle: Component<RLDashboardResizeHandleProps> = (props) => {
  const rest = omit(props, "as", "ui", "class", "children");

  const Root = dynamic(() => props.as ?? "div");

  const classes = createMemo(() =>
    RLDashboardResizeHandleTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Root data-slot="root" class={classes().root} role="separator" {...rest}>
      {props.children}
    </Root>
  );
};

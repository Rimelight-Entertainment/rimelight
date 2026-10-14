import type { RLDashboardResizeHandleProps } from "./dashboard-resize-handle.types";
import { RLDashboardResizeHandleTheme } from "./dashboard-resize-handle.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLDashboardResizeHandle: Component<RLDashboardResizeHandleProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  const Root = dynamic(() => props.as ?? "div");

  const resolvedClasses = createMemo(() =>
    RLDashboardResizeHandleTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Root data-slot="root" class={resolvedClasses().root} role="separator" {...rest}>
      {props.children}
    </Root>
  );
};

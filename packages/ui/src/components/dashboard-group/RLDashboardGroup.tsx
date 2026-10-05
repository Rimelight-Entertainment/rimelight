import type { RLDashboardGroupProps } from "./dashboard-group.types";
import { RLDashboardGroupTheme } from "./dashboard-group.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLDashboardGroup: Component<RLDashboardGroupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLDashboardGroupTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  // Hoisted per instance (<Dynamic> is deprecated: it rebuilds a fresh
  // factory at every call site). Collapses the old if/else into one return.
  const GroupTag = dynamic(() => props.as ?? "div");

  return (
    <GroupTag class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </GroupTag>
  );
};

import type { Component } from "solid-js";
import type { RLDashboardToolbarProps } from "./dashboard-toolbar.types";
import { RLDashboardToolbarTheme } from "./dashboard-toolbar.theme";

export const RLDashboardToolbar: Component<RLDashboardToolbarProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDashboardToolbarTheme.setup(props, {
    slots: ["leadingSlot", "trailingSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children() ?? (
        <>
          <div data-slot="leading" class={classes().leading}>
            {slots.leadingSlot()}
          </div>
          <div data-slot="trailing" class={classes().trailing}>
            {slots.trailingSlot()}
          </div>
        </>
      )}
    </Tag>
  );
};

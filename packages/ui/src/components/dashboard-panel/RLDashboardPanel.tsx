import type { Component } from "solid-js";
import type { RLDashboardPanelProps } from "./dashboard-panel.types";
import { RLDashboardPanelTheme } from "./dashboard-panel.theme";
import { Show } from "solid-js";

export const RLDashboardPanel: Component<RLDashboardPanelProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDashboardPanelTheme.setup(props, {
    slots: ["headerSlot", "bodySlot", "footerSlot", "resizeHandleSlot"] as const,
  });

  return (
    <>
      <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
        {slots.headerSlot()}

        <div data-slot="body" class={classes().body}>
          {slots.bodySlot() ?? children()}
        </div>

        {slots.footerSlot()}
      </Tag>

      <Show when={props.resizable}>
        {slots.resizeHandleSlot() ?? <div data-slot="handle" class={classes().handle} />}
      </Show>
    </>
  );
};
